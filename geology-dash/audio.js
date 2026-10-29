'use strict';
class DashMusic{
 constructor(kit){this.kit=kit;this.next=0;this.level=null;this.nodes=new Set();}

 reset(level,beat){this.stop();this.level=level;this.next=Math.ceil(beat*4-1e-6);}
 stop(){for(const n of this.nodes){try{n.stop();}catch(e){}}this.nodes.clear();}
 note(freq,duration,type,volume,when,end=freq){const k=this.kit,a=k.audio;if(!a)return;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,when);o.frequency.exponentialRampToValueAtTime(Math.max(25,end),when+duration);g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(volume,when+.006);g.gain.exponentialRampToValueAtTime(.0001,when+duration);o.connect(g);g.connect(k.bgGain);o.onended=()=>{o.disconnect();g.disconnect();this.nodes.delete(o);};this.nodes.add(o);o.start(when);o.stop(when+duration+.015);}
 drum(when,open=false,snare=false){const k=this.kit,a=k.audio;if(!a||!this.buffer)return;const n=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();n.buffer=this.buffer;f.type='highpass';f.frequency.value=snare?1400:6500;g.gain.setValueAtTime(snare?.15:open?.08:.045,when);g.gain.exponentialRampToValueAtTime(.0001,when+(open?.15:snare?.1:.045));n.connect(f);f.connect(g);g.connect(k.bgGain);n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();this.nodes.delete(n);};this.nodes.add(n);n.start(when);n.stop(when+.18);}
 tick(s,playing){const k=this.kit;k.activity=playing;k.applyAudio();if(k.musicTrack)return;if(!playing||!k.audio||k.bgMuted||document.hidden||window.PiraMenuOpen){this.next=Math.ceil(s.beat*4);return;}const a=k.audio,bps=s.level.bpm/60,horizon=s.beat+.09*bps,world=GeologyDash.worlds[s.level.world];if(this.next<s.beat*4-1)this.next=Math.ceil(s.beat*4);
 while(this.next/4<horizon){const step=this.next++,beat=step/4,time=a.currentTime+Math.max(0,(beat-s.beat)/bps),within=step%16,measure=Math.floor(step/16),section=Math.floor(beat/16),root=world.note*[1,.75,.89,1.125][Math.floor(measure/2)%4],scale=[0,3,5,7,10,12,15,17],swing=s.level.variant;
  if(within%4===0)this.note(140,.18,'sine',.4,time,42);
  if(within===4||within===12)this.drum(time,false,true);
  if(within%2===0||s.level.tier>=2)this.drum(time,within===14,false);
  if(within%4===0){const bass=[1,1,1.5,1.125][(within/4+measure+swing)%4];this.note(root*.5*bass,.25/bps,'triangle',.2,time);}
  if(within%2===0&&(beat>4||within%4===0)){const index=(within/2*(swing+1)+measure*3+s.level.world+section)%scale.length;const f=root*2**(scale[index]/12);this.note(f,.23/bps,s.level.world%3===0?'triangle':'sine',.085,time);if(section%2===1&&within%4===0)this.note(f*2,.35/bps,'sine',.025,time+.014);}
  if(within===0&&measure%2===0){for(const ratio of [1,1.5,2])this.note(root*ratio,1.7/bps,'sine',.035,time);}
 }
 }
}
window.DashMusic=DashMusic;
