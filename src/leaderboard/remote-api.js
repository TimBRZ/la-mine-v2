export class RemoteError extends Error{constructor(reason){super(reason);this.reason=reason;}}
export class RemoteAPI {
 constructor({baseUrl='',timeoutMs=2500,fetchImpl=globalThis.fetch?.bind(globalThis)}={}){this.baseUrl=baseUrl;this.timeoutMs=timeoutMs;this.fetchImpl=fetchImpl;this.ready=null;}
 async request(path,{method='GET',body}={}){
  const abort=new AbortController();let timer;
  try{
   return await Promise.race([(async()=>{
    const response=await this.fetchImpl(this.baseUrl+path,{method,credentials:'include',cache:'no-store',redirect:'error',signal:abort.signal,headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    if(!response.ok)throw new RemoteError(response.status===401?'unauthenticated':'unavailable');
    return await response.json();
   })(),new Promise((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(new RemoteError('timeout'));},this.timeoutMs);})]);
  }catch(error){throw error instanceof RemoteError?error:new RemoteError('unavailable');}
  finally{clearTimeout(timer);}
 }
 ensureTemp(){return this.ready??=(async()=>{const proof=await this.request('/__mine_temp__/status');if(proof?.environment!=='mine-leaderboard-temp-v030')throw new RemoteError('unavailable');})();}
}
