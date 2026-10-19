import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';

const dbPath = resolve(process.env.STORY_DB_PATH || './data/story.sqlite');
const webRoot = resolve('./dist');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json; charset=utf-8','.woff2':'font/woff2'};
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS documents(id TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS revisions(document_id TEXT NOT NULL, revision INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(document_id,revision), FOREIGN KEY(document_id) REFERENCES documents(id));
CREATE TABLE IF NOT EXISTS operations(document_id TEXT NOT NULL, operation_id TEXT NOT NULL, payload_hash TEXT NOT NULL, result_json TEXT NOT NULL, PRIMARY KEY(document_id,operation_id));
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, expires_at INTEGER NOT NULL);`);
db.prepare('INSERT OR IGNORE INTO schema_migrations(version) VALUES (1)').run();
const password = process.env.STORY_PASSWORD;
if (!password || password.length < 12) { console.error('Set STORY_PASSWORD (at least 12 characters).'); process.exit(1); }
const port = Number(process.env.PORT || 8787);
const initial = { id: 'book-i', title: 'Knjiga I', body: '', revision: 0, updatedAt: '' };
const get = db.prepare('SELECT id,title,body,revision,updated_at AS updatedAt FROM documents WHERE id=?');
const revisions = db.prepare('SELECT document_id AS documentId,revision,title,body,updated_at AS updatedAt FROM revisions WHERE document_id=? ORDER BY revision DESC LIMIT 200');
const opGet = db.prepare('SELECT payload_hash AS hash,result_json AS result FROM operations WHERE document_id=? AND operation_id=?');
const opAdd = db.prepare('INSERT INTO operations(document_id,operation_id,payload_hash,result_json) VALUES (?,?,?,?)');
const docInsert = db.prepare('INSERT INTO documents(id,title,body,revision,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,body=excluded.body,revision=excluded.revision,updated_at=excluded.updated_at');
const revAdd = db.prepare('INSERT INTO revisions(document_id,revision,title,body,updated_at) VALUES (?,?,?,?,?)');
const sessAdd = db.prepare('INSERT INTO sessions(token_hash,expires_at) VALUES (?,?)');
const sessGet = db.prepare('SELECT expires_at AS expiresAt FROM sessions WHERE token_hash=?');
const sessDel = db.prepare('DELETE FROM sessions WHERE token_hash=?');
const hash = x => scryptSync(x, 'darkwessos-story-v1', 32).toString('hex');
const secureEq = (a,b) => { const aa=Buffer.from(hash(a),'hex'),bb=Buffer.from(hash(b),'hex');return timingSafeEqual(aa,bb); };
const json = (res,code,data,headers={})=>{res.writeHead(code,{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers});res.end(JSON.stringify(data));};
const cookies = req=>Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=').map(decodeURIComponent)).filter(x=>x.length===2));
const sessionHash=req=>{const t=cookies(req).story_session;return t&&/^[a-f0-9]{64}$/.test(t)?hash(t):null;};
const authed=req=>{const h=sessionHash(req);if(!h)return false;const s=sessGet.get(h);return !!s&&s.expiresAt>Date.now();};
const readBody=async req=>{let s='';for await(const chunk of req){s+=chunk;if(s.length>3_000_000)throw Object.assign(new Error('Payload too large'),{status:413});}return JSON.parse(s||'{}');};
const sameOrigin=req=>{const origin=req.headers.origin;const host=req.headers.host;return !origin || (host&&new URL(origin).host===host);};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`);
  if(url.pathname==='/api/health'&&req.method==='GET')return json(res,200,{ok:true});
  if(!url.pathname.startsWith('/api/')) {
    if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed'});
    let pathname; try { pathname=decodeURIComponent(url.pathname); } catch {return json(res,400,{error:'Invalid path'});}
    const filePath=resolve(webRoot,'.'+pathname);
    if(filePath!==webRoot&&!filePath.startsWith(webRoot+sep))return json(res,403,{error:'Forbidden'});
    let target=filePath;
    try { if(!statSync(target).isFile())target=resolve(webRoot,'index.html'); } catch {target=resolve(webRoot,'index.html');}
    try { const bytes=readFileSync(target);res.writeHead(200,{'content-type':mime[extname(target)]||'application/octet-stream','x-content-type-options':'nosniff','cache-control':target.endsWith('index.html')?'no-cache':'public, max-age=3600'});return res.end(req.method==='HEAD'?undefined:bytes); } catch {return json(res,503,{error:'Web build missing'});}
  }
  if(!sameOrigin(req))return json(res,403,{error:'Origin rejected'});
  if(url.pathname==='/api/login'&&req.method==='POST'){
    const body=await readBody(req);
    if(typeof body.password!=='string'||!secureEq(body.password,password))return json(res,401,{error:'Invalid credentials'});
    const token=randomBytes(32).toString('hex');sessAdd.run(hash(token),Date.now()+7*86400000);
    return json(res,200,{ok:true},{'set-cookie':`story_session=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=604800${process.env.STORY_SECURE_COOKIE==='1'?'; Secure':''}`});
  }
  if(!authed(req))return json(res,401,{error:'Authentication required'});
  if(url.pathname==='/api/logout'&&req.method==='POST'){const h=sessionHash(req);if(h)sessDel.run(h);return json(res,200,{ok:true},{'set-cookie':'story_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0'});}
  if(url.pathname==='/api/story/book-i'&&req.method==='GET')return json(res,200,get.get('book-i')||initial);
  if(url.pathname==='/api/story/book-i/revisions'&&req.method==='GET')return json(res,200,{revisions:revisions.all('book-i')});
  if(url.pathname==='/api/story/book-i'&&req.method==='PUT'){
   if(req.headers['x-story-request']!=='1')return json(res,403,{error:'Missing CSRF header'});
   const b=await readBody(req);
   if(typeof b.title!=='string'||typeof b.body!=='string'||!Number.isSafeInteger(b.expectedRevision)||b.expectedRevision<0||typeof b.operationId!=='string'||! /^[0-9a-f-]{36}$/i.test(b.operationId)||b.title.length>500||b.body.length>2_000_000)return json(res,400,{error:'Invalid payload'});
   const payloadHash=hash(JSON.stringify([b.title,b.body,b.expectedRevision]));
   db.exec('BEGIN IMMEDIATE');
   try{
    const previous=opGet.get('book-i',b.operationId);
    if(previous){db.exec('COMMIT');return previous.hash===payloadHash?json(res,200,JSON.parse(previous.result)):json(res,409,{error:'Operation ID reused with different content'});}
    const current=get.get('book-i')||initial;
    if(current.revision!==b.expectedRevision){db.exec('COMMIT');return json(res,409,{error:'Revision conflict',current});}
    const result=current.title===b.title&&current.body===b.body?current:{id:'book-i',title:b.title,body:b.body,revision:current.revision+1,updatedAt:new Date().toISOString()};
    if(result!==current){docInsert.run(result.id,result.title,result.body,result.revision,result.updatedAt);revAdd.run(result.id,result.revision,result.title,result.body,result.updatedAt);}
    opAdd.run('book-i',b.operationId,payloadHash,JSON.stringify(result));db.exec('COMMIT');return json(res,200,result);
   }catch(e){db.exec('ROLLBACK');throw e;}
  }
  return json(res,404,{error:'Not found'});
 }catch(e){return json(res,e.status||500,{error:e.status?e.message:'Internal server error'});}
});
server.listen(port,process.env.STORY_BIND_HOST || '0.0.0.0',()=>console.log(`STORY API listening on port ${port}`));
