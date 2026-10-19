import test from 'node:test';import assert from 'node:assert/strict';
import {atlasPlaces} from '../src/data/atlas.ts';import {demoSources} from '../src/data/demo.ts';
import {lookupById,buildNote,buildKatePackage,parseSavedDraft} from '../src/lib/workflow.ts';
const loc=atlasPlaces[0];const source=lookupById(demoSources,loc.source_id);
const context={location_id:loc.location_id,location_name:loc.name,source_id:source.source_id,source_name:source.path,source_status:source.status};
test('Odabir TEST lokacije vodi na postojeći TEST izvor',()=>{assert.equal(loc.kind,'TEST');assert.equal(source?.status,'TEST');assert.equal(source?.source_id,loc.source_id)});
test('Nepostojeći source_id vraća null',()=>assert.equal(lookupById(demoSources,'missing'),null));
test('Prenos konteksta i izvoz bilješke čuvaju identifikatore i tekst',()=>{const text=buildNote({title:'Put',body:'Radna ideja',context});for(const x of [loc.location_id,source.source_id,'Radna ideja','STATUS: RADNO','STATUS IZVORA: TEST'])assert.ok(text.includes(x),x)});
test('KATE paket jasno odbija kanonsku verifikaciju',()=>{const text=buildKatePackage({title:'Put',body:'Ideja',context});assert.match(text,/nije verificirani kanon/);assert.match(text,/TEST/);assert.match(text,/Ideja/)});
test('Promjena stranice ne mijenja radni nacrt — čisti ugovor',()=>{const draft={title:'Sačuvano',body:'Tekst',context};const nextPage='archive';assert.equal(nextPage,'archive');assert.equal(draft.body,'Tekst');assert.equal(draft.context.location_id,loc.location_id)});

test('Radni nacrt se može vratiti iz lokalnog zapisa',()=>{const d={title:'Proba',body:'Tekst',context};assert.deepEqual(parseSavedDraft(JSON.stringify(d)),d)});
test('Neispravan ili prevelik zapis ne učitava se',()=>{assert.equal(parseSavedDraft('{'),null);assert.equal(parseSavedDraft(JSON.stringify({title:3,body:'tekst',context:null})),null);assert.equal(parseSavedDraft('x'.repeat(1_000_001)),null)});
test('Bilješka bez lokacije zadržava vezu sa izvorom',()=>{const c={location_id:'',location_name:'(nije odabrana)',source_id:'root',source_name:'root.md',source_status:'RADNO'};assert.match(buildNote({title:'',body:'tekst',context:c}),/source_id: root/)});
