import type {Manuscript} from './manuscriptStore';
export class StoryApiError extends Error {constructor(public status:number,message:string,public current?:Manuscript){super(message);}}
async function request<T>(path:string,init:RequestInit={}):Promise<T>{
 let response:Response;
 try{response=await fetch('/api'+path,{...init,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Story-Request':'1',...init.headers}});}catch{throw new StoryApiError(0,'Server nije dostupan. Lokalni tekst je zadržan.');}
 const data=await response.json().catch(()=>({error:'Invalid server response'}));
 if(!response.ok)throw new StoryApiError(response.status,data.error||'Greška servera',data.current);
 return data as T;
}
export const storyApi={
 login:(password:string)=>request<{ok:boolean}>('/login',{method:'POST',body:JSON.stringify({password})}),
 logout:()=>request<{ok:boolean}>('/logout',{method:'POST'}),
 load:()=>request<Manuscript>('/story/book-i'),
 save:(title:string,body:string,expectedRevision:number,operationId:string)=>request<Manuscript>('/story/book-i',{method:'PUT',body:JSON.stringify({title,body,expectedRevision,operationId})}),
 revisions:()=>request<{revisions:Manuscript[]}>('/story/book-i/revisions')
};
