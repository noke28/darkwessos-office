/** TASK10: browser-only Supabase REST client. Publishable key only; RLS is mandatory. */
const endpoint=import.meta.env.VITE_SUPABASE_URL || 'https://tczanzbutocrkcghtrhq.supabase.co';
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_9mI_ETH7XGM58-F2j5frJw_5ccyNN5-';
const sessionKey='darkwessos-supabase-session-v1';
type Session={access_token:string;refresh_token:string;expires_at:number;user:{id:string;email?:string}};
export type RemoteStory={id:string;owner_id:string;title:string;content:string;revision:number;updated_at:string};
let session:Session|null=null;
try {session=JSON.parse(localStorage.getItem(sessionKey)||'null');} catch {session=null;}
export const cloudConfigured=Boolean(endpoint&&key);
export function currentUser(){return session?.user??null;}
function store(value:Session|null){session=value;if(value)localStorage.setItem(sessionKey,JSON.stringify(value));else localStorage.removeItem(sessionKey);}
async function request(path:string,method:string,body?:unknown,token?:string):Promise<any>{
 if(!cloudConfigured)throw new Error('Cloud pohrana nije konfigurisana.');
 const r=await fetch(endpoint+path,{method,headers:{apikey:key,Authorization:`Bearer ${token||key}`,...(body!==undefined?{'Content-Type':'application/json'}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){const err=await r.json().catch(()=>({}));throw new Error(err.message||err.msg||err.error_description||`Supabase HTTP ${r.status}`);}
 if(r.status===204)return null;
 const text=await r.text();return text?JSON.parse(text):null;
}
function acceptAuth(data:any){if(!data?.access_token||!data?.refresh_token||!data?.user?.id)throw new Error('Prijava nije potvrđena. Provjeri e-mail.');store({access_token:data.access_token,refresh_token:data.refresh_token,expires_at:Date.now()+(data.expires_in||3600)*1000,user:{id:data.user.id,email:data.user.email}});}
export async function signIn(email:string,password:string){acceptAuth(await request('/auth/v1/token?grant_type=password','POST',{email,password}));}
export async function signUp(email:string,password:string){const result=await request('/auth/v1/signup','POST',{email,password});if(result.access_token)acceptAuth(result);return Boolean(result.access_token);}
export async function signOut(){const token=session?.access_token;store(null);if(token)await request('/auth/v1/logout','POST',undefined,token).catch(()=>{});}
async function accessToken(){if(!session)throw new Error('Prvo se prijavi.');if(session.expires_at>Date.now()+60000)return session.access_token;
 const result=await request('/auth/v1/token?grant_type=refresh_token','POST',{refresh_token:session.refresh_token});acceptAuth(result);return session!.access_token;}
export async function getRemote():Promise<RemoteStory|null>{const token=await accessToken();const user=session!.user.id;const rows=await request(`/rest/v1/story_documents?select=id,owner_id,title,content,revision,updated_at&owner_id=eq.${encodeURIComponent(user)}&order=updated_at.desc&limit=1`,'GET',undefined,token);return rows[0]||null;}
export async function createRemote(title:string,content:string){const token=await accessToken();const user=session!.user.id;const r=await fetch(endpoint+'/rest/v1/story_documents',{method:'POST',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({owner_id:user,title,content})});if(!r.ok)throw new Error(`Cloud upis nije uspio (${r.status}).`);return (await r.json())[0] as RemoteStory;}
export async function updateRemote(remote:RemoteStory,title:string,content:string){const token=await accessToken();const r=await fetch(endpoint+`/rest/v1/story_documents?id=eq.${remote.id}&revision=eq.${remote.revision}&owner_id=eq.${session!.user.id}`,{method:'PATCH',headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({title,content,revision:remote.revision+1,updated_at:new Date().toISOString()})});if(!r.ok)throw new Error(`Cloud ažuriranje nije uspjelo (${r.status}).`);const rows=await r.json();if(rows.length!==1)throw new Error('Konflikt: server je promijenjen. Lokalni rukopis ostaje sačuvan.');return rows[0] as RemoteStory;}
