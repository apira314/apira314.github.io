'use strict';
(function(root){
const DX=[0,1,0,-1],DY=[-1,0,1,0],names=['De eerste geul','Water naar het dorp','Groene oevers','Drie bestemmingen','De polder','Riet en regen','Bochtenwerk','De oude meander','Kwelwater','Rivierterrassen','De beekvallei','Grondwaterbron','Droge akkers','Zomerreserve','Waterverdeling','De brede delta','Bergwater','Een lange omweg','Vertakte rivier','Het stroomgebied','Laatste voorraad','De droge zomer','Deltameester','Iedere druppel telt'];
const themes=[{name:'Lentevallei',sky:'#abcfc7',land:'#466d50',accent:'#a7edc8'},{name:'Gouden polder',sky:'#d8c997',land:'#786f44',accent:'#f6db99'},{name:'Bergstroom',sky:'#a9c6d9',land:'#456575',accent:'#b1e8fa'},{name:'Avonddelta',sky:'#b9a4bf',land:'#4d586c',accent:'#dfc2ff'}];
const levels=names.map((name,id)=>({id,name,n:id<4?4:id<10?5:id<18?6:id<22?7:8,theme:Math.floor(id/6),quota:3+Math.floor(id/3),seed:419+id*733}));
function rng(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
function rotate(mask){return((mask<<1)&15)|(mask>>3);}
function neighbor(i,d,n){const x=i%n+DX[d],y=Math.floor(i/n)+DY[d];return x>=0&&x<n&&y>=0&&y<n?y*n+x:-1;}
function initial(id=0){const l=levels[Math.max(0,Math.min(23,id|0))],n=l.n,random=rng(l.seed),source=Math.floor(n/2),targets=[(n-1)*n,(n-1)*n+n-1,(n-1)*n+Math.floor(n/2)],tree=new Set([source]),solution=Array(n*n).fill(0),weights=Array.from({length:n*n},()=>.2+random()*3.4);
 for(const target of targets){const dist=Array(n*n).fill(Infinity),prev=Array(n*n).fill(-1),done=new Set();dist[target]=0;let end=-1;
  for(let k=0;k<n*n;k++){let at=-1,best=Infinity;for(let i=0;i<n*n;i++)if(!done.has(i)&&dist[i]<best){at=i;best=dist[i];}if(at<0)throw Error('No channel route');if(tree.has(at)&&!targets.includes(at)){end=at;break;}done.add(at);for(let d=0;d<4;d++){const next=neighbor(at,d,n);if(next<0||targets.includes(next)&&next!==target)continue;const cost=dist[at]+weights[next];if(cost<dist[next]){dist[next]=cost;prev[next]=at;}}}
  for(let a=end;prev[a]!==-1;){const b=prev[a],d=DX.findIndex((dx,i)=>neighbor(a,i,n)===b);solution[a]|=1<<d;solution[b]|=1<<((d+2)%4);tree.add(a);tree.add(b);a=b;}
 }
 const tiles=solution.map((mask,i)=>{const fixed=i===source||targets.includes(i);let m=mask;if(!fixed)for(let k=0,t=1+Math.floor(random()*3);k<t;k++)m=rotate(m);return{mask:m,solution:mask,fixed,wet:0};});
 if(id<3){let remaining=2+id*2;for(const tile of tiles)if(!tile.fixed&&tile.mask!==tile.solution){if(remaining>0)remaining--;else tile.mask=tile.solution;}}
 // Special structures follow an existing route, so their purpose is spatially clear.
 const parent=Array(n*n).fill(-1),queue=[source];parent[source]=source;for(let k=0;k<queue.length;k++){const at=queue[k];for(let d=0;d<4;d++)if(solution[at]&(1<<d)){const next=neighbor(at,d,n);if(parent[next]<0){parent[next]=at;queue.push(next);}}}
 const paths=targets.map(target=>{const path=[];for(let at=target;at!==source;at=parent[at])path.unshift(at);return path;}).sort((a,b)=>b.length-a.length);
 const path=paths[0],internal=path.slice(0,-1).filter(i=>i!==source),straight=internal.filter(i=>solution[i].toString(2).replace(/0/g,'').length===2),candidates=straight.length>=2?straight:internal;
 const basin=id>=8?candidates[Math.max(0,candidates.length-3)]:-1,weir=id>=12?candidates[candidates.length-1]:-1;
 if(basin>=0){tiles[basin].kind='basin';tiles[basin].fixed=true;tiles[basin].mask=tiles[basin].solution;}
 if(weir>=0&&weir!==basin){tiles[weir].kind='weir';tiles[weir].fixed=true;tiles[weir].mask=tiles[weir].solution;}
 // Fixed aqueducts, silt filters and scheduled destinations build on three simple actions.
 const filter=id>=6?internal.find(i=>i!==basin&&i!==weir):-1;
 if(filter>=0){tiles[filter].kind='filter';tiles[filter].fixed=true;tiles[filter].mask=tiles[filter].solution;}
 for(let i=0;i<tiles.length;i++){const q=tiles[i];if(id>=5&&q.mask&&!q.fixed&&random()<.12){q.fixed=true;q.mask=q.solution;q.kind='aqueduct';}else if(id>=10&&!q.mask&&random()<.32){q.mask=[3,5,6,9,10,12][Math.floor(random()*6)];q.decoy=true;}}
 const order=id<4?[0,1,2]:[[0,1,2],[1,2,0],[2,0,1],[2,1,0]][id%4];
 let minimum=0;for(const q of tiles){if(q.fixed||!q.solution)continue;let m=q.mask,k=0;while(m!==q.solution&&k<4){m=rotate(m);k++;}minimum+=Math.min(k,4-k);}
 const needs=targets.map((_,i)=>l.quota+(id>7?i:0)),budget=Math.ceil(needs.reduce((a,b)=>a+b,0)*(id<4?2.2:id<12?1.65:id<18?1.4:1.22));
 return{filter,filterLoad:0,filterNeed:id>=6?2+Math.floor(id/8):0,order,buildLimit:id<4?Infinity:minimum+Math.max(2,9-Math.floor(id/3)),history:[],level:l,n,source,targets,tiles,needs,filled:[0,0,0],budget,remaining:budget,leaks:0,excess:0,moves:0,hints:0,packets:[],turns:Array(n*n).fill(0),time:0,clock:0,running:false,ended:false,won:false,events:[],score:0,valves:[true,true,true],basin,weir:weir===basin?-1:weir,basinOpen:false,stored:[],capacity:id<16?12:10,releaseClock:0,waiting:[],flood:0,floodLimit:id<4?Infinity:id<8?12:id<16?8:Math.max(3,8-Math.floor((id-16)/2)),reason:''};
}
function turn(s,i,dir=1){if(s.ended||s.running||s.packets.length||!s.tiles[i]||s.tiles[i].fixed||!s.tiles[i].mask||s.moves>=s.buildLimit)return false;const before=s.tiles[i].mask;s.history.push({i,mask:before});if(s.history.length>200)s.history.shift();for(let k=0;k<(dir===-1?3:1);k++)s.tiles[i].mask=rotate(s.tiles[i].mask);s.moves++;return true;}
function undo(s){if(s.running||s.packets.length||!s.history.length||s.ended)return false;const q=s.history.pop();s.tiles[q.i].mask=q.mask;s.moves=Math.max(0,s.moves-1);return true;}
function demandOpen(s,k){if(!s.valves[k]||s.filled[k]>=s.needs[k])return false;if(s.level.id<4)return true;const stage=s.order.find(j=>s.filled[j]<s.needs[j]);return k===stage;}
function hint(s,i){if(s.ended||s.running||s.packets.length||s.level.id>=12&&s.hints>=1)return -1;if(!s.tiles[i]||!s.tiles[i].solution||s.tiles[i].fixed||s.tiles[i].mask===s.tiles[i].solution)i=s.tiles.findIndex(t=>t.solution&&t.mask!==t.solution&&!t.fixed);if(i<0)return -1;s.tiles[i].mask=s.tiles[i].solution;s.hints++;return i;}
function leak(s,at){s.leaks++;s.events.push({type:'leak',at});}
function tide(s){const period=s.level.id<18?9:7,openFor=s.level.id<18?5:3.4,phase=s.time%period;return{open:phase<openFor,left:phase<openFor?openFor-phase:period-phase,period};}
function toggle(s,i){if(s.ended)return false;const k=s.targets.indexOf(i);if(k>=0)return false;if(i===s.basin){s.basinOpen=!s.basinOpen;return true;}return false;}
function spill(s,at){s.flood++;leak(s,at);s.events.push({type:'flood',at});}
// A closed destination creates back-pressure. Junctions can feed the remaining open branches.
function passable(s,start,previous){if(start<0)return true;const seen=new Set([previous]),queue=[start];for(let k=0;k<queue.length;k++){const at=queue[k];if(seen.has(at))continue;seen.add(at);const target=s.targets.indexOf(at);if(target>=0){if(demandOpen(s,target))return true;continue;}if(at===s.basin&&!s.basinOpen)return true;for(let d=0;d<4;d++)if(s.tiles[at].mask&(1<<d)){const next=neighbor(at,d,s.n);if(next===previous)continue;if(next<0||!(s.tiles[next].mask&(1<<((d+2)%4))))return true;if(!seen.has(next))queue.push(next);}}return false;}
function route(s,at,from=-1,steps=0,bypass=false){const tile=s.tiles[at];tile.wet=s.time+1.7;if(at===s.filter&&s.filterLoad<s.filterNeed){s.filterLoad++;s.events.push({type:'filter',at});return;}if(at===s.basin&&!bypass){if(s.stored.length<s.capacity)s.stored.push({from,steps});else spill(s,at);return;}if(at===s.weir&&!tide(s).open){spill(s,at);return;}const target=s.targets.indexOf(at);if(target>=0){if(!demandOpen(s,target)){s.remaining=Math.min(s.budget,s.remaining+1);s.events.push({type:'return',at});return;}if(s.filled[target]<s.needs[target]){s.filled[target]++;s.events.push({type:'fill',at,target});}else{s.excess++;if(s.level.id>=4)spill(s,at);}return;}
 const exits=[];for(let d=0;d<4;d++)if((tile.mask&(1<<d))&&d!==from)exits.push(d);if(!exits.length||steps>s.n*s.n*2){leak(s,at);return;}const available=exits.filter(d=>passable(s,neighbor(at,d,s.n),at));if(!available.length){s.remaining=Math.min(s.budget,s.remaining+1);s.events.push({type:'return',at});return;}const dir=available[s.turns[at]++%available.length],to=neighbor(at,dir,s.n);s.packets.push({from:at,to,dir,p:0,steps:steps+1});}
function tick(s,dt){if(s.ended)return;dt=Math.min(.05,Math.max(0,dt));s.events=[];s.time+=dt;const waiting=s.waiting;s.waiting=[];for(const p of waiting)route(s,p.at,p.from,p.steps);if(s.basinOpen&&s.stored.length){s.releaseClock+=dt;while(s.releaseClock>=.36&&s.stored.length){s.releaseClock-=.36;const p=s.stored.shift();route(s,s.basin,p.from,p.steps,true);}}else s.releaseClock=0;if(s.running&&s.remaining>0&&s.valves.some(Boolean)){s.clock+=dt;while(s.clock>=.28&&s.remaining>0){s.clock-=.28;s.remaining--;route(s,s.source);}}
 const old=s.packets;s.packets=[];for(const p of old){p.p+=dt/(.22-s.level.id*.002);if(p.p<1){s.packets.push(p);continue;}if(p.to<0||!(s.tiles[p.to].mask&(1<<((p.dir+2)%4)))){leak(s,p.from);}else route(s,p.to,(p.dir+2)%4,p.steps);}
 if(s.flood>=s.floodLimit){s.ended=true;s.running=false;s.reason='flood';s.events.push({type:'over'});}
 else if(s.filled.every((v,i)=>v>=s.needs[i])){s.won=s.ended=true;s.running=false;s.score=1000+s.remaining*20-Math.min(400,s.leaks*12)-s.hints*30;s.score=Math.max(100,s.score);s.events.push({type:'win'});}
 else if(s.remaining===0&&s.packets.length===0&&s.stored.length===0&&s.waiting.length===0){s.ended=true;s.running=false;s.events.push({type:'over'});}
}
function resetWater(s){const fresh=initial(s.level.id);for(let i=0;i<s.tiles.length;i++)fresh.tiles[i].mask=s.tiles[i].mask;fresh.moves=s.moves;fresh.hints=s.hints;fresh.history=s.history.slice();return fresh;}
function connections(s){const reached=new Set([s.source]),queue=[s.source],loose=[];for(let k=0;k<queue.length;k++){const at=queue[k];if(s.targets.includes(at))continue;for(let d=0;d<4;d++){if(!(s.tiles[at].mask&(1<<d)))continue;const next=neighbor(at,d,s.n);if(next<0||!(s.tiles[next].mask&(1<<((d+2)%4)))){loose.push({at,dir:d});continue;}if(!reached.has(next)){reached.add(next);queue.push(next);}}}return{reached,loose,connected:s.targets.map(i=>reached.has(i))};}
function stars(s){return!s.won?0:s.hints>2?1:s.hints||s.leaks>0?2:3;}
const api={undo,demandOpen,tide,toggle,passable,connections,levels,themes,initial,turn,hint,tick,resetWater,stars,neighbor,rotate,DX,DY};root.WaterWays=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
