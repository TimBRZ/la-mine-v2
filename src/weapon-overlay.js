import { WEAPONS } from './weapons.js';
export class WeaponOverlay {
 constructor(host,onChoose) {
  this.element=document.createElement('section'); this.element.className='weapon-overlay'; this.element.hidden=true;
  this.element.setAttribute('role','dialog'); this.element.setAttribute('aria-modal','true'); this.element.setAttribute('aria-labelledby','weapon-title');
  this.element.innerHTML='<p class="eyebrow">AVANT LA DESCENTE</p><h2 id="weapon-title">CHOISIS TON ARME</h2><p>Arrête-toi pour tirer.<br>Bouge pour esquiver.</p><div class="weapon-cards"></div><small>Deux styles. Les mêmes vingt vagues.</small>';
  for(const weapon of Object.values(WEAPONS)) {
   const button=document.createElement('button'); button.type='button'; button.setAttribute('aria-label',weapon.name);
   const parts=weapon.shape.map(([x,y,w,h,c])=>'<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" fill="#'+c.toString(16).padStart(6,'0')+'"/>').join('');
   button.innerHTML='<svg viewBox="0 -12 40 34" aria-hidden="true">'+parts+'</svg><strong>'+weapon.name+'</strong><span>'+weapon.description+'</span><small>'+weapon.detail+'</small>';
   button.onclick=()=>{if(!this.active)return; this.active=false; this.element.hidden=true; onChoose(weapon.id);};
   this.element.querySelector('.weapon-cards').append(button);
  }
  this.element.onkeydown=event=>{
   if(event.key!=='Tab')return; event.preventDefault();
   const buttons=[...this.element.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);
   buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length].focus();
  };
  host.append(this.element);
 }
 show(){this.active=true;this.element.hidden=false;this.element.querySelector('button').focus({preventScroll:true});}
 destroy(){this.element.remove();}
}
