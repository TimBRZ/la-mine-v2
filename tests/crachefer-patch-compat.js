// The only authorised simulation exception: retry a refused solo Crachefer shot.
// Historical byte guards still validate every other byte in run.js.
import {readFileSync} from 'node:fs';
export function withoutCracheferRetry(file,bytes){
 if(file!=='src/run.js')return bytes;
 return Buffer.from(bytes.toString().replace("else if(this.wave.final||this.rift||owner.bossId==='crachefer')",'else if(this.wave.final||this.rift)'));
}
// Apply that same one-condition exception to historical replay comparators in
// memory. Snapshots remain untouched; all other events/state still compare exactly.
export async function legacyRunWithCracheferRetry(url){
 const original=readFileSync(url,'utf8'),from=original.includes('else if(this.wave.final||this.rift)')?'else if(this.wave.final||this.rift)':'else if(this.wave.final)';
 if(original.split(from).length!==2)throw Error('Unexpected historical retry branch: '+url);
 const source=original.replace(from,from.slice(0,-1)+"||owner.bossId==='crachefer')")
  .replace(/from\s+(['"])(\.[^'"]+)\1/g,(_m,_q,path)=>'from '+JSON.stringify(new URL(path,url).href));
 return (await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))).Run;
}
