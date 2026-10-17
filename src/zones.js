import {FORGE_WAVES} from './forge/waves.js';
import {DEPTHS_WAVES} from './depths/waves.js';
import {RIFT_WAVES} from './rift/waves.js';
import {SHAFT_WAVES} from './shaft-waves.js';
import { WORLD, worldRewards } from './world.js';
import { TRACKS_WAVES } from './tracks-waves.js';

const bosses=Object.freeze(['stationmaster','locomotive','switchman']);
export const TRACKS=Object.freeze({id:'tracks',name:'LES VOIES ABANDONNÉES',theme:'rust-steel-copper',
  choices:WORLD.choices,epicAfter:WORLD.epicAfter,
  waves:TRACKS_WAVES,
  enemies:Object.freeze(['miner','wagon','draisine','rat','drill']),bosses,
  rewards:Object.freeze({coal:108,extraIron:1,extraDiamondChance:.03,firstVictoryDiamond:1}),
  unlock:'galleries',
});
export const ZONE_CONFIGS=Object.freeze({
  forge:Object.freeze({id:'forge',name:'LES FORGES OUBLIÉES',theme:'forge-metal',choices:WORLD.choices,epicAfter:WORLD.epicAfter,waves:FORGE_WAVES,enemies:Object.freeze(['stoker','riveter','scorifier']),bosses:Object.freeze(['furnace','hammer','boiler']),gimmick:'overheat',unlock:'depths',rewards:Object.freeze({coal:123,extraIron:4,extraDiamondChance:.07,firstVictoryDiamond:2})}),
  depths:Object.freeze({id:'depths',name:'LES PROFONDEURS NOIRES',theme:'depths-dark',choices:WORLD.choices,epicAfter:WORLD.epicAfter,waves:DEPTHS_WAVES,enemies:Object.freeze(['lampist','blaster','blackmaw']),bosses:Object.freeze(['lampmajor','dynamiter','blackmass']),gimmick:'extinctions',unlock:'rift',rewards:Object.freeze({coal:123,extraIron:4,extraDiamondChance:.07,firstVictoryDiamond:2})}),
  rift:Object.freeze({id:'rift',name:'LA FAILLE DE GRISOU',theme:'rift-gas',choices:WORLD.choices,epicAfter:WORLD.epicAfter,waves:RIFT_WAVES,enemies:Object.freeze(['crawler','spitter','burster','gasminer','surveyor','drill']),bosses:Object.freeze(['splitter','blower','core']),gimmick:'grisou-pockets',unlock:'shaft59',rewards:Object.freeze({coal:118,extraIron:3,extraDiamondChance:.07,firstVictoryDiamond:1})}),
  galleries:Object.freeze({...WORLD,theme:'coal-stone',enemies:Object.freeze(['rat','miner','drill']),bosses:Object.freeze(['haveuse','crachefer','effondreur']),rewards:Object.freeze({coal:94,extraIron:0,extraDiamondChance:0}),unlock:null}),
  tracks:TRACKS,
  shaft59:Object.freeze({id:'shaft59',name:'LE PUITS 59',theme:'shaft-industrial',choices:WORLD.choices,epicAfter:WORLD.epicAfter,waves:SHAFT_WAVES,enemies:Object.freeze(['deepdriller','surveyor','gasminer','miner','drill','rat']),bosses:Object.freeze(['cager','compressor','firedamp']),gimmick:'instability',unlock:'tracks',rewards:Object.freeze({coal:113,extraIron:2,extraDiamondChance:.05,firstVictoryDiamond:1})}),
});
export function zoneRewards(world,random=Math.random) {
  const plans=worldRewards(random,world.waves.length);
  if(!['tracks','shaft59','rift','depths','forge'].includes(world.id))return plans;
  const rewards=world.rewards;
  let source=0,credited=0;
  for(const plan of plans) {
    source+=plan.coal;
    const target=Math.floor(source*rewards.coal/94);
    plan.coal=target-credited;credited=target;
  }
  plans[14].iron+=rewards.extraIron;
  if(random()<rewards.extraDiamondChance)plans[19].diamond+=1;
  return plans;
}
