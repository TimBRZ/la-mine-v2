// Historical byte guards are not waived: the current bytes must match the
// reviewed delta before the original (still immutable) snapshot is compared.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {beforeReconciliation} from './reconciliation-source-delta.js';
import {beforeLampistVisual} from './lampist-visual-delta.js';
const root=path.resolve('src'),before=path.resolve('production-v038c1b-instant-fire/before/src');
const approved=JSON.parse(fs.readFileSync('production-v038c1c-reconciliation/notes/approved-delta.json'));
export function historicalSource(file,encoding){
 const absolute=path.resolve(file instanceof URL?fileURLToPath(file):file);
 const relative=path.relative(root,absolute).replaceAll('\\','/');
 let bytes=beforeLampistVisual(relative,fs.readFileSync(file));
 if(Object.hasOwn(approved,relative)){
  assert.equal(createHash('sha256').update(beforeReconciliation(relative,bytes)).digest('hex'),approved[relative],`Unreviewed instant-fire delta: ${relative}`);
  bytes=fs.readFileSync(path.join(before,relative));
 }
 return encoding?bytes.toString(typeof encoding==='string'?encoding:encoding.encoding):bytes;
}
export {Run as PreInstantRun} from '../production-v038c1b-instant-fire/before/src/run.js';
