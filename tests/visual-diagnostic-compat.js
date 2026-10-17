// Explicit, hash-pinned presentation patch. Historical gameplay guards remain exact.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {beforeBursterLock} from './burster-lock-compat.js';
const root=new URL('../production-v035b/visual-diagnostic/',import.meta.url);
const hashes=JSON.parse(fs.readFileSync(new URL('patched-hashes.json',root)));
export function beforeVisualDiagnostic(file,bytes){
 bytes=beforeBursterLock(file,bytes);
 if(!hashes[file])return bytes;
 assert.equal(createHash('sha256').update(bytes).digest('hex'),hashes[file],file+' authorised presentation patch');
 return fs.readFileSync(new URL('before/'+file.split('/').at(-1),root));
}
