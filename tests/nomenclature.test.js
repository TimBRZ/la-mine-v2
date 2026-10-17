import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {renameVisibleCopy} from './nomenclature-copy.js';
import {V029_FILES} from './v029-authorized-files.js';
test('nomenclature changes only requested display copy, preserving every technical identifier and statement',async()=>{
 const before=JSON.parse(await readFile(new URL('./nomenclature-before.json',import.meta.url),'utf8'));
 for(const [file,source]of Object.entries(before)){
  const historical=file==='README.md'?'./v029-before-README.md':file==='index.html'?'./v029-before-index.html':file.startsWith('src/')&&V029_FILES.includes(file.slice(4))?'./v029-before-src-snapshot/'+file.slice(4):null;
  assert.equal(await readFile(new URL(historical||'../'+file,import.meta.url),'utf8'),renameVisibleCopy(source),file);
 }
});
