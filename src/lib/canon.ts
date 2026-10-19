export type SourceRecord = {source_id:string;path:string;revision_id:string;content_hash?:string;status:string;content:string};
export type CanonBundle = {schema_version:1;repository:string;revision_id:string;sources:SourceRecord[]};
export function validateBundle(value:unknown):CanonBundle {
 if (!value || typeof value !== 'object') throw new Error('Paket nije JSON objekat.');
 const b=value as Partial<CanonBundle>;
 if(b.schema_version!==1 || typeof b.repository!=='string' || typeof b.revision_id!=='string' || !Array.isArray(b.sources)) throw new Error('Nepodržan format paketa.');
 if(!/^[0-9a-f]{40}$/i.test(b.revision_id)) throw new Error('revision_id mora biti puni Git commit SHA.');
 if(b.sources.length>300) throw new Error('Previše izvora.');
 const ids=new Set<string>();
 for(const s of b.sources){
  if(!s || typeof s.source_id!=='string'||typeof s.path!=='string'||typeof s.content!=='string'||typeof s.status!=='string'||s.revision_id!==b.revision_id) throw new Error('Neispravan zapis izvora.');
  if(ids.has(s.source_id)) throw new Error('Duplicirani source_id.'); ids.add(s.source_id);
  if(s.path.includes('..')||s.path.startsWith('/')) throw new Error('Neispravna putanja izvora.');
 }
 return b as CanonBundle;
}
export function resolveSource(bundle:CanonBundle|null,id:string){return bundle?.sources.find(s=>s.source_id===id)??null;}
export function downloadText(name:string,content:string){const blob=new Blob([content],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
