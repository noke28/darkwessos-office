import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/lib/canon.ts',import.meta.url),'utf8');
test('Canon reader is read-only and rejects duplicate identifiers by design',()=>{assert.match(source,/Duplicirani source_id/);assert.match(source,/revision_id mora biti puni Git commit SHA/);assert.doesNotMatch(source,/fetch\(/);});
test('Demo Atlas does not claim canonical coordinates',()=>{const atlas=readFileSync(new URL('../src/data/atlas.ts',import.meta.url),'utf8');assert.match(atlas,/Koordinate nisu kanon/);assert.match(atlas,/source_id:'test-darkwood-source'/);assert.match(atlas,/kind:'TEST'/);});
