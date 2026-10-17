// QA pilot reads only currently announced geometry. No hidden future stage or model mutation.
import {ray} from '../src/depths/boss-patterns.js';
export function bossHazardDistance(h,p){
 if(h.shape==='ring'){const d=Math.hypot(p.x-h.x,p.y-h.y);return Math.max(h.inner-d,d-h.radius)-p.radius;}
 if(h.shape==='rect'){const dx=Math.max(h.x-p.x,p.x-h.x-h.w),dy=Math.max(h.y-p.y,p.y-h.y-h.h);return dx>0||dy>0?Math.hypot(Math.max(0,dx),Math.max(0,dy))-p.radius:Math.max(dx,dy)-p.radius;}
 if(Number.isFinite(h.x2)){const dx=h.x2-h.x,dy=h.y2-h.y,t=Math.max(0,Math.min(1,((p.x-h.x)*dx+(p.y-h.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-h.x-dx*t,p.y-h.y-dy*t)-h.width-p.radius;}
 return Math.hypot(p.x-h.x,p.y-h.y)-h.radius-p.radius;
}
export function forecastBossHazard(run,h,t){
 const e=run.enemies.find(e=>e.id===h.owner),s=e?.bossSequence;if(!s)return h;
 const step=s.step;if(!h.active&&h.warning>t+.16)return null;
 if(step.rush)return null;const at=s.state==='active'?s.elapsed+t:Math.max(0,t-e.phaseTime),q=Math.min(1,at/step.duration);
 if(at>step.duration+.1)return null;
 if(step.sequence&&(at<(h.delay||0)-.16||at>(h.delay||0)+(h.life||.32)))return null;
 if(step.sweep){const b=s.base[0];return ray(s.origin,Math.atan2(b.y2-b.y,b.x2-b.x)+step.sweep*q,700,17);}
 if(step.cross){const i=h.x===h.x2?1:0,b=s.base[i];return {...b,x:b.x+(i?80*q:0),x2:b.x2+(i?80*q:0),y:b.y+(i?0:110*q),y2:b.y2+(i?0:110*q)};}
 if(step.grow){const b=s.base.find(b=>b.x===h.x&&b.y===h.y&&Math.abs(Math.atan2(b.y2-b.y,b.x2-b.x)-Math.atan2(h.y2-h.y,h.x2-h.x))<.01)||h;return {...b,x2:b.x+(b.x2-b.x)*Math.max(.12,q),y2:b.y+(b.y2-b.y)*Math.max(.12,q)};}
 if(step.wave)return {...h,inner:85+110*q,radius:110+110*q};return h;
}
