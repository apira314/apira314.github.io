'use strict';
(function(root){
const GRAVITY=8,IMPULSE=5.2,HALF=.085,SIZE=.4;
const worlds=[
 {name:'Sedimenten',color:'#efc879',dark:'#463b36',sky:'#121c30',mineral:'Kwarts',note:130.81,names:['Zandkorrel Sprint','Delta Groove','Duinritme','Diagenese']},
 {name:'Carbonaten',color:'#a2f2db',dark:'#184c50',sky:'#082330',mineral:'Calciet',note:146.83,names:['Kalksteen Cadans','Rifroute','Karstklanken','Dolomiet Drive']},
 {name:'Kristallen',color:'#bca5ff',dark:'#382954',sky:'#16142b',mineral:'Amethist',note:164.81,names:['Kwarts Kwartet','Amethist Avenue','Geode Galop','Kristalbreuk']},
 {name:'Vulkanisme',color:'#ff9b7e',dark:'#652a35',sky:'#230f26',mineral:'Olivijn',note:110,names:['Basalt Beat','Lavastroom','Obsidiaan Overdrive','Caldera Clash']},
 {name:'Metamorfose',color:'#ec9ccf',dark:'#4b2b50',sky:'#19192c',mineral:'Granaat',note:123.47,names:['Leisteen Shuffle','Schist Shift','Gneis Noise','Eclogiet Express']},
 {name:'Tektoniek',color:'#83d7fa',dark:'#234654',sky:'#101a32',mineral:'Veldspaat',note:98,names:['Breuklijn Bounce','Transform Tempo','Subductie Sync','Pangea Pulse']},
 {name:'Glaciale wereld',color:'#c0eeff',dark:'#25486c',sky:'#101d3a',mineral:'Bergkristal',note:174.61,names:['Firn Flow','Morene Machine','Gletsjer Glitch','Permafrost Panic']},
 {name:'Diepe aarde',color:'#ffd585',dark:'#543541',sky:'#100f25',mineral:'Diamant',note:87.31,names:['Mantel Mars','Pluim Protocol','Kernresonantie','Mohorovičić Mayhem']}
];
const levels=worlds.flatMap((w,world)=>w.names.map((name,i)=>{const id=world*4+i;return{id,name,world,tier:Math.floor(id/8),bpm:id<8?108+id*4:128+(id%4)*3+Math.floor((id-8)/8)*4,length:76+Math.floor(id/4)*12,seed:9187+id*233,variant:i};}));
const journeys=[
{name:'Duinzeiler',icon:'≋',up:2.5,down:-1.6,response:7,note:'Zweef op de wind. Vasthouden stijgt; loslaten daalt rustig.'},
{name:'Karstduiker',icon:'◉',up:2.3,down:-1.7,response:6,note:'Duik door de bron. Stuur de luchtbel tussen kalksteenwanden.'},
{name:'Kristalvlucht',icon:'◇',up:2.7,down:-2.1,response:10,note:'Vlieg door geodes en verzamel de hoge kristalbogen.'},
{name:'Magmaraket',icon:'▲',up:2.9,down:-2.1,response:11,note:'Stijg langs magmazuilen. Korte drukjes houden je op hoogte.'},
{name:'Faseglijder',icon:'↕',up:2.6,down:-1.9,response:9,note:'Tussen de vluchten kantelt de wereld. De springknop blijft hetzelfde.'},
{name:'Breukvlucht',icon:'⋈',up:2.7,down:-2,response:10,note:'Lees de verspringende doorgangen tussen aardplaten.'},
{name:'Poollichtzeiler',icon:'❄',up:2.4,down:-1.65,response:7,note:'Een rustige glijvlucht door ijsbogen. Anticipeer op de volgende opening.'},
{name:'Kerncapsule',icon:'◎',up:2.8,down:-2.1,response:10,note:'Wissel tussen kernvlucht, omgekeerde banen en mineraalringen.'}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function random(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function course(id){const l=levels[clamp(id|0,0,31)],rng=random(l.seed),obstacles=[],gems=[],cues=[],checkpoints=[0],sections=[],powers=[],rings=[];let uid=0;
 const patterns=l.tier===0?[[0,3,6],[0,2,5],[0,4,6],[0,2,4,6]]:l.tier===1?[[0,2,4,6],[0,2.5,4,6],[0,1.5,4,6],[0,3,4.5,6.5]]:l.tier===2?[[0,1.5,3.5,5,6.5],[0,2,3.5,5.5],[0,.0+1.75,3.5,5,6.5],[0,2.5,4,6.25]]:[[0,1.5,3,4.5,6.25],[0,1.75,3.5,5,6.5],[0,2,3.5,5,6.5],[0,1.5,3.25,5,6.5]];
 for(let bar=4,index=0;bar<l.length-4;bar+=8,index++){
  if(index%2===0&&bar>4)checkpoints.push(bar-.125);
  let sequence=patterns[(index+l.variant)%patterns.length];if(l.id>=8){const advanced=[[0,1.5,3.25,5,6.5],[0,1.75,3.5,5.25],[0,2.25,3.75,5.5],[0,1.6,3.25,4.9],[0,2,4,6.25],[0,1.5,3,4.75,6.5]];sequence=advanced[Math.floor(rng()*advanced.length)];}if(l.id>=12&&index%5===3)sequence=[0,1.75,4];
  // First measure introduces a single obstacle; later measures use the level's full rhythm.
  if(index===0)sequence=l.tier===0?[1,5]:[0,3,6];
  for(let j=0;j<sequence.length;j++){
   const cue=bar+sequence[j];if(cue>l.length-3)continue;cues.push(cue);const choose=l.id<8?(index+j+l.variant)%5:Math.floor(rng()*5);
   if(choose===2&&l.id>=3){obstacles.push({id:uid++,kind:'pit',b:cue+(l.id>=8?.3:.37),w:l.id>=8?.70+(l.id/31)*.12:.56+l.tier*.09,h:0});}
   else if(choose===3&&l.id>=6){obstacles.push({id:uid++,kind:'block',b:cue+.44,w:l.id>=8?.38+l.id*.002:.29+l.tier*.035,h:l.id>=8?.86+l.id*.007:.73+l.tier*.075});}
   else{const count=l.id>=8?(choose===4?4:3):l.tier===0?(index>2&&l.variant>1?2:1):l.tier===1?2:choose===4?3:2;for(let k=0;k<count;k++)obstacles.push({id:uid++,kind:'spike',b:cue+(l.id>=8?.34:.42)+k*.17,w:.17,h:.53+l.tier*.025});}
   gems.push({id:uid++,b:cue+.65,h:1.55,got:false});
  }
  // A hanging slab in a rest measure rewards staying grounded rather than holding jump.
  if(l.id>=8&&sequence.at(-1)<5.6)obstacles.push({id:uid++,kind:'ceiling',b:bar+6.8,w:.62,h:.9});
 }
 // Flying measures replace ground obstacles and always end in an empty landing strip.
 for(let bar=12,index=0;bar<l.length-10;bar+=16,index++){
  if(l.id>=2&&index%2===0){const section={from:bar,to:bar+6,kind:'flight',vehicle:l.world};sections.push(section);for(let b=bar+1.5;b<bar+5.8;b+=l.id<16?1.65:1.4){const h=2.15+Math.sin(b*.55+l.id)*(.3+Math.min(.25,l.id*.008));obstacles.push({id:uid++,kind:'gate',b,w:.16,h,gap:l.id<8?Math.max(1.8,2.6-l.id*.025):Math.max(1.65,2.15-(l.id-8)*.017)});gems.push({id:uid++,b:b+.08,h,got:false});rings.push({id:uid++,b:b+.65,h:h+((Math.floor(b)%2?1:-1)*(.22+24/l.bpm)),got:false});}}
  else{const types=['shield','magnet','double','phase'],kind=types[(Math.floor(index/2)+l.id)%4];powers.push({from:bar,to:bar+(kind==='phase'?2.5:6),kind});}
 }
 const flips=(l.world===4||l.world===7)?Array.from({length:Math.floor((l.length-20)/32)},(_,i)=>({from:28+i*32,to:36+i*32})):[];
 const inside=b=>sections.some(v=>b>=v.from-.3&&b<v.to+1.6);
 return{rings,flips,level:l,obstacles:obstacles.filter(o=>o.kind==='gate'||!inside(o.b)).sort((a,b)=>a.b-b.b),gems:gems.filter(g=>!inside(g.b)||obstacles.some(o=>o.kind==='gate'&&Math.abs(o.b+.08-g.b)<.01)),cues:cues.filter(b=>!inside(b)),checkpoints,sections,powers};
}
function initial(id=0,practice=false){const data=course(id);return{...data,practice,beat:0,h:0,vy:0,grounded:true,rotation:0,ended:false,won:false,events:[],gemsCount:0,perfect:0,perfectIds:[],score:0,checkpoint:0,checkpointData:{beat:0,gems:[],gemsCount:0,perfect:0,perfectIds:[]},buffer:0,lastJump:-10,maxBeat:0,crashes:0,flight:false,inverted:false,ringChain:0,ringScore:0,power:null,usedPowers:[],shield:false,powerUntil:0,bonus:0,immune:0};}
function requestJump(s){if(!s.ended)s.buffer=.16;}
function die(s){if(s.ended||s.immune>s.beat||s.power==='phase')return;if(s.shield){s.shield=false;s.power=null;s.immune=s.beat+.8;s.events.push({type:'shield-break'});if(s.h<0){s.h=0;s.vy=IMPULSE;s.grounded=false;}return;}s.ended=true;s.crashes++;s.events.push({type:'crash'});}
function tick(s,seconds,held=false){if(s.ended)return;const dt=clamp(seconds,0,1/60)*s.level.bpm/60;s.buffer=Math.max(0,s.buffer-dt);s.events=[];
 const flip=s.flips.some(v=>s.beat>=v.from&&s.beat<v.to);if(flip!==s.inverted){s.inverted=flip;s.events.push({type:'invert',active:flip});}
 const air=s.sections.find(v=>s.beat>=v.from&&s.beat<v.to);
 if(!!air!==s.flight){s.flight=!!air;s.buffer=0;s.vy=0;s.grounded=false;if(air){s.h=2;s.events.push({type:'flight'});}else{s.events.push({type:'ground'});}}
 const power=s.powers.find(v=>s.beat>=v.from&&s.beat<v.to);
 if(power&&!s.usedPowers.includes(power.from)){s.usedPowers.push(power.from);s.power=power.kind;s.powerUntil=power.to;s.shield=power.kind==='shield';s.events.push({type:'power',kind:power.kind});}
 if(s.power&&s.beat>=s.powerUntil){s.power=null;s.shield=false;}
 if((held||s.buffer>0)&&s.grounded&&!s.flight){s.vy=IMPULSE;s.grounded=false;s.buffer=0;s.lastJump=s.beat;const cueIndex=s.cues.findIndex(b=>Math.abs(b-s.beat)<.14);if(cueIndex>=0&&!s.perfectIds.includes(cueIndex)){s.perfectIds.push(cueIndex);s.perfect=s.perfectIds.length;s.events.push({type:'perfect'});}s.events.push({type:'jump'});}
 s.beat+=dt;s.maxBeat=Math.max(s.maxBeat,s.beat);
 if(s.flight){const flightDt=dt*60/s.level.bpm,profile=journeys[s.level.world],target=held?profile.up:profile.down;s.vy+=(target-s.vy)*(1-Math.exp(-flightDt*profile.response));s.h+=s.vy*flightDt;s.rotation=s.vy*-.08;if(s.h<.16){s.h=.16;s.vy=Math.max(0,s.vy);}if(s.h>4.05){s.h=4.05;s.vy=Math.min(0,s.vy);}}else if(!s.grounded){s.vy-=GRAVITY*dt;s.h+=s.vy*dt;s.rotation+=dt*Math.PI*1.54;}
 const pit=s.obstacles.some(o=>o.kind==='pit'&&s.beat>o.b+HALF*.3&&s.beat<o.b+o.w-HALF*.3);
 if(s.h<=0){if(pit){die(s);}else{s.h=0;s.vy=0;if(!s.grounded)s.events.push({type:'land'});s.grounded=true;s.rotation=Math.round(s.rotation/(Math.PI/2))*Math.PI/2;}}
 for(const o of s.obstacles){if(o.b>s.beat+HALF||o.b+o.w<s.beat-HALF||o.kind==='pit')continue;
  if(o.kind==='gate'){if(s.h<o.h-o.gap/2||s.h+SIZE>o.h+o.gap/2)die(s);}else if(o.kind==='ceiling'){if(s.h+SIZE>o.h)die(s);}else if(o.kind==='block'){if(s.h<o.h-.015)die(s);}else{const nearest=clamp(s.beat,o.b,o.b+o.w);const height=o.h*(1-Math.abs((nearest-(o.b+o.w/2))/(o.w/2)));if(s.h<height-.01)die(s);}}
 if(s.ended)return;
 for(const g of s.gems)if(!g.got&&Math.abs(g.b-s.beat)<(s.power==='magnet'?.6:.14)&&Math.abs(g.h-(s.h+SIZE*.5))<(s.power==='magnet'?4:.48)){g.got=true;s.gemsCount++;if(s.power==='double')s.bonus+=25;s.events.push({type:'gem',b:g.b,h:g.h});}
 for(const r of s.rings){if(r.got||r.missed)continue;if(Math.abs(r.b-s.beat)<.17&&Math.abs(r.h-(s.h+SIZE/2))<.20){r.got=true;s.ringChain++;const value=40+Math.min(5,s.ringChain)*10;s.ringScore+=value;s.events.push({type:'ring',b:r.b,h:r.h,value});}else if(s.beat>r.b+.18){r.missed=true;s.ringChain=0;}}
 s.score=Math.floor(Math.min(1,s.beat/s.level.length)*1000)+s.gemsCount*25+s.perfect*10+s.bonus+s.ringScore;
 if(s.practice){for(const cp of s.checkpoints)if(cp>s.checkpoint&&s.beat>=cp){s.checkpoint=cp;s.checkpointData={beat:cp,gems:s.gems.filter(g=>g.got&&g.b<cp).map(g=>g.id),gemsCount:s.gems.filter(g=>g.got&&g.b<cp).length,perfect:s.perfectIds.filter(i=>s.cues[i]<cp).length,perfectIds:s.perfectIds.filter(i=>s.cues[i]<cp),bonus:s.bonus,ringScore:s.ringScore,ringChain:s.ringChain,rings:s.rings.filter(r=>r.got&&r.b<cp).map(r=>r.id)};s.events.push({type:'checkpoint'});}}
 if(s.beat>=s.level.length){s.ended=true;s.won=true;s.events.push({type:'win'});}
}
function retry(s){if(!s.practice)return initial(s.level.id,false);const n=initial(s.level.id,true),cp=s.checkpointData;n.beat=cp.beat;n.checkpoint=cp.beat;n.checkpointData=cp;n.gemsCount=cp.gemsCount;n.perfect=cp.perfect;n.perfectIds=[...cp.perfectIds];n.bonus=cp.bonus||0;n.ringScore=cp.ringScore||0;n.ringChain=cp.ringChain||0;for(const r of n.rings){r.got=(cp.rings||[]).includes(r.id);r.missed=r.b<cp.beat&&!r.got;}n.crashes=s.crashes;n.maxBeat=s.maxBeat;for(const g of n.gems)g.got=cp.gems.includes(g.id);n.score=Math.floor(cp.beat/n.level.length*1000)+n.gemsCount*25+n.perfect*10+n.bonus+n.ringScore;return n;}
const api={journeys,worlds,levels,course,initial,tick,requestJump,retry,GRAVITY,IMPULSE,SIZE};root.GeologyDash=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
