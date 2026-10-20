// Final scene composition. Individual VFX keep their authored local depths;
// this policy runs AFTER pooled effects and all arena views have updated.
// No simulation access, texture changes or per-frame allocation.
export const COMBAT_LAYERS=Object.freeze({
 FLOOR:0,GROUND_BASE:7.8,GROUND_HAZARD:7.9,GROUND_MARKINGS:8,
 PROJECTILE:10,HOSTILE_PROJECTILE:11,CONTACT:12,ACTOR:15,
 ENERGY_CONTACT:16,HERO:20,HELD_WEAPON:21,CRITICAL_TELEGRAPH:30,UI:60,
});
function depth(object,value){if(object&&object.depth!==value)object.setDepth(value);}
function sprites(pool,value){if(pool)for(const object of pool)depth(object,value);}
export function applyCombatRenderLayers(scene){
 const l=COMBAT_LAYERS,a=scene.arenaView,e=scene.enemyAttacksView;
 sprites(scene.pelletViews,l.PROJECTILE);
 depth(scene.muzzle,l.CONTACT);
 depth(scene.forgeSpriteVfx?.muzzleGraphics,l.CONTACT);
 depth(e?.bolts,l.HOSTILE_PROJECTILE);
 sprites(e?.rivets?.sprites,l.HOSTILE_PROJECTILE);
 sprites(e?.lampistShots?.sprites,l.HOSTILE_PROJECTILE);
 sprites(e?.rivetImpacts?.sprites,l.CONTACT);
 if(scene.effects)for(const item of scene.effects.items){
  // Ground dust remains on the floor. Compact energy contact feedback retains
  // its established position over enemy bodies (it is not an in-flight orb).
  const kind=item.clip||item.fallbackKind;
  depth(item.sprite,kind==='dust'?7:
   kind==='impact-energy'||kind==='conduction'||kind==='arc-energy'||kind==='overload-grisoux'?l.ENERGY_CONTACT:l.CONTACT);
 }
 depth(e?.warning,l.CRITICAL_TELEGRAPH);
 depth(a?.heatingSectors?.outline,l.CRITICAL_TELEGRAPH);
 depth(a?.whitehotPlates?.outline,l.CRITICAL_TELEGRAPH);
 depth(a?.furnaceCone?.outline,l.CRITICAL_TELEGRAPH);
 depth(a?.furnaceArm?.outline,l.CRITICAL_TELEGRAPH);
 depth(a?.scorifierTrail?.outline,l.CRITICAL_TELEGRAPH);
 depth(a?.scorifierTrail?.preview,l.CRITICAL_TELEGRAPH+.1);
 // The legacy arena Graphics mixes filled ground surfaces and markings.
 // Keep that composite below flight; raising it would recreate occlusion.
 depth(a?.warning,l.GROUND_MARKINGS);
}
