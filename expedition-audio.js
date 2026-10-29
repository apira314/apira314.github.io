/* Original world themes, synthesized locally. Both music and effects use the shared audio settings. */
class ExpeditionScore{
 constructor(kit,kind){this.kit=kit;this.kind=kind;this.clock=0;this.step=0;this.world=-1;this.themes=[{bpm:108,root:130.81,wave:'triangle',notes:[0,7,12,10,7,3,5,7,0,3,7,12,10,7,5,3]},{bpm:118,root:146.83,wave:'square',notes:[0,0,7,3,5,7,10,7,3,0,5,3,7,10,12,7]},{bpm:96,root:174.61,wave:'sine',notes:[0,4,7,12,14,12,7,4,2,5,9,14,12,9,7,5]},{bpm:124,root:164.81,wave:'triangle',notes:[0,7,11,12,7,4,2,7,0,4,7,14,12,11,7,2]},{bpm:94,root:146.83,wave:'sine',notes:[0,7,14,12,10,7,3,5,0,3,10,14,17,14,10,7]}];}
 reset(){this.clock=0;this.step=0;this.world=-1;}
 tick(dt,active,state){const k=this.kit;k.activity=active;k.applyAudio();if(k.musicTrack)return;if(!active||!k.audio||k.bgMuted||document.hidden||window.PiraMenuOpen||window.PiraDevicePending)return;
 const world=this.kind==='drill'?Math.min(4,state.phase):state.level.world;if(world!==this.world){this.world=world;this.clock=0;this.step=0;}
 if(this.kind==='drill'){this.drill(dt,state);return;}
 const theme=this.themes[world];if(k.drones)k.drones.forEach((o,i)=>o.frequency.setTargetAtTime(theme.root*[.25,.375,.5][i],k.audio.currentTime,.5));
 this.clock+=dt;const interval=60/(theme.bpm+(state.ocean?.boss?state.ocean.boss.phase*10:state.trial?12:0))/2;if(this.clock<interval)return;this.clock%=interval;const n=this.step++,chord=[0,5,3,7][Math.floor(n/16)%4],note=theme.notes[n%16];k.voice(theme.root*Math.pow(2,(note+chord)/12),world===2?.48:.2,theme.wave,world===1?.023:.065,k.bgGain);
 if(n%4===0){k.voice(theme.root*Math.pow(2,chord/12)/2,.36,'triangle',.085,k.bgGain);k.voice(80,.1,'sine',.12,k.bgGain,0,34);}if(n%4===2)k.voice(680,.045,'triangle',.025,k.bgGain,0,170);
 if(world===2&&n%8===0)for(let i=0;i<3;i++)k.voice(theme.root*Math.pow(2,(note+i*7)/12)*2,.65,'sine',.025,k.bgGain,i*.09);
 if(world===4&&n%8===0)for(let i=0;i<3;i++)k.voice(theme.root*[2,3,4][i],.9,'sine',.025,k.bgGain,i*.14);
 if(world===3&&n%8===6)k.voice(theme.root*4,.5,'sine',.026,k.bgGain,0,theme.root*2);
 }
 drill(dt,s){const k=this.kit,depth=s.deepest/84,danger=s.fuel<24||s.durability<30||s.heat>30,root=65.4-depth*24;if(k.drones)k.drones.forEach((o,i)=>o.frequency.setTargetAtTime(root*[.5,1,1.501][i],k.audio.currentTime,.7));if(k.ambienceFilter)k.ambienceFilter.frequency.setTargetAtTime(420-depth*250,k.audio.currentTime,.7);
 const interval=60/(52+depth*27+(danger?20:0))/2;this.clock+=dt;if(this.clock<interval)return;this.clock%=interval;const n=this.step++;if(n%2===0){k.voice(62,.23,'sine',.11,k.bgGain,0,30);if(depth>.4)k.voice(56,.15,'sine',.07,k.bgGain,.14,28);}
 const pattern=depth<.2?[0,7,12,7,3,7,10,7]:[0,1,7,6,0,13,7,1];if(n%2===0)k.voice(root*2*Math.pow(2,pattern[Math.floor(n/2)%8]/12),1.1,'sine',.055,k.bgGain);
 if(depth>.35&&n%8===0){k.voice(root*4,2.2,'triangle',.013,k.bgGain,0,root*3.94);k.voice(root*4.02,2.2,'sine',.02,k.bgGain,.07,root*4);}
 if(depth>.7&&n%16===12)k.voice(270,1.7,'sine',.028,k.bgGain,0,54);if(danger&&n%4===1)k.voice(155,.13,'triangle',.035,k.bgGain,0,94);
 }
}
