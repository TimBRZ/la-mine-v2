import { tacticalPilot } from './tactical-pilot.js';
const proxies=new WeakMap();
// QA movement only. Convert visible rail warnings to samples understood by the
// existing pilot; never read future RNG, change health or bypass enemy attacks.
export function railBossPilot(run) {
  let proxy=proxies.get(run);if(!proxy){proxy=Object.create(run);proxies.set(run,proxy);}
  proxy.enemies=run.enemies.map(e=>{
    if(!e.hazards)return e;
    const visible=Object.create(e);
    visible.zones=e.hazards.flatMap(h=>h.radius?[h]:Array.from({length:13},(_,i)=>({x:h.x+(h.x2-h.x)*i/12,y:h.y,radius:h.width})));
    return visible;
  });
  return tacticalPilot(proxy);
}
