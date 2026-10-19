/** Offline recovery only. This is not a server sync or backup. */
export type Manuscript = { id: string; title: string; body: string; revision: number; updatedAt: string };
export type ManuscriptRevision = Manuscript & { key?: number };
const DB_NAME = 'darkwessos-story-recovery-v1';
const DOC = 'book-i';
const DB_VERSION = 2;
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB nije dostupan.')); return; }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('sync')) db.createObjectStore('sync', {keyPath:'id'});
      if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('revisions')) {
        const revisions = db.createObjectStore('revisions', { keyPath: 'key', autoIncrement: true });
        revisions.createIndex('documentId', 'id');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Neuspjelo otvaranje baze.'));
    request.onblocked = () => reject(new Error('Baza je zaključana u drugom tabu.'));
  });
}
function transact<T>(db: IDBDatabase, mode: IDBTransactionMode, stores: string[], action: (tx: IDBTransaction, resolveValue: (v:T)=>void)=>void): Promise<T> {
  return new Promise((resolve, reject) => {
    let value: T;
    let hasValue = false;
    const tx = db.transaction(stores, mode);
    tx.oncomplete = () => { if (hasValue) resolve(value); else reject(new Error('Operacija nije vratila rezultat.')); };
    tx.onerror = () => reject(tx.error ?? new Error('Greška pohrane.'));
    tx.onabort = () => reject(tx.error ?? new Error('Spremanje je prekinuto.'));
    try { action(tx, (v:T)=>{value=v;hasValue=true;}); } catch(e) { try {tx.abort();} catch {} reject(e); }
  });
}
export const initialManuscript: Manuscript = {id:DOC,title:'Knjiga I',body:'',revision:0,updatedAt:''};
export async function loadManuscript(): Promise<Manuscript> {
  const db=await openDatabase();
  try { return await transact<Manuscript>(db,'readonly',['documents'],(tx,done)=>{
    const req=tx.objectStore('documents').get(DOC);
    req.onsuccess=()=>done(req.result ?? initialManuscript);
  }); } finally { db.close(); }
}
export async function saveManuscript(title:string,body:string,expectedRevision:number): Promise<Manuscript> {
  const db=await openDatabase();
  try { return await transact<Manuscript>(db,'readwrite',['documents','revisions'],(tx,done)=>{
    const documents=tx.objectStore('documents');
    const req=documents.get(DOC);
    req.onsuccess=()=>{
      const current:Manuscript=req.result ?? initialManuscript;
      if (current.revision!==expectedRevision) {done(current);tx.abort();return;}
      if (current.title===title && current.body===body) {done(current);return;}
      const next:Manuscript={id:DOC,title,body,revision:current.revision+1,updatedAt:new Date().toISOString()};
      documents.put(next);tx.objectStore('revisions').add(next);done(next);
    };
  }); } catch(e) { if(e instanceof DOMException && e.name==='AbortError') throw new Error('Konflikt: dokument je promijenjen u drugom tabu. Sačuvaj svoj tekst izvozom prije osvježavanja.');throw e; } finally {db.close();}
}
export async function listRevisions():Promise<ManuscriptRevision[]> {
  const db=await openDatabase();
  try{return await transact<ManuscriptRevision[]>(db,'readonly',['revisions'],(tx,done)=>{
    const req=tx.objectStore('revisions').index('documentId').getAll(DOC);
    req.onsuccess=()=>done((req.result as ManuscriptRevision[]).sort((a,b)=>b.revision-a.revision));
  });}finally{db.close();}
}
/** The last acknowledged server revision is local recovery metadata, not a server claim. */
export type SyncCheckpoint = {id:string; serverRevision:number; title:string; body:string; pendingOperationId?:string; pendingTitle?:string; pendingBody?:string; pendingExpectedRevision?:number};
export async function loadSyncCheckpoint():Promise<SyncCheckpoint|null>{
 const db=await openDatabase();try{return await transact<SyncCheckpoint|null>(db,'readonly',['sync'],(tx,done)=>{
 const req=tx.objectStore('sync').get(DOC);req.onsuccess=()=>done(req.result??null);
 });}finally{db.close();}
}
export async function saveSyncCheckpoint(checkpoint:SyncCheckpoint):Promise<void>{
 const db=await openDatabase();try{return await transact<void>(db,'readwrite',['sync'],(tx,done)=>{
 tx.objectStore('sync').put(checkpoint);done(undefined);
 });}finally{db.close();}
}
