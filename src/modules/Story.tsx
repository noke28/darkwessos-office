import {useEffect,useRef,useState} from 'react';
import {initialManuscript,listRevisions,loadManuscript,saveManuscript,loadSyncCheckpoint,saveSyncCheckpoint} from '../lib/manuscriptStore';
import {storyApi,StoryApiError} from '../lib/storyApi';
import {createOperationId} from '../lib/operationId';
import {cloudConfigured,currentUser,signIn,signUp,signOut,getRemote,createRemote,updateRemote} from '../lib/supabaseStory';
import type {ManuscriptRevision} from '../lib/manuscriptStore';
type SaveState='učitavanje'|'lokalno sačuvano'|'nespremljene izmjene'|'spremanje'|'greška';
function downloadMarkdown(title:string,body:string){
  const blob=new Blob([body],{type:'text/markdown;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=(title.trim().replace(/[^\p{L}\p{N}._-]+/gu,'-')||'rukopis')+'.md';
  a.click();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function Story(){
  const [title,setTitle]=useState(initialManuscript.title);
  const [body,setBody]=useState('');
  const [status,setStatus]=useState<SaveState>('učitavanje');
  const [error,setError]=useState('');
  const [revisions,setRevisions]=useState<ManuscriptRevision[]>([]);
  const [ready,setReady]=useState(false);
  const [showHistory,setShowHistory]=useState(false);
  const cloudSyncEnabled=import.meta.env.VITE_STORY_API_ENABLED==='true';
  const [password,setPassword]=useState('');
  const [email,setEmail]=useState('');
  const [cloudUser,setCloudUser]=useState(currentUser());
  const [cloudBusy,setCloudBusy]=useState(false);
  const [cloudMessage,setCloudMessage]=useState('');
  const [serverStatus,setServerStatus]=useState('nije povezano');
  const [serverError,setServerError]=useState('');
  const [remoteConflict,setRemoteConflict]=useState(false);
  const revisionRef=useRef(0);
  const latestRef=useRef({title:initialManuscript.title,body:''});
  const savedRef=useRef({title:initialManuscript.title,body:''});
  const inFlightRef=useRef(false);
  const statusRef=useRef<SaveState>('učitavanje');
  function changeStatus(next:SaveState){statusRef.current=next;setStatus(next);}
  useEffect(()=>{let cancelled=false;
    loadManuscript().then(doc=>{if(cancelled)return;setTitle(doc.title);setBody(doc.body);latestRef.current={title:doc.title,body:doc.body};savedRef.current={title:doc.title,body:doc.body};revisionRef.current=doc.revision;changeStatus('lokalno sačuvano');setReady(true);})
      .catch(e=>{if(cancelled)return;setError(String(e));changeStatus('greška');});
    return()=>{cancelled=true;};
  },[]);
  useEffect(()=>{latestRef.current={title,body};if(!ready)return;
    if(title!==savedRef.current.title||body!==savedRef.current.body)changeStatus('nespremljene izmjene');
    const timer=window.setTimeout(()=>{void persist();},650);
    return()=>window.clearTimeout(timer);
  },[title,body,ready]);
  async function persist(){
    if(!ready||inFlightRef.current)return;
    const snapshot={...latestRef.current};
    if(snapshot.title===savedRef.current.title&&snapshot.body===savedRef.current.body)return;
    inFlightRef.current=true;changeStatus('spremanje');setError('');
    try{
      const doc=await saveManuscript(snapshot.title,snapshot.body,revisionRef.current);
      revisionRef.current=doc.revision;savedRef.current=snapshot;
      if(latestRef.current.title===snapshot.title&&latestRef.current.body===snapshot.body)changeStatus('lokalno sačuvano');
      else changeStatus('nespremljene izmjene');
      if(showHistory)setRevisions(await listRevisions());
    }catch(e){setError(e instanceof Error?e.message:String(e));changeStatus('greška');}
    finally{inFlightRef.current=false;
      if(statusRef.current==='nespremljene izmjene')window.setTimeout(()=>{void persist();},0);
    }
  }
  async function connectServer(){
    setServerError('');setServerStatus('povezivanje');
    try{await storyApi.login(password);setPassword('');setServerStatus('povezano — nije sinhronizovano');}
    catch(e){setServerStatus('nije povezano');setServerError(e instanceof Error?e.message:String(e));}
  }
  async function syncServer(){
    if(!ready||status!=='lokalno sačuvano'){setServerError('Prvo sačuvaj lokalne izmjene.');return;}
    setServerStatus('sinhronizacija');setServerError('');setRemoteConflict(false);
    try{
      const local=await loadManuscript();
      const checkpoint=await loadSyncCheckpoint();
      const remote=await storyApi.load();
      // Never overwrite a local draft from the server. Explicit export is always available.
      if(checkpoint && !checkpoint.pendingOperationId && remote.revision!==checkpoint.serverRevision){
        setRemoteConflict(true);setServerStatus('konflikt');setServerError('Server se promijenio. Lokalni tekst je zadržan; izvezi ga prije ručnog usklađivanja.');return;
      }
      if(!checkpoint && remote.revision!==0){
        setRemoteConflict(true);setServerStatus('konflikt');setServerError('Server već sadrži rukopis. Automatsko prepisivanje nije dozvoljeno.');return;
      }
      if(checkpoint && local.title===checkpoint.title && local.body===checkpoint.body && !checkpoint.pendingOperationId){
        setServerStatus('potvrđeno na serveru');return;
      }
      const expectedRevision=checkpoint?.pendingExpectedRevision??checkpoint?.serverRevision??0;
      const operationId=checkpoint?.pendingOperationId??createOperationId();
      const payloadTitle=checkpoint?.pendingTitle??local.title;
      const payloadBody=checkpoint?.pendingBody??local.body;
      // Persist idempotency key BEFORE the network request; safe to retry after a timeout.
      if(!checkpoint?.pendingOperationId)await saveSyncCheckpoint({id:'book-i',serverRevision:expectedRevision,title:checkpoint?.title??remote.title,body:checkpoint?.body??remote.body,pendingOperationId:operationId,pendingTitle:payloadTitle,pendingBody:payloadBody,pendingExpectedRevision:expectedRevision});
      const result=await storyApi.save(payloadTitle,payloadBody,expectedRevision,operationId);
      await saveSyncCheckpoint({id:'book-i',serverRevision:result.revision,title:result.title,body:result.body});
      const latest=await loadManuscript();
      if(latest.title===result.title&&latest.body===result.body)setServerStatus('potvrđeno na serveru');
      else setServerStatus('lokalne izmjene čekaju novu sinhronizaciju');
    }catch(e){
      if(e instanceof StoryApiError&&e.status===409){setRemoteConflict(true);setServerStatus('konflikt');}
      else setServerStatus('greška — lokalni tekst ostaje');
      setServerError(e instanceof Error?e.message:String(e));
    }
  }
  async function cloudLogin(register:boolean){setCloudBusy(true);setCloudMessage('');try{if(register){const active=await signUp(email,password);setCloudMessage(active?'Račun kreiran i prijavljen.':'Provjeri e-mail i potvrdi račun prije prijave.');}else{await signIn(email,password);setCloudMessage('Prijava uspješna.');}setCloudUser(currentUser());setPassword('');}catch(e){setCloudMessage(String(e));}finally{setCloudBusy(false);}}
  async function cloudSync(){
    if(!ready||status!=='lokalno sačuvano'){setCloudMessage('Prvo spremi lokalni tekst.');return;}
    setCloudBusy(true);setCloudMessage('Provjeravam cloud verziju…');
    try{
      const local=await loadManuscript();const remote=await getRemote();const owner=currentUser()?.id;
      if(!owner)throw new Error('Prijava je istekla.');
      const key='darkwessos-cloud-checkpoint:'+owner;
      const checkpoint=JSON.parse(localStorage.getItem(key)||'null') as {id:string;revision:number;title:string;content:string}|null;
      if(!remote){
        if(checkpoint)throw new Error('Raniji cloud dokument nije pronađen. Automatsko kreiranje je zaustavljeno.');
        const saved=await createRemote(local.title,local.body);
        localStorage.setItem(key,JSON.stringify({id:saved.id,revision:saved.revision,title:saved.title,content:saved.content}));
        setCloudMessage('Prva kopija uspješno pohranjena u cloud.');return;
      }
      if(!checkpoint){setCloudMessage('Cloud već sadrži rukopis. Nije prepisan ni lokalni ni udaljeni tekst. Izvezi lokalni .md i ručno uskladi verzije.');return;}
      if(checkpoint.id!==remote.id||checkpoint.revision!==remote.revision||checkpoint.title!==remote.title||checkpoint.content!==remote.content){setCloudMessage('KONFLIKT: cloud je promijenjen. Lokalni rukopis je sačuvan; nema automatskog prepisivanja.');return;}
      if(checkpoint.title===local.title&&checkpoint.content===local.body){setCloudMessage('Lokalni i cloud rukopis su usklađeni.');return;}
      const saved=await updateRemote(remote,local.title,local.body);
      localStorage.setItem(key,JSON.stringify({id:saved.id,revision:saved.revision,title:saved.title,content:saved.content}));
      setCloudMessage('Nova verzija uspješno sinhronizovana.');
    }catch(e){setCloudMessage('Sinhronizacija nije uspjela. Lokalni tekst ostaje sačuvan. '+String(e));}finally{setCloudBusy(false);}
  }
  async function toggleHistory(){if(showHistory){setShowHistory(false);return;}
    try{setRevisions(await listRevisions());setShowHistory(true);}catch(e){setError(String(e));changeStatus('greška');}
  }
  async function restore(rev:ManuscriptRevision){
    if(status!=='lokalno sačuvano'){setError('Prvo spremi ili izvezi nespremljeni tekst.');return;}
    if(!window.confirm(`Vratiti sadržaj revizije ${rev.revision}? Trenutni tekst ostaje u historiji.`))return;
    setTitle(rev.title);setBody(rev.body);latestRef.current={title:rev.title,body:rev.body};
    changeStatus('nespremljene izmjene');
  }
  return <section className="story-editor">
    <div className="eyebrow">STORY / MANUSCRIPT · RADNO / NON-AUTHORITY</div>
    <h1>Knjiga I</h1>
    <p className="muted">Rukopis je odvojen od kanona. Lokalni autosave u IndexedDB je uvijek aktivan; privatna cloud kopija je opcionalna i zahtijeva prijavu.</p>
    {cloudConfigured&&<div className="panel">
      <h2>Supabase · privatna cloud kopija</h2>
      <p className="muted">Offline pisanje ostaje lokalno. Sinhronizacija se pokreće ručno i nikada ne prepisuje različite verzije automatski.</p>
      {!cloudUser?<div className="story-toolbar">
        <input type="email" aria-label="E-mail za Supabase" placeholder="E-mail" value={email} onChange={e=>setEmail(e.target.value)}/>
        <input type="password" aria-label="Supabase lozinka" placeholder="Lozinka" value={password} onChange={e=>setPassword(e.target.value)}/>
        <button type="button" disabled={cloudBusy||!email||!password} onClick={()=>void cloudLogin(false)}>Prijava</button>
        <button type="button" disabled={cloudBusy||!email||password.length<8} onClick={()=>void cloudLogin(true)}>Napravi račun</button>
      </div>:<div className="story-toolbar"><span>{cloudUser.email||'Prijavljen korisnik'}</span><button type="button" disabled={cloudBusy||status!=='lokalno sačuvano'} onClick={()=>void cloudSync()}>Sinhronizuj u cloud</button><button type="button" disabled={cloudBusy} onClick={()=>void signOut().then(()=>{setCloudUser(null);setCloudMessage('Odjavljen.');})}>Odjava</button></div>}
      {cloudMessage&&<p role="status">{cloudMessage}</p>}
    </div>}
    {cloudSyncEnabled&&<div className="panel">
      <h2>Serverska pohrana · zaseban API</h2>
      <p className="muted">Status: {serverStatus}. Lokalni IndexedDB ostaje zasebna sigurnosna kopija za oporavak; sinhronizacija je ručna.</p>
      <div className="story-toolbar">
        <input type="password" autoComplete="current-password" aria-label="STORY lozinka" placeholder="STORY lozinka" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="button" onClick={()=>void connectServer()}>Prijavi se</button>
        <button type="button" disabled={!ready||status!=='lokalno sačuvano'||serverStatus==='sinhronizacija'} onClick={()=>void syncServer()}>Sinhronizuj na server</button>
      </div>
      {serverError&&<p role="alert" className="error">{serverError}</p>}
      {remoteConflict&&<p className="muted">Konflikt zahtijeva ručno usklađivanje; ništa nije automatski prebrisano.</p>}
    </div>}
    <div className="story-toolbar">
      <span role="status" aria-live="polite">{status}</span>
      <button type="button" onClick={()=>void persist()} disabled={!ready||status==='spremanje'}>Spremi lokalno</button>
      <button type="button" onClick={()=>downloadMarkdown(title,body)} disabled={!ready}>Izvezi .md</button>
      <button type="button" onClick={()=>void toggleHistory()} disabled={!ready}>{showHistory?'Zatvori historiju':'Historija'}</button>
    </div>
    {error&&<p className="error" role="alert">{error} — Po potrebi odmah izvezi tekst.</p>}
    <label className="story-label" htmlFor="story-title">Naslov rukopisa</label>
    <input id="story-title" className="story-title" value={title} onChange={e=>setTitle(e.target.value)} disabled={!ready} />
    <label className="story-label" htmlFor="story-body">Tekst rukopisa (Markdown)</label>
    <textarea id="story-body" className="story-body" value={body} onChange={e=>setBody(e.target.value)} disabled={!ready} placeholder="Počni pisati..." spellCheck />
    <p className="muted">{body.trim()?body.trim().split(/\s+/u).length:0} riječi · lokalni radni rukopis</p>
    {showHistory&&<div className="panel"><h2>Historija lokalnih revizija</h2>
      {revisions.length===0?<p className="muted">Još nema spremljenih revizija.</p>:<div className="story-history">{revisions.map(rev=><div key={rev.revision} className="story-revision"><span>Revizija {rev.revision} · {new Date(rev.updatedAt).toLocaleString('bs-BA')}</span><button type="button" onClick={()=>void restore(rev)}>Vrati</button></div>)}</div>}
    </div>}
  </section>;
}
