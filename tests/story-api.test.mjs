import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
test('SQLite STORY API: authentication, immutable history, idempotency, conflict',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'story-api-'));
 const port=18000+Math.floor(Math.random()*1000);
 const child=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),env:{...process.env,PORT:String(port),STORY_DB_PATH:join(dir,'story.sqlite'),STORY_PASSWORD:'test-password-123456'},stdio:'ignore'});
 const base=`http://127.0.0.1:${port}`;
 async function call(path,method='GET',body, cookie='') {return fetch(base+path,{method,headers:{'content-type':'application/json','x-story-request':'1',cookie},body:body?JSON.stringify(body):undefined});}
 try{
  let ready=false;for(let i=0;i<80;i++){try{const r=await call('/api/health');if(r.ok){ready=true;break;}}catch{}await delay(50);}assert.equal(ready,true,'API started');
  assert.equal((await call('/api/story/book-i')).status,401);
  assert.equal((await call('/api/login','POST',{password:'bad'})).status,401);
  const login=await call('/api/login','POST',{password:'test-password-123456'});assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const start=await call('/api/story/book-i','GET',undefined,cookie);assert.equal((await start.json()).revision,0);
  const op={title:'Knjiga I',body:'Tekst A',expectedRevision:0,operationId:'00000000-0000-4000-8000-000000000001'};
  const saved=await call('/api/story/book-i','PUT',op,cookie);assert.equal(saved.status,200);assert.equal((await saved.json()).revision,1);
  const retry=await call('/api/story/book-i','PUT',op,cookie);assert.equal((await retry.json()).revision,1);
  const wrong=await call('/api/story/book-i','PUT',{...op,body:'Drugi tekst'},cookie);assert.equal(wrong.status,409);
  const conflict=await call('/api/story/book-i','PUT',{...op,operationId:'00000000-0000-4000-8000-000000000002',body:'Tekst B'},cookie);assert.equal(conflict.status,409);
  const history=await call('/api/story/book-i/revisions','GET',undefined,cookie);assert.equal((await history.json()).revisions.length,1);
  const updated=await call('/api/story/book-i','PUT',{...op,body:'Tekst B',expectedRevision:1,operationId:'00000000-0000-4000-8000-000000000003'},cookie);assert.equal((await updated.json()).revision,2);
  const hist=await call('/api/story/book-i/revisions','GET',undefined,cookie);assert.deepEqual((await hist.json()).revisions.map(x=>x.body),['Tekst B','Tekst A']);
 }finally{child.kill();rmSync(dir,{recursive:true,force:true});}
});
