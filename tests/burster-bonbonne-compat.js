// Hash-pinned presentation-only replacement, retaining the previous protection.
import fs from 'node:fs';import assert from 'node:assert/strict';import{createHash}from'node:crypto';
const root=new URL('../production-eclateur-bonbonne/',import.meta.url);
export function beforeBonbonne(file,bytes){
 const hashes=JSON.parse(fs.readFileSync(new URL('patched-hashes.json',root)));
 if(!hashes[file])return bytes;
 assert.equal(createHash('sha256').update(bytes).digest('hex'),hashes[file],file+' approved bottle visual integration');
 return fs.readFileSync(new URL('before/'+file,root));
}
