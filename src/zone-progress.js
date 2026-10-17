// Optional v1 profile extension. A legacy save has no recorded zone victory.
export function sanitizeProgress(value) {
  const forgeCompleted=value?.forgeCompleted===true;
  const depthsCompleted=value?.depthsCompleted===true||forgeCompleted;
  const forge=depthsCompleted||value?.forgeUnlocked||value?.forgeFirstVictoryClaimed?{forgeUnlocked:depthsCompleted,forgeCompleted,forgeFirstVictoryClaimed:forgeCompleted||value?.forgeFirstVictoryClaimed===true}:{};
  const riftCompleted=value?.riftCompleted===true||depthsCompleted;
  const depths=riftCompleted||value?.depthsUnlocked||value?.depthsFirstVictoryClaimed?{depthsUnlocked:riftCompleted,depthsCompleted,depthsFirstVictoryClaimed:depthsCompleted||value?.depthsFirstVictoryClaimed===true}:{};
  const shaftCompleted=value?.shaftCompleted===true||riftCompleted;
  const rift=shaftCompleted||value?.riftUnlocked||value?.riftFirstVictoryClaimed?{riftUnlocked:shaftCompleted,riftCompleted,riftFirstVictoryClaimed:riftCompleted||value?.riftFirstVictoryClaimed===true}:{};
  const tracksCompleted=value?.tracksCompleted===true||shaftCompleted;
  const galleriesCompleted=value?.galleriesCompleted===true || tracksCompleted;
  return {...forge,...depths,...rift,shaftUnlocked:tracksCompleted,shaftCompleted,shaftFirstVictoryClaimed:shaftCompleted||value?.shaftFirstVictoryClaimed===true,galleriesCompleted, tracksUnlocked:galleriesCompleted, tracksCompleted, tracksFirstVictoryClaimed:tracksCompleted || value?.tracksFirstVictoryClaimed===true};
}
export function zoneAvailable(id, progress) {
  return id==='galleries' || id==='tracks' && sanitizeProgress(progress).tracksUnlocked || id==='shaft59' && sanitizeProgress(progress).shaftUnlocked || id==='rift' && sanitizeProgress(progress).riftUnlocked===true || id==='depths' && sanitizeProgress(progress).depthsUnlocked===true || id==='forge' && sanitizeProgress(progress).forgeUnlocked===true;
}
export function zoneCompleted(id, progress) {
  const p=sanitizeProgress(progress);
  return id==='galleries'?p.galleriesCompleted:id==='tracks'?p.tracksCompleted:id==='shaft59'?p.shaftCompleted:id==='rift'?p.riftCompleted===true:id==='depths'?p.depthsCompleted===true:id==='forge'?p.forgeCompleted===true:false;
}
export function completeZone(id, progress) {
  const next=sanitizeProgress(progress);
  let firstDiamond=0;
  if(id==='galleries')next.galleriesCompleted=next.tracksUnlocked=true;
  if(id==='tracks'&&next.tracksUnlocked) {
    firstDiamond=next.tracksFirstVictoryClaimed?0:1;
    next.tracksCompleted=next.tracksFirstVictoryClaimed=next.shaftUnlocked=true;
  }
  if(id==='shaft59'&&next.shaftUnlocked){firstDiamond=next.shaftFirstVictoryClaimed?0:1;next.shaftCompleted=next.shaftFirstVictoryClaimed=next.riftUnlocked=true;next.riftCompleted=Boolean(next.riftCompleted);next.riftFirstVictoryClaimed=Boolean(next.riftFirstVictoryClaimed);}
  if(id==='rift'&&next.riftUnlocked){firstDiamond=next.riftFirstVictoryClaimed?0:1;next.riftCompleted=next.riftFirstVictoryClaimed=next.depthsUnlocked=true;next.depthsCompleted=Boolean(next.depthsCompleted);next.depthsFirstVictoryClaimed=Boolean(next.depthsFirstVictoryClaimed);}
  if(id==='depths'&&next.depthsUnlocked){firstDiamond=next.depthsFirstVictoryClaimed?0:2;next.depthsCompleted=next.depthsFirstVictoryClaimed=next.forgeUnlocked=true;next.forgeCompleted=Boolean(next.forgeCompleted);next.forgeFirstVictoryClaimed=Boolean(next.forgeFirstVictoryClaimed);}
  if(id==='forge'&&next.forgeUnlocked){firstDiamond=next.forgeFirstVictoryClaimed?0:2;next.forgeCompleted=next.forgeFirstVictoryClaimed=true;}
  return {progress:next,firstDiamond};
}
