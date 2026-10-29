'use strict';
const DrillModel=(()=>{
const Caverns=typeof DrillCaverns!=='undefined'?DrillCaverns:require('./caverns.js');
const Abyss=typeof DrillAbyss!=='undefined'?DrillAbyss:require('./abyss.js');
const Trials=typeof DrillTrials!=='undefined'?DrillTrials:require('./trials.js');
const C=48,W=160,H=276,SURFACE=6,GOAL_DEPTH=1300,GOAL=266,G=1100,JUMP=Math.sqrt(2*G*C*2),R=13,PH=34,VERSION=15;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rocks=[
 {name:'Klei',color:'#927257',edge:'#c0a383',hard:.48,texture:'earth'},
 {name:'Zandsteen',color:'#b89360',edge:'#e9c894',hard:.60,texture:'sand'},
 {name:'Kalksteen',color:'#899c89',edge:'#ced6b0',hard:.78,texture:'fossil'},
 {name:'Graniet',color:'#7e849e',edge:'#bcc9d1',hard:1.02,texture:'speckle'},
 {name:'Basalt',color:'#4c5264',edge:'#8c9aaf',hard:1.32,texture:'columns'},
 {name:'Obsidiaan',color:'#41344f',edge:'#bd94cf',hard:1.55,texture:'glass'},null,
 {name:'Schalie',color:'#73848d',edge:'#afc3c9',hard:.68,texture:'lamina'},
 {name:'Conglomeraat',color:'#9d8064',edge:'#d9ba91',hard:.72,texture:'pebbles'},
 {name:'Fossielkalk',color:'#ada489',edge:'#f0ddaf',hard:.85,texture:'fossil'},
 {name:'Tufsteen',color:'#768875',edge:'#afc799',hard:.62,texture:'pores'},
 {name:'Kwartsader',color:'#a0c9d2',edge:'#e0fbfa',hard:1.08,texture:'crystal'},
 {name:'Marmer',color:'#977ea5',edge:'#d8bfdd',hard:1.14,texture:'veins'},
 {name:'Pegmatiet',color:'#bd858e',edge:'#f2c7c3',hard:1.22,texture:'crystal'},
 {name:'Gneis',color:'#748a9b',edge:'#b9d4df',hard:1.25,texture:'waves'},
 {name:'Serpentiniet',color:'#4f9686',edge:'#a7e4b3',hard:1.28,texture:'veins'},
 {name:'Gabbro',color:'#434e61',edge:'#9bb6bc',hard:1.45,texture:'speckle'},
 {name:'Olivijngesteente',color:'#778c4e',edge:'#c9d787',hard:1.62,texture:'crystal'},
 {name:'Korundader',color:'#936376',edge:'#efaccb',hard:1.8,extra:1,texture:'crystal'}
];
const drillNames=['','Startlaser','Focuslens','Kwartslaser','Diamantlens','Prismalaser','Plasmalaser','Basaltlaser','Fotonlens','Mantellaser'];
const drillColors=['','#e2be69','#b6e6a4','#8de6e8','#bad9ff','#d6a5ff','#ffad83','#f1b198','#bccfff','#ffe19c'];
const boundaries=[40,68,96,124,152,180,208,236];
const biomes=[
 {name:'Wortelgrond',back:'#18332f',glow:'#b8e7a0',kinds:[1,2,8,9],scene:'roots'},
 {name:'Fossielenrif',back:'#38303b',glow:'#efd0a0',kinds:[2,3,9,10],scene:'fossils'},
 {name:'Groene karst',back:'#123c3b',glow:'#92e0c1',kinds:[3,10,11,12],scene:'karst'},
 {name:'Prismagrotten',back:'#2a2544',glow:'#d0b0ff',kinds:[4,12,13,14],scene:'crystals'},
 {name:'Verloren galerijen',back:'#282d3b',glow:'#e6c196',kinds:[4,8,14,15],scene:'ruins'},
 {name:'Blauwe breuk',back:'#20374e',glow:'#a7e3ff',kinds:[13,15,16,17],scene:'blue'},
 {name:'Basaltkathedralen',back:'#3b2538',glow:'#ffbd8f',kinds:[5,6,16,17],scene:'basalt'},
 {name:'De mantelgrens',back:'#281e34',glow:'#ffba85',kinds:[5,6,18,19],scene:'mantle'}
];
const regionStarts=Array.from({length:16},(_,i)=>16+i*14);
const regions=['Wortelkamers','Paddenstoelholtes','Schelpenbanken','Ribbenkamers','Karstpoelen','Druipsteenkamers','Amethistnesten','Kwartstuinen','Verlaten meetposten','Oude mijngalerijen','Blauwe geodes','Serpentijngrotten','Basaltkamers','Obsidiaanspiegels','Olivijnholtes','Mantelvensters'].map((name,i)=>({name,start:regionStarts[i],end:regionStarts[i+1]||Abyss.TOP,kind:Math.floor(i/2),variant:i%2}));
function regionAt(row){let i=0;while(i<regions.length-1&&row>=regions[i+1].start)i++;return i;}
function hash(x,y,seed){let n=Math.imul(x+91,374761393)^Math.imul(y+51,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0;}
function typeAt(row){return Math.min(7,boundaries.filter(n=>row>=n).length);}
function requiredTier(row,kind=1){return Math.min(9,1+boundaries.filter(n=>row>=n).length+(rocks[kind-1]?.extra||0));}
function at(x,y){return y*W+x;}function inside(x,y){return x>=0&&x<W&&y>=0&&y<H;}
function solid(s,x,y){return !inside(x,y)||s.cells[at(x,y)]!==0;}
function cellType(x,y,seed){const kinds=biomes[typeAt(y)].kinds,n=hash(Math.floor(x/3),Math.floor(y/2),seed);return kinds[n%100<46?0:n%100<73?1:n%100<94?2:3];}
function reveal(s,starts){
 const px=Math.floor(s.x/C),py=Math.floor((s.y-PH/2)/C),q=[...starts],visited=new Set();
 // Only exposed air and its adjacent rock face are revealed; sealed rooms stay hidden.
 for(let head=0;head<q.length;head++){
  const n=q[head],x=n%W,y=Math.floor(n/W);if(n<0||n>=W*H||visited.has(n)||Math.abs(x-px)>14||Math.abs(y-py)>10)continue;
  visited.add(n);s.seen[n]=1;if(s.cells[n]!==0)continue;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!inside(x+dx,y+dy))continue;const i=at(x+dx,y+dy);if(s.cells[i])s.seen[i]=1;else if(dx===0||dy===0)q.push(i);}
 }s.revision++;s.revealedAt=at(px,py);
}
const exposureCache=new WeakMap();
function exposedFloor(s){
 const cached=exposureCache.get(s);if(cached?.revision===s.revision)return cached.floor;
 let floor=SURFACE;
 outer:for(let y=H-2;y>=SURFACE;y--)for(let x=1;x<W-1;x++)if(s.seen[at(x,y)]&&s.cells[at(x,y)]===0){floor=y+1;break outer;}
 exposureCache.set(s,{revision:s.revision,floor});return floor;
}
function quietLava(){return {clock:0,phase:'quiet',time:0,base:SURFACE*C,head:H*C,fill:[],fillClock:0,warning:7};}
function initial(seed=Math.floor(Math.random()*1000000)){
 const cells=new Uint8Array(W*H),seen=new Uint8Array(W*H);
 for(let y=SURFACE;y<H;y++)for(let x=0;x<W;x++)cells[at(x,y)]=x===0||x===W-1||y===H-1?7:cellType(x,y,seed);
 const layout=Caverns.build({C,W,H,SURFACE,GOAL,seed,cells,regions,cellType,hash});
 const {portals,structures}=layout;
 const s={version:VERSION,seed,cells,seen,...layout,portals,structures,x:80.5*C,y:SURFACE*C,vx:0,vy:0,grounded:true,jumpBuffer:0,coyote:0,jumpOrigin:null,drill:1,deaths:0,carryingProbe:false,time:0,deepest:0,phase:0,score:0,fuel:100,durability:100,heat:0,ended:false,won:false,events:[],mining:null,damage:{},revision:0,blocked:0,lava:quietLava(),goal:{x:80.5*C,y:GOAL*C-25},trial:null,transition:0,respawn:0,invulnerable:0,portalCooldown:0};
 Abyss.build(s,hash);Caverns.prepareReturn(s);for(let y=0;y<=SURFACE;y++)for(let x=0;x<W;x++)seen[at(x,y)]=1;reveal(s,[at(80,SURFACE-1)]);return s;
}
function emit(s,type,text='',extra={}){s.events.push({type,text,...extra});if(text)s.last=text;}
function die(s,reason){
 if(s.ended||s.respawn>0||s.invulnerable>0)return;
 const returning=s.carryingProbe;s.deaths++;s.carryingProbe=false;s.abyss.climbing=false;s.abyss.exited=false;s.mining=null;s.trial=null;s.transition=0;s.jumpBuffer=0;s.respawn=2.4;
 emit(s,'death',reason+' Terug naar het veldstation. Onbeperkte pogingen.'+(returning?' Haal de sonde opnieuw op.':''));
}
function returnToSurface(s){s.x=80.5*C;s.y=SURFACE*C;s.vx=0;s.vy=0;s.grounded=true;s.jumpOrigin=null;s.jumpBuffer=0;s.coyote=0;s.invulnerable=2;s.lava=quietLava();s.portalCooldown=2;emit(s,'respawn','Terug bij het veldstation. Je mijnhoed en gegraven tunnels zijn behouden.');}
function jump(s){if(s.ended||s.respawn||s.transition)return;if(s.trial)Trials.jump(s.trial);else s.jumpBuffer=.15;}
function canMine(s,col,row){
 if(s.ended||s.trial||s.respawn||s.transition)return {ok:false,reason:''};
 if(!inside(col,row))return {ok:false,reason:'Buiten de mijn.'};const index=at(col,row),cell=s.cells[index];if(!cell)return {ok:false,reason:''};if(!s.seen[index])return {ok:false,reason:'Dit gesteente is nog niet blootgelegd.'};
 const distance=Math.hypot((col+.5)*C-s.x,(row+.5)*C-(s.y-PH/2));if(distance>5*C+1e-6)return {ok:false,reason:'Buiten bereik: maximaal vijf blokken.'};if(cell===7)return {ok:false,reason:'Massief mantelgesteente: niet delfbaar.'};
 const need=requiredTier(row,cell),rock=rocks[cell-1],hard=rock.hard*(1+Math.max(0,row-SURFACE)/(GOAL-SURFACE)*3.5);
 // Recommended power changes speed; it never locks a mineable rock.
 const power=1+(s.drill-1)*.5,seconds=hard*(1+Math.max(0,need-s.drill)*.18)/power;
 const progress=s.damage?.[index]||0;
 return {ok:true,distance,rock:cell-1,index,need,hard,seconds,progress,remaining:seconds*(1-progress)};
}
function mine(s,target,dt){
 if(!target){s.mining=null;return;}const check=canMine(s,target.x,target.y);
 if(!check.ok){s.mining=null;if(check.reason&&s.blocked<=0){s.blocked=1.4;emit(s,'blocked',check.reason);}return;}
 if(!s.mining||s.mining.index!==check.index)s.mining={index:check.index,x:target.x,y:target.y,progress:check.progress};
 s.mining.progress+=dt/check.seconds;
 s.damage[check.index]=s.mining.progress;
 if(s.mining.progress>=1){s.cells[check.index]=0;delete s.damage[check.index];reveal(s,[check.index]);emit(s,'break','',{x:(target.x+.5)*C,y:(target.y+.5)*C,color:rocks[check.rock].edge});s.mining=null;}
}
function moveX(s,dx){const nx=clamp(s.x+dx,R+C,(W-1)*C-R-.01),left=Math.floor((nx-R)/C),right=Math.floor((nx+R)/C),top=Math.floor((s.y-PH+.01)/C),bottom=Math.floor((s.y-.01)/C);let blocked=false;for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)if(solid(s,x,y))blocked=true;if(!blocked)s.x=nx;else{s.vx=0;}}
function moveY(s,dy){const old=s.y,ny=old+dy,left=Math.floor((s.x-R+.01)/C),right=Math.floor((s.x+R-.01)/C);s.grounded=false;if(dy>=0){for(let row=Math.floor((old-.01)/C);row<=Math.floor(ny/C);row++)for(let col=left;col<=right;col++)if((solid(s,col,row)||Caverns.tread(s,col,row))&&old<=row*C+2&&ny>=row*C){s.y=row*C;s.vy=0;s.grounded=true;s.jumpOrigin=null;return;}}else{for(let row=Math.floor((old-PH)/C);row>=Math.floor((ny-PH)/C);row--)for(let col=left;col<=right;col++)if(solid(s,col,row)){s.y=(row+1)*C+PH+.01;s.vy=0;return;}}s.y=ny;}
function updateLava(s,dt){
 const l=s.lava,base=exposedFloor(s)*C,depth=Math.max(0,(base/C-SURFACE)*5);l.clock+=dt;l.fillClock+=dt;
 if(l.phase==='quiet'&&l.clock>Math.max(24,43-depth*.021)&&depth>75){
  l.base=base;l.head=base;l.phase='warning';l.time=0;l.fill=[];l.warning=depth>650?7:depth>300?8:9;
  emit(s,'warning','Lavadruk stijgt in de hele mijn. Zoek een hogere gang of een blauwe koelnis.');
 }
 if(l.phase!=='quiet'){
  // Every wave starts at the deepest exposed air, across the full width.
  l.base=Math.max(l.base,base);l.time+=dt;
  if(l.phase==='warning'&&l.time>=l.warning){l.phase='rising';l.time=0;l.fillClock=1;emit(s,'surge','Lava stijgt overal tot hetzelfde peil. Het blauwe koelveld beschermt alleen jou.');}
  if(l.phase==='rising'){l.head=Math.max((SURFACE+1)*C,l.head-dt*(28+Math.min(22,depth*.022)));if(l.time>9+Math.min(3,depth/280)){l.phase='falling';l.time=0;emit(s,'recede','De lava zakt. Wacht tot je route weer vrij is.');}}
  if(l.phase==='falling'){l.head+=dt*65;if(l.head>=l.base)Object.assign(l,quietLava());}
 }
 // The basin never drains dry. A wave adds to this same, global lava surface.
 const active=l.phase==='rising'||l.phase==='falling';
 l.surface=Math.min(active?l.head:Infinity,s.abyss.permanentHead);
 const bottom=Math.max(active?l.base:0,GOAL*C);
 if(l.fillClock>.12||l.fillRevision!==s.revision||l.fillTop!==Math.floor(l.surface/C)||l.fillBottom!==bottom){
  l.fillClock=0;l.fillRevision=s.revision;l.fillTop=Math.floor(l.surface/C);l.fillBottom=bottom;l.fill=[];
  for(let y=Math.max(SURFACE,Math.floor(l.surface/C));y<Math.min(H-1,Math.ceil(bottom/C));y++)for(let x=1;x<W-1;x++){
   const id=at(x,y);if(s.seen[id]&&s.cells[id]===0)l.fill.push(id);
  }
 }
 // Cooling protects the octopus, never blocks or hides the lava behind it.
 for(const yy of [s.y-2,s.y-PH/2,s.y-PH+3])for(const xx of [s.x-R+3,s.x+R-3]){
  const col=Math.floor(xx/C),row=Math.floor(yy/C),id=at(col,row);
  if(yy>=l.surface&&yy<bottom&&s.seen[id]&&s.cells[id]===0&&!Caverns.protectedCell(s,col,row)){die(s,'De lava heeft je geraakt.');return;}
 }
}
function enterPortal(s,p){if(s.trial||s.transition||s.respawn||p.used||s.drill!==p.tier-1)return false;s.trial=Trials.initial(p.id);s.trial.entryKey=p.key;s.transition=1.05;s.mining=null;s.jumpBuffer=0;s.vx=0;s.vy=0;emit(s,'portal',Trials.themes[p.id].name+'. '+Trials.themes[p.id].tip);return true;}
function completeTrial(s){const id=s.trial.id,p=s.portals.find(p=>p.key===s.trial.entryKey)||s.portals.find(p=>p.id===id);if(!s.trial.won||!p||p.used||s.drill!==p.tier-1)return false;s.portals.filter(q=>q.id===id).forEach(q=>q.used=true);s.drill=p.tier;s.trial=null;s.transition=1.05;s.portalCooldown=2;s.x=p.x;s.y=p.y+24;s.vx=0;s.vy=0;s.grounded=true;s.invulnerable=3;s.lava=quietLava();emit(s,'upgrade',drillNames[s.drill]+' verdiend. Je mijnhoed delft sneller · bereik vijf blokken.');return true;}
function step(s,dt,input={}){
 s.events=[];if(s.ended)return;dt=clamp(dt,0,1/120);s.time+=dt;s.blocked=Math.max(0,s.blocked-dt);s.portalCooldown=Math.max(0,s.portalCooldown-dt);
 if(s.respawn>0){s.respawn=Math.max(0,s.respawn-dt);if(s.respawn===0)returnToSurface(s);return;}
 if(s.transition>0){s.transition=Math.max(0,s.transition-dt);return;}
 s.invulnerable=Math.max(0,s.invulnerable-dt);
 if(s.trial){
  Trials.step(s.trial,dt,input);for(const e of s.trial.events)emit(s,e,e==='locked'?'Activeer eerst alle lichtschakelaars.':e==='relay'?'Schakelaar actief.':'');
  if(s.trial.dead){s.invulnerable=0;die(s,s.trial.reason);return;}if(s.trial.won)completeTrial(s);return;
 }
 s.jumpBuffer=Math.max(0,s.jumpBuffer-dt);s.coyote=s.grounded?.10:Math.max(0,s.coyote-dt);mine(s,input.target,dt);
 if(!Abyss.climb(s,dt,input)){
 if(s.jumpBuffer>0&&s.coyote>0){s.vy=-JUMP;s.jumpOrigin=s.y;s.jumpBuffer=0;s.coyote=0;s.grounded=false;emit(s,'jump');}
 const dir=clamp(input.dir||0,-1,1);s.vx+=(dir*195-s.vx)*Math.min(1,dt*(s.grounded?22:10));moveX(s,s.vx*dt);
 const dy=s.vy*dt+G*dt*dt*.5;s.vy=Math.min(620,s.vy+G*dt);moveY(s,dy);if(s.jumpOrigin!==null&&s.y<s.jumpOrigin-2*C){s.y=s.jumpOrigin-2*C;s.vy=Math.max(0,s.vy);}
 }
 s.deepest=Math.max(s.deepest,Math.min(GOAL_DEPTH,Math.max(0,(s.y/C-SURFACE)*5)));s.phase=typeAt(Math.floor(s.y/C));
 const current=at(Math.floor(s.x/C),Math.floor((s.y-PH/2)/C));if(!s.cells[current]&&s.revealedAt!==current)reveal(s,[current]);
 for(const p of s.portals)if(!s.portalCooldown&&!p.used&&s.drill===p.tier-1&&Math.hypot(s.x-p.x,s.y-PH/2-p.y)<38){enterPortal(s,p);return;}
 Caverns.update(s,dt,die,emit);if(s.respawn||s.ended)return;
 Abyss.update(s,dt,die,emit);if(s.respawn)return;updateLava(s,dt);
 if(s.respawn||s.ended)return;
 if(!s.carryingProbe&&s.drill===9&&s.grounded&&Math.hypot(s.x-s.goal.x,s.y-PH/2-s.goal.y)<50){
  s.carryingProbe=true;s.abyss.exited=false;emit(s,'probe','Mantelsonde opgehaald. Terug over de plateaus, omhoog via de ladder en dan naar het veldstation!');
 }
 if(s.carryingProbe&&s.abyss.exited&&s.grounded&&Math.abs(s.x-80.5*C)<56&&s.y<=SURFACE*C+.01){
  s.ended=true;s.won=true;s.vx=0;s.vy=0;s.lava=quietLava();emit(s,'win','Het Mantelbassin bedwongen, acht laserproeven voltooid en de sonde veilig teruggebracht. Expeditie geslaagd!');
 }
}
function objective(s){
 if(s.trial){const n=s.trial.relays.filter(q=>q.on).length,total=s.trial.relays.length;return {...s.trial.goal,label:Trials.themes[s.trial.id].name,text:n<total?'Activeer de lichtschakelaars · '+n+' / '+total:'Alle schakelaars aan. Bereik de uitgang.'};}
 const final=Abyss.objective(s);if(final)return final;
 if(s.carryingProbe)return {x:80.5*C,y:SURFACE*C,label:'Terug naar het veldstation',text:'Breng de sonde terug via je eigen delfroute'};
 if(s.drill<9){const p=s.portals.filter(p=>!p.used&&p.tier===s.drill+1).sort((a,b)=>Math.hypot(a.x-s.x,a.y-s.y)-Math.hypot(b.x-s.x,b.y-s.y))[0];const distance=Math.ceil(Math.hypot(p.x-s.x,p.y-s.y)/C);return {...p,label:'Portaal '+(p.id+1)+' / 8',text:'Proef '+(p.id+1)+' / 8 · '+distance+' blokken · '+drillNames[p.tier]};}
 return {...s.goal,label:'Mantelsonde',text:'Haal de mantelsonde uit het Mantelbassin.'};
}
function pack(s){return JSON.stringify({...s,cells:Array.from(s.cells),seen:Array.from(s.seen),events:[],mining:null});}
function restore(text){try{
 const old=JSON.parse(text),legacy=[8,9].includes(old?.version),migrate=old?.version<VERSION,rows=old?.version===8?184:old?.version<=13?216:H;
 if(![8,9,10,11,12,13,14,VERSION].includes(old?.version)||old.ended||!Array.isArray(old.cells)||old.cells.length!==W*rows||!Array.isArray(old.seen)||old.seen.length!==W*rows||!old.cells.every(n=>Number.isInteger(n)&&n>=0&&n<=rocks.length)||!old.seen.every(n=>n===0||n===1)||!Number.isFinite(old.x)||!Number.isFinite(old.y)||old.x<C||old.x>(W-1)*C||old.y<0||old.y>=rows*C||!Number.isInteger(old.drill)||old.drill<1||old.drill>(legacy?5:9))return null;
 if(!legacy&&((old.version<13&&(!Number.isInteger(old.lives)||old.lives<1||old.lives>3))||!Array.isArray(old.portals)||![8,24].includes(old.portals.length)||!old.lava||!Array.isArray(old.lava.fill)||!Number.isFinite(old.respawn)||!Number.isFinite(old.transition)))return null;
 if(old.trial&&(!Number.isInteger(old.trial.id)||old.trial.id<0||old.trial.id>7||!Number.isFinite(old.trial.x)||!Number.isFinite(old.trial.y)||!Array.isArray(old.trial.platforms)||!Array.isArray(old.trial.relays)||!Array.isArray(old.trial.hazards)||!Array.isArray(old.trial.rocks)))return null;
 let s=old;
 if(migrate){
  // New regions and basin need a fresh geological layout. Earned lasers stay earned.
  s=initial(old.seed);s.drill=legacy?Math.max([0,1,2,4,5,7][old.drill],requiredTier(Math.floor(old.y/C))):old.drill;
  s.deaths=old.version<13?(Number.isInteger(old.lives)?3-old.lives:0):old.deaths;
  s.time=Number(old.time)||0;s.deepest=Math.min(GOAL_DEPTH,Number(old.deepest)||0);
  s.portals.forEach(p=>p.used=p.tier<=s.drill);
  if(!legacy&&old.trial){s.trial=old.trial;s.trial.entryKey=s.portals.find(p=>p.id===s.trial.id).key;s.transition=1.05;}
  s.upgradeNote='De mijn van 1300 meter heeft nu losse, gesloten grotten. Je lasers en behaalde proeven blijven bewaard. Delf je eigen route vanaf het veldstation.';
 }
 const a=s.abyss;
 if(!a||!Array.isArray(a.platforms)||!a.platforms.length||!Array.isArray(a.vents)||!Array.isArray(a.pendulums)||!Array.isArray(a.entries)||!a.ladder||![a.ladder.x,a.ladder.top,a.ladder.bottom,a.permanentHead].every(Number.isFinite)||typeof a.exited!=='boolean')return null;
 s.version=VERSION;
 if(!Number.isSafeInteger(s.deaths)||s.deaths<0||typeof s.carryingProbe!=='boolean')return null;
 delete s.lives;
 if(!s.lava||!['quiet','warning','rising','falling'].includes(s.lava.phase)||!Number.isFinite(s.lava.head)||!Number.isFinite(s.lava.base)||!Number.isFinite(s.lava.clock)||!Number.isFinite(s.lava.time))s.lava=quietLava();
 s.lava.fill=[];s.lava.fillClock=1;s.lava.fillRevision=-1;
 Caverns.prepareReturn(s);
 const damage={};if(s.damage&&typeof s.damage==='object'&&!Array.isArray(s.damage))for(const [key,value] of Object.entries(s.damage)){const i=Number(key);if(Number.isInteger(i)&&i>=0&&i<W*H&&s.cells[i]&&s.cells[i]!==7&&s.seen[i]&&Number.isFinite(value)&&value>0&&value<1)damage[i]=value;}
 s.cells=Uint8Array.from(s.cells);s.seen=Uint8Array.from(s.seen);s.damage=damage;s.mining=null;s.events=[];
 if(!Array.isArray(s.refuges)||!Array.isArray(s.hazards))return null;
 return s;
 }catch{return null;}}

return {Caverns,Abyss,C,W,H,SURFACE,GOAL,GOAL_DEPTH,G,JUMP,R,PH,VERSION,rocks,drillNames,drillColors,biomes,regions,regionAt,Trials,initial,step,jump,canMine,solid,reveal,objective,pack,restore,at,typeAt,requiredTier,die,enterPortal,completeTrial,exposedFloor,updateLava};
})();
if(typeof module!=='undefined')module.exports=DrillModel;
