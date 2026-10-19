import {useState} from 'react';

const modules=[
 {key:'command',name:'COMMAND',icon:'▤',desc:'Odluke i zadaci',kind:'01'},
 {key:'story',name:'STORY',icon:'▥',desc:'Rukopis i scene',kind:'02'},
 {key:'workshop',name:'WORKSHOP',icon:'✧',desc:'Atlas i odnosi',kind:'03'},
 {key:'kate',name:'KATE LAB',icon:'✒',desc:'Urednička radionica',kind:'04'}
] as const;
const menu=[
 {name:'DARKWOOD',icon:'⌂',key:'command'},
 {name:'STORY',icon:'▥',key:'story'},
 {name:'WORKSHOP',icon:'✧',key:'workshop'},
 {name:'KATE LAB',icon:'✒',key:'kate'},
 {name:'ARCHIVE',icon:'▤',key:'archive'},
 {name:'Kanon',icon:'◇',key:'archive'},
 {name:'Likovi',icon:'♙',key:'workshop'},
 {name:'Geografija',icon:'△',key:'workshop'},
 {name:'Zadaci',icon:'☑',key:'notes'},
 {name:'Ideje',icon:'✎',key:'notes'}
] as const;
export default function Command({go}:{go:(s:string)=>void}){
 const [lab,setLab]=useState(false);
 const [note,setNote]=useState(()=>{try{return localStorage.getItem('darkwessos:quick-note')??''}catch{return ''}});
 const [saved,setSaved]=useState(false);
 const open=(key:string)=>{if(key==='kate'){setLab(v=>!v);return;}go(key)};
 const save=()=>{try{localStorage.setItem('darkwessos:quick-note',note);setSaved(true)}catch{setSaved(false)}};
 return <section className="dw-dashboard">
 <style>{`
 .dw-dashboard{--night:#0B1526;--fjord:#142840;--ice:#88C0D0;--gold:#D6A65C;color:#E8EEF2;max-width:1250px;margin:0 auto;font-family:system-ui,sans-serif}
 .dw-dashboard button{font:inherit;cursor:pointer}
 .dw-header{display:flex;align-items:center;gap:12px;padding:15px;border:1px solid #294560;border-radius:12px;background:linear-gradient(110deg,#0B1526,#173451 75%,#0B1526);margin-bottom:12px}
 .dw-compass{display:grid;place-items:center;flex-shrink:0;width:58px;height:58px;border:3px solid #D6A65C;border-radius:50%;background:radial-gradient(circle,#f0e0b6,#b78a4a);color:#142840;font-size:33px;box-shadow:0 0 0 3px #0b1728 inset}
 .dw-header h1{font:normal clamp(1.4rem,4vw,2.6rem) Georgia,serif;letter-spacing:.06em;margin:0;color:#F4EADC}
 .dw-header p{margin:4px 0 0;font-size:.68rem;letter-spacing:.19em;color:#88C0D0}
 .dw-layout{display:grid;grid-template-columns:190px minmax(0,1fr);gap:12px}
 .dw-menu{background:#0a1b30;border:1px solid #294560;border-radius:11px;padding:8px;display:flex;flex-direction:column;gap:3px;align-self:stretch}
 .dw-menu button{width:100%;display:flex;gap:9px;align-items:center;text-align:left;color:#c2d8ea;background:transparent;border:0;border-radius:7px;padding:11px 8px;font-size:.83rem;min-height:42px}
 .dw-menu button span{font-size:1.15rem;min-width:22px;text-align:center}
 .dw-menu button:first-child,.dw-menu button:hover,.dw-menu button:focus-visible{color:#D6A65C;background:#1a3046}
 .dw-menu button:first-child{border-left:3px solid #D6A65C}
 .dw-main{min-width:0}
 .dw-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .dw-card{position:relative;display:flex;flex-direction:column;justify-content:space-between;text-align:left;min-width:0;min-height:165px;padding:14px;border:1px solid #3a5b79;border-radius:10px;color:#f2eadb;background:linear-gradient(145deg,#1b3956,#0b1b2f 65%,#071321)}
 .dw-card:nth-child(2){background:linear-gradient(145deg,#3a3540,#142840 55%,#081625)}
 .dw-card:nth-child(3){background:linear-gradient(145deg,#224763,#10243b 55%,#081625)}
 .dw-card:nth-child(4){background:linear-gradient(145deg,#3d3440,#15283d 55%,#081625)}
 .dw-card:focus-visible,.dw-card:hover{outline:2px solid #D6A65C;outline-offset:1px}
 .dw-card .dw-number{font:normal .78rem Georgia,serif;color:#D6A65C}
 .dw-card .dw-icon{font-size:1.65rem;color:#D6A65C;line-height:1}
 .dw-card h2{font:normal clamp(1rem,2vw,1.4rem) Georgia,serif;margin:8px 0 4px;color:#F4EADC}
 .dw-card p{font-size:.77rem;color:#c4d7e7;line-height:1.35;margin:0;padding-right:12px}
 .dw-card .dw-next{position:absolute;right:12px;bottom:12px;color:#D6A65C}
 .dw-panels{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
 .dw-panel{border:1px solid #294560;background:#0b1c30;border-radius:10px;padding:12px;min-width:0}
 .dw-panel h3{font:normal .78rem Georgia,serif;letter-spacing:.05em;color:#D6A65C;margin:0 0 9px}
 .dw-panel p{font-size:.78rem;line-height:1.5;color:#b9cede;margin:0}
 .dw-panel strong{font-size:.95rem;font-weight:600;color:#e8eef2}
 .dw-panel button{margin-top:8px;border:1px solid #496d88;background:#152f48;color:#dcebf5;border-radius:7px;padding:9px 11px;font-size:.77rem;min-height:40px}
 .dw-panel textarea{width:100%;background:#091624;color:#e8eef2;border:1px solid #3a5874;border-radius:7px;resize:vertical;min-height:65px;padding:9px;font-size:.82rem}
 .dw-panel.wide{grid-column:1/-1}
 .dw-lab{margin-top:10px;border-color:#947449}
 .dw-lab p{margin-bottom:8px}
 .dw-actions{display:flex;gap:8px;flex-wrap:wrap}
 .dw-save{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
 .dw-save span{font-size:.7rem;color:#88C0D0}
 @media(max-width:740px){.dw-header{padding:10px;gap:9px}.dw-compass{width:45px;height:45px;font-size:25px;border-width:2px}.dw-header h1{font-size:clamp(1.15rem,5vw,1.7rem)}.dw-header p{font-size:.55rem;letter-spacing:.09em}.dw-layout{grid-template-columns:93px minmax(0,1fr);gap:7px}.dw-menu{padding:4px;gap:1px}.dw-menu button{min-height:41px;padding:7px 3px;font-size:.61rem;gap:3px;letter-spacing:-.01em}.dw-menu button span{font-size:1rem;min-width:18px}.dw-cards{gap:7px}.dw-card{min-height:140px;padding:9px;border-radius:8px}.dw-card .dw-icon{font-size:1.35rem}.dw-card h2{font-size:clamp(.78rem,3.4vw,1.02rem);margin:6px 0 3px}.dw-card p{font-size:.64rem;padding-right:0}.dw-card .dw-next{right:6px;bottom:5px;font-size:.75rem}.dw-panels{grid-template-columns:1fr;gap:7px;margin-top:7px}.dw-panel{padding:10px}.dw-panel.wide{grid-column:auto}}
 @media(max-width:370px){.dw-layout{grid-template-columns:76px minmax(0,1fr)}.dw-menu button{font-size:.53rem}.dw-menu button span{min-width:14px;font-size:.85rem}.dw-card{min-height:132px;padding:7px}.dw-card p{font-size:.59rem}}
 `}</style>
 <div className="dw-header"><div className="dw-compass" aria-label="Kompas">✧</div><div><h1>DARKWESSOS</h1><p>LIVING STORY OFFICE</p></div></div>
 <div className="dw-layout">
 <nav className="dw-menu" aria-label="DARKWESSOS izbornik">{menu.map(item=><button key={item.name} type="button" onClick={()=>open(item.key)}><span aria-hidden="true">{item.icon}</span>{item.name}</button>)}</nav>
 <div className="dw-main">
 <div className="dw-cards">{modules.map(m=><button key={m.key} className="dw-card" type="button" onClick={()=>open(m.key)}><span className="dw-number">{m.kind}</span><div><div className="dw-icon" aria-hidden="true">{m.icon}</div><h2>{m.name}</h2><p>{m.desc}</p></div><span className="dw-next" aria-hidden="true">↗</span></button>)}</div>
 <div className="dw-panels">
 <div className="dw-panel"><h3>AKTIVNA LOKACIJA</h3><strong>Darkwood</strong><p>Radni atlas i geografske veze.</p><button type="button" onClick={()=>go('workshop')}>Otvori atlas →</button></div>
 <div className="dw-panel"><h3>AKTIVNI RAD</h3><strong>Novela I</strong><p>Rukopis i scene u razvoju.</p><button type="button" onClick={()=>go('story')}>Nastavi pisanje →</button></div>
 <div className="dw-panel wide"><h3>BRZE ZABILJEŠKE</h3><textarea aria-label="Brze zabilješke" value={note} onChange={e=>{setNote(e.target.value);setSaved(false)}} placeholder="Ideja, pitanje ili scena..."/><div className="dw-save"><button type="button" onClick={save}>Sačuvaj lokalno</button>{saved&&<span>Sačuvano na ovom uređaju</span>}</div></div>
 </div>
 {lab&&<div className="dw-panel dw-lab" role="region" aria-label="KATE LAB"><h3>KATE LAB · UREDNIČKA RADIONICA</h3><p>Radne ideje, razvoj scena i pregled izvora. Ovaj prikaz nije direktno povezan s AI agentima. Kanon ostaje pod KENO kontrolom.</p><div className="dw-actions"><button type="button" onClick={()=>go('notes')}>Radne ideje</button><button type="button" onClick={()=>go('archive')}>Kanon i izvori</button><button type="button" onClick={()=>setLab(false)}>Zatvori</button></div></div>}
 </div></div></section>;
}
