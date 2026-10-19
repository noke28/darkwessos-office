export type Context={location_id:string;location_name:string;source_id:string;source_name:string;source_status:string;revision_id?:string};
export type Draft={title:string;body:string;context:Context|null};
export function buildNote(d:Draft):string {return ['STATUS: RADNO','VRSTA: kreativni prijedlog — nije kanon',`NASLOV: ${d.title||'(bez naslova)'}`,`LOKACIJA: ${d.context?.location_name??'(nije odabrana)'}`,`location_id: ${d.context?.location_id??'(nema)'}`,`IZVOR: ${d.context?.source_name??'(nije odabran)'}`,`source_id: ${d.context?.source_id??'(nema)'}`,`STATUS IZVORA: ${d.context?.source_status??'NEPOZNAT'}`,...(d.context?.revision_id?[`revision_id: ${d.context.revision_id}`]:[]),'',d.body].join('\n')+'\n';}
export function buildKatePackage(d:Draft):string {return ['ZA KATE — UREDNIČKI PRIJEDLOG','Ovo je RADNO/TEST; nije verificirani kanon.','Nijedna ideja nije kanonska odluka.','',buildNote(d)].join('\n');}
export function lookupById<T extends {source_id:string}>(sources:T[],id:string|null):T|null{return sources.find(s=>s.source_id===id)??null;}

export const DRAFT_STORAGE_KEY='darkwessos:working-draft:v1';
export function parseSavedDraft(value:string|null):Draft|null {
 if(!value || value.length>1_000_000)return null;
 try {
  const d:unknown=JSON.parse(value);
  if(!d || typeof d!=='object')return null;
  const x=d as Record<string,unknown>;
  if(typeof x.title!=='string'||typeof x.body!=='string'||x.title.length>10000||x.body.length>500000)return null;
  let context:Context|null=null;
  if(x.context!==null && x.context!==undefined){
   if(typeof x.context!=='object')return null;
   const c=x.context as Record<string,unknown>;
   for(const key of ['location_id','location_name','source_id','source_name','source_status'])if(typeof c[key]!=='string')return null;
   if(c.revision_id!==undefined && typeof c.revision_id!=='string')return null;
   context={location_id:c.location_id as string,location_name:c.location_name as string,source_id:c.source_id as string,source_name:c.source_name as string,source_status:c.source_status as string,...(typeof c.revision_id==='string'?{revision_id:c.revision_id}:{})};
  }
  return {title:x.title,body:x.body,context};
 }catch{return null;}
}
