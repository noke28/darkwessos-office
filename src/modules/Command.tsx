import {useState} from 'react';

const sections=[
 {id:'command',number:'01',title:'COMMAND',subtitle:'Odluke, zadaci i aktivni radni tok.',icon:'✦',art:'linear-gradient(160deg,rgba(6,15,29,.1),rgba(5,12,24,.95)),radial-gradient(ellipse at 25% 20%,#a36c30 0%,#293e51 35%,#081a32 85%)'},
 {id:'story',number:'02',title:'STORY',subtitle:'Rukopis, scene, poglavlja i bilješke.',icon:'✒',art:'linear-gradient(160deg,rgba(5,12,24,.12),rgba(5,12,24,.96)),radial-gradient(ellipse at 70% 10%,#bb8752 0%,#34465b 38%,#07182d 90%)'},
 {id:'workshop',number:'03',title:'WORKSHOP',subtitle:'Atlas, lokacije, odnosi i tok radnje.',icon:'✧',art:'linear-gradient(160deg,rgba(6,15,29,.05),rgba(5,12,24,.96)),radial-gradient(ellipse at 35% 20%,#517a9e 0%,#1b4965 35%,#071529 85%)'},
 {id:'kate',number:'04',title:'KATE LAB',subtitle:'Urednički rad, istraživanje i provjera izvora.',icon:'❧',art:'linear-gradient(160deg,rgba(5,12,24,.06),rgba(5,12,24,.95)),radial-gradient(ellipse at 75% 15%,#b37c42 0%,#263f59 42%,#07162a 88%)'}
] as const;
export default function Command({go}:{go:(s:string)=>void}){
 const [lab,setLab]=useState(false);
 return <section className="nordish-home">
 <style>{`
 .nordish-home{color:#e8eef2;font-family:system-ui,sans-serif;max-width:1200px;margin:auto}
 .nordish-hero{border:1px solid #31516d;border-radius:12px;padding:22px 18px;margin-bottom:14px;background:radial-gradient(ellipse at 78% 5%,#27547b 0%,transparent 53%),linear-gradient(135deg,#0B1526,#142840 60%,#0B1526);box-shadow:0 12px 40px #02081370}
 .nordish-hero h1{font-family:Georgia,serif;font-size:clamp(2rem,5vw,3.5rem);font-weight:400;letter-spacing:.045em;margin:10px 0 0;color:#f2eadc}
 .nordish-hero .nordish-tag{color:#88C0D0;font-size:.75rem;letter-spacing:.25em}
 .nordish-hero p{color:#c2d2e2;margin:12px 0 0;font-family:Georgia,serif;font-style:italic}
 .nordish-compass{font-size:2rem;color:#D6A65C;vertical-align:middle;margin-right:12px}
 .nordish-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
 .nordish-tile{position:relative;text-align:left;border:1px solid #52708a;border-radius:14px;padding:16px;min-height:205px;color:#f4ede1;cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;transition:border-color .2s,transform .2s}
 .nordish-tile:hover,.nordish-tile:focus-visible{border-color:#e0b477;transform:translateY(-2px);outline:2px solid transparent}
 .nordish-tile:focus-visible{outline:2px solid #a8d7ec;outline-offset:3px}
 .nordish-num{color:#D6A65C;font-family:Georgia,serif;letter-spacing:.1em}
 .nordish-tile h2{font-family:Georgia,serif;font-weight:400;font-size:clamp(1.5rem,3vw,2.1rem);margin:0 0 6px}
 .nordish-tile p{color:#d1deea;line-height:1.5;margin:0;max-width:34ch}
 .nordish-icon{font-size:2.4rem;color:#D6A65C}
 .nordish-arrow{position:absolute;right:18px;bottom:18px;color:#e5b977;font-size:1.5rem}
 .nordish-bottom{margin-top:16px;border:1px solid #28455d;background:#0a1c30;border-radius:9px;padding:12px;color:#b7cbdb;display:flex;flex-wrap:wrap;gap:14px;justify-content:space-between}
 .nordish-bottom button,.nordish-lab button{background:#193b57;color:#e8eef2;border:1px solid #4b728e;border-radius:8px;padding:10px 14px;cursor:pointer}
 .nordish-lab{border:1px solid #b18a55;background:#0c1d30;border-radius:14px;padding:20px;margin-top:16px}
 .nordish-lab h2{font-family:Georgia,serif;font-weight:400;color:#ebd3a6}
 .nordish-lab p{color:#c2d2e2;line-height:1.6}
 @media(max-width:560px){.nordish-home{width:100%}.nordish-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.nordish-tile{min-height:162px;padding:12px;border-radius:9px}.nordish-tile h2{font-size:clamp(.97rem,4vw,1.3rem);letter-spacing:0}.nordish-tile p{font-size:.72rem;line-height:1.35;padding-right:8px}.nordish-icon{font-size:1.5rem}.nordish-arrow{font-size:1rem;right:9px;bottom:8px}.nordish-num{font-size:.72rem}.nordish-hero{padding:15px 12px;border-radius:9px;margin-bottom:11px}.nordish-hero h1{font-size:clamp(1.5rem,6vw,2.2rem)}.nordish-hero p{font-size:.82rem}.nordish-hero .nordish-tag{font-size:.58rem;letter-spacing:.13em}.nordish-compass{font-size:1.4rem;margin-right:6px}.nordish-bottom{flex-direction:column;gap:8px;font-size:.75rem;padding:10px}.nordish-lab{padding:12px}.nordish-lab button{margin:4px 3px 4px 0;min-height:44px}}
 `}</style>
 <div className="nordish-hero"><div><span className="nordish-compass" aria-hidden="true">✺</span><span className="nordish-tag">LIVING STORY OFFICE</span></div><h1>DARKWESSOS</h1><p>Jedan svijet. Jedna pustolovina.</p></div>
 <div className="nordish-grid">{sections.map(s=><button type="button" key={s.id} className="nordish-tile" style={{background:s.art}} onClick={()=>s.id==='kate'?setLab(v=>!v):go(s.id)}><span className="nordish-num">{s.number}</span><div><div className="nordish-icon" aria-hidden="true">{s.icon}</div><h2>{s.title}</h2><p>{s.subtitle}</p></div><span className="nordish-arrow" aria-hidden="true">→</span></button>)}</div>
 {lab&&<div className="nordish-lab" role="region" aria-label="KATE LAB"><h2>KATE LAB · Urednička radionica</h2><p>Prostor za radne ideje i pripremu provjera. AI razgovor i provjera kanona nisu automatski povezani s ovim prototipom. Kanonske odluke donosi isključivo KENO.</p><button type="button" onClick={()=>go('notes')}>Otvori radne ideje →</button> <button type="button" onClick={()=>go('archive')}>Pregled izvora →</button> <button type="button" onClick={()=>setLab(false)}>Zatvori</button></div>}
 <div className="nordish-bottom"><span>✧ KENO · AUTOR &nbsp; | &nbsp; KATE · DEVELOPMENT EDITOR</span><button type="button" onClick={()=>go('archive')}>ARCHIVE · Kanon i izvori →</button></div>
 </section>;
}
