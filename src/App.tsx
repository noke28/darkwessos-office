import {useEffect,useState} from 'react';
import Command from './modules/Command';import Story from './modules/Story';import Workshop from './modules/Workshop';import Archive from './modules/Archive';import Notes from './modules/Notes';
import type {CanonBundle} from './lib/canon';import {DRAFT_STORAGE_KEY,parseSavedDraft} from './lib/workflow';import type {Context,Draft} from './lib/workflow';
import {atlasPlaces} from './data/atlas';import {demoSources} from './data/demo';
type Page='command'|'story'|'workshop'|'archive'|'notes';
const tabs:[Page,string][]=[['command','Command'],['story','Story'],['workshop','Workshop'],['archive','Archive']];
export default function App(){
 const [page,setPage]=useState<Page>('command');const [bundle,setBundle]=useState<CanonBundle|null>(null);
 const [selected,setSelected]=useState<string|null>(null);const [locationId,setLocationId]=useState<string|null>(null);
 const [draft,setDraft]=useState<Draft>(()=>{
  try{return parseSavedDraft(window.localStorage.getItem(DRAFT_STORAGE_KEY))??{title:'',body:'',context:null};}
  catch{return {title:'',body:'',context:null};}
 });
 useEffect(()=>{try{window.localStorage.setItem(DRAFT_STORAGE_KEY,JSON.stringify(draft));}catch{/* Storage can be unavailable or full; manual export remains available. */}},[draft]);
 const go=(p:string)=>setPage(p as Page);
 function openSource(location_id:string,source_id:string){setLocationId(location_id);setSelected(source_id);setPage('archive');}
 function develop(source_id:string){const loc=atlasPlaces.find(p=>p.location_id===locationId&&p.source_id===source_id);
 const source=bundle?.sources.find(s=>s.source_id===source_id)??demoSources.find(s=>s.source_id===source_id);
 const context:Context|null=source?{location_id:loc?.location_id??'',location_name:loc?.name??'(nije odabrana)',source_id:source.source_id,source_name:source.path,source_status:source.status,...(source.revision_id?{revision_id:source.revision_id}:{})}:null;
 setDraft(d=>({...d,context}));setPage('notes');}
 return <div className="app"><aside className="sidebar"><div className="brand"><span className="brand-icon">✦</span><div><strong>DARKWESSOS</strong><small>LIVING STORY OFFICE · V1</small></div></div><nav aria-label="Glavna navigacija">{tabs.map(([key,label])=><button key={key} className={page===key?'active':''} onClick={()=>setPage(key)}>{label}</button>)}<button className={page==='notes'?'active':''} onClick={()=>setPage('notes')}>Radne ideje</button></nav><div className="side-foot">KENO · AUTOR<br/>KATE · DEVELOPMENT EDITOR</div></aside><div className="workspace"><header className="topbar"><span className="wordmark">DARKWESSOS <span> / 3.0</span></span><span className="status">LOCAL · READ ONLY CANON</span></header><main>{page==='command'?<Command go={go}/>:page==='story'?<Story/>:page==='workshop'?<Workshop selectedLocation={locationId} selectLocation={setLocationId} openSource={openSource}/>:page==='archive'?<Archive bundle={bundle} setBundle={setBundle} selected={selected} develop={develop}/>:<Notes draft={draft} setDraft={setDraft}/>}</main><footer>ŽIVI SVIJET · JEDNA PUSTOLOVINA · TEST BUILD</footer></div><nav className="bottom-nav" aria-label="Mobilna navigacija">{tabs.map(([key,label])=><button key={key} className={page===key?'active':''} onClick={()=>setPage(key)}>{label}</button>)}</nav></div>;
}
