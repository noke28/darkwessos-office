import test from 'node:test';
import assert from 'node:assert/strict';
import {createOperationId} from '../src/lib/operationId.ts';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
test('uses randomUUID when available', () => {
  const value='c96bb38b-5b3b-4d67-b38a-1b82c1a84121';
  const result=createOperationId({randomUUID:()=>value,getRandomValues:()=>{throw Error('should not run');}});
  assert.equal(result,value);
});
test('generates RFC4122 v4 UUID with secure random bytes when randomUUID is absent', () => {
  let calls=0;
  const source={getRandomValues:(bytes)=>{calls++; for(let i=0;i<bytes.length;i++) bytes[i]=(i+calls)&255;return bytes;}};
  const first=createOperationId(source), second=createOperationId(source);
  assert.match(first,uuid);assert.match(second,uuid);assert.notEqual(first,second);assert.equal(calls,2);
});
test('fails closed when no cryptographic generator is available', () => {
  assert.throws(()=>createOperationId({}),/Sigurno generisanje/);
});
