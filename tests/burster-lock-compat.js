import fs from 'node:fs';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const root=new URL('../production-v035b/burster-final-lock/',import.meta.url);
export function beforeBursterLock(file,bytes){
 const hashes=JSON.parse(fs.readFileSync(new URL('patched-hashes.json',root)));
 if(!hashes[file])return bytes;
 assert.equal(createHash('sha256').update(bytes).digest('hex'),hashes[file],file+' burster visual-only patch');
 return fs.readFileSync(new URL('before/'+file.split('/').at(-1),root));
}
