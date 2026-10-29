'use strict';
// The final hundred metres are part of the mine, with permanent geology and one exit ladder.
const DrillAbyss=(()=>{
 const C=48,W=160,TOP=246,BOTTOM=266;
 function build(s,hash){
  const at=(x,y)=>y*W+x,put=(x,y,v)=>{s.cells[at(x,y)]=v;},platforms=[],vents=[],pendulums=[];
  // Solid shell prevents cutting through the course or digging a second exit.
  for(let y=TOP-1;y<=BOTTOM;y++)for(let x=1;x<W-1;x++)put(x,y,y===TOP-1||y===BOTTOM||x<12||x>148?7:0);
  const entries=[22,34,46];
  for(const col of entries){
   for(let y=TOP-3;y<TOP+7;y++)for(let x=col-2;x<=col+2;x++)put(x,y,Math.abs(x-col)<=1?0:7);
  }
  // All entry shafts land on the same safe terrace; the roof is out of jump/mining reach.
  for(let x=13;x<=51;x++)for(let y=253;y<BOTTOM;y++)put(x,y,7);
  const pattern=[253,254,255,256,257,258,259,260,259,260,261,260,261,262,261,262,263,262,263,264,263,264,265,264,265,265,265];
  const ladderIndex=[8,11,14][hash(31,77,s.seed)%3];
  let col=50,index=0;
  while(col<143){
   const width=col>136?Math.min(6,147-col):index%5===0?4:index===ladderIndex?3:2,floor=pattern[Math.min(index,pattern.length-1)];
   const p={col,width,floor,x:col*C,y:floor*C,w:width*C,index};platforms.push(p);
   for(let x=col;x<col+width;x++)for(let y=floor;y<Math.min(BOTTOM,floor+(index%3===0?BOTTOM-floor:2));y++)put(x,y,7);
   col+=width+(index%3===0?2:1);index++;
  }
  const last=platforms.at(-1),dock=platforms[ladderIndex],ladderCol=dock.col+1;
  const ladder={platformIndex:ladderIndex,col:ladderCol,x:(ladderCol+.5)*C,top:242*C,bottom:dock.floor*C,floor:dock.floor};
  // Protected stone rails enclose the shaft; only the ladder connects through the roof.
  for(let y=242;y<=TOP;y++){put(ladderCol,y,0);put(ladderCol-1,y,7);put(ladderCol+1,y,7);}
  for(let x=ladderCol-1;x<=ladderCol+1;x++)for(let y=239;y<242;y++)put(x,y,0);
  // The ladder ends in a sealed pocket. The player mines their own way back out.
  s.routes.push({col:ladderCol,floor:242,basin:true,ladderCap:true});
  // Rest ledges are readable, spaced apart and remain safe during a pressure surge.
  const safe=new Set([0,5,10,15,20,platforms.length-1,ladderIndex]);
  for(const i of safe){const p=platforms[i];if(!p)continue;const center=p.col+Math.floor(p.width/2);
   s.refuges.push({col:center,floor:p.floor,region:16,x:(center+.5)*C,y:p.floor*C,width:3*C,basin:true});
  }
  for(let i=3;i<platforms.length-1;i+=4){if(safe.has(i))continue;const p=platforms[i];vents.push({x:p.x+p.w*.52,y:p.y,index:i,period:7.2,offset:i*.79,warn:1.7,active:1.15,height:76});}
  for(const i of[7,13,19]){const p=platforms[i];if(!p||safe.has(i))continue;pendulums.push({x:p.x+p.w*.5,anchor:p.y-225,y:p.y-60,length:165,period:4.8+i*.09,offset:i,r:17});}
  s.goal={x:last.x+last.w*.55,y:last.y-25,floor:last.floor};
  s.abyss={top:TOP,bottom:BOTTOM,entries,platforms,vents,pendulums,ladder,entered:false,exited:false,climbing:false,goalIndex:last.index,permanentHead:BOTTOM*C-36};
  s.revision++;
 }
 function inBasin(s){return !s.trial&&s.y>=TOP*C&&s.y<=BOTTOM*C+48;}
 function nearLadder(s){const l=s.abyss?.ladder;return !!(l&&!s.trial&&Math.abs(s.x-l.x)<30&&s.y>=l.top-3&&s.y<=l.bottom+5);}
 function climb(s,dt,input){
  const a=s.abyss;if(!a||!nearLadder(s)||Math.abs(input.dir||0)>.1){if(a)a.climbing=false;return false;}
  const direction=input.climb||0;if(!direction&&!a.climbing)return false;
  const l=a.ladder;a.climbing=true;s.x=l.x;s.vx=0;s.vy=0;s.jumpBuffer=0;s.jumpOrigin=null;s.grounded=false;
  s.y=Math.max(l.top,Math.min(l.bottom,s.y-direction*155*dt));
  if(s.y<=l.top+.01){s.grounded=true;a.climbing=false;a.exited=true;}
  return true;
 }
 function vent(s,v){const t=(s.time+v.offset)%v.period;return t<v.warn?{state:'warning',progress:t/v.warn}:t<v.warn+v.active?{state:'active',progress:(t-v.warn)/v.active}:{state:'quiet',progress:0};}
 function pendulum(s,p){const angle=Math.sin(s.time*Math.PI*2/p.period+p.offset)*.57;return {x:p.x+Math.sin(angle)*p.length,y:p.anchor+Math.cos(angle)*p.length};}
 function update(s,dt,die,emit){
  const a=s.abyss;if(!inBasin(s)||s.respawn)return;
  if(!a.entered){a.entered=true;emit(s,'basin','Het Mantelbassin · 1200–1300 m. Volg de plateaus naar de sonde. De ladder is je enige uitgang.');}
  for(const v of a.vents){const q=vent(s,v);if(q.state==='active'&&Math.abs(s.x-v.x)<22&&s.y>v.y-v.height&&s.y-34<v.y){die(s,'Een magmafontein heeft je geraakt.');return;}}
  for(const p of a.pendulums){const q=pendulum(s,p);if(Math.hypot(s.x-q.x,s.y-17-q.y)<p.r+13){die(s,'Een slingerende basaltkern heeft je geraakt.');return;}}
 }
 function objective(s){
  const a=s.abyss;if(!a)return null;
  if(s.carryingProbe&&s.y>a.ladder.top+4)return {x:a.ladder.x,y:nearLadder(s)?a.ladder.top:a.ladder.bottom,label:'Ladder naar boven',text:nearLadder(s)?'Houd ↑ of de springknop vast · klim omhoog':'Breng de sonde naar de ladder ↑'};
  if(s.drill===9&&!s.carryingProbe){
   if(inBasin(s))return {...s.goal,label:'Mantelsonde',text:'Steek het lavaparcours over naar de sonde'};
   const col=a.entries.reduce((best,n)=>Math.abs((n+.5)*C-s.x)<Math.abs((best+.5)*C-s.x)?n:best,a.entries[0]);
   return {x:(col+.5)*C,y:(TOP-2)*C,label:'Mantelbassin',text:'Delf naar de afdaling · Mantelbassin 1200 m'};
  }return null;
 }
 return {C,TOP,BOTTOM,build,inBasin,nearLadder,climb,vent,pendulum,update,objective};
})();
if(typeof module!=='undefined')module.exports=DrillAbyss;
