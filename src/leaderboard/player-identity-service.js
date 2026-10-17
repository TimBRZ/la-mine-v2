import {RemoteError} from './remote-api.js';
export class PlayerIdentityService{
 constructor(api){this.api=api;this.pending=null;}
 get(){
  if(this.pending)return this.pending;
  this.pending=(async()=>{
   await this.api.ensureTemp();const data=await this.api.request('/api/player/identity');
   if(data?.authenticated===false)return {authenticated:false,player_id:null,display_name:'NON CONNECTÉ'};
   if(data?.authenticated!==true||typeof data.player_id!=='string'||!data.player_id||data.player_id.length>128||typeof data.display_name!=='string'||!data.display_name.trim()||data.display_name.length>100)throw new RemoteError('unavailable');
   return {authenticated:true,player_id:data.player_id,display_name:data.display_name};
  })().finally(()=>{this.pending=null;});return this.pending;
 }
}
