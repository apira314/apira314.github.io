'use strict';
(()=>{
 const $=id=>document.getElementById(id),cv=$('game'),c=cv.getContext('2d'),M=DrillModel,kit=new GameKit('drill',()=>{}),SAVE='pira.drill.mine.v8',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,art=DrillArt.create(c,M,reduced);
 let s=M.initial(),mode='ready',resume=null,last=performance.now(),acc=0,clock=0,held=new Set(),touch=new Map(),pointer=null,aim=null,camera={x:0,y:0},toast='',toastLeft=0,particles=[],saveClock=0,lastLaserSound=-1,victoryTime=0,victoryChime=false,ladderHint=false;
 try{resume=M.restore(localStorage.getItem(SAVE));}catch{}
 function save(){try{if(s.ended)localStorage.removeItem(SAVE);else if(mode!=='ready')localStorage.setItem(SAVE,M.pack(s));}catch{}}
 function panel(title,message,button){$('overlay').hidden=false;$('heading').textContent=title;$('message').textContent=message;$('action').textContent=button;$('pause').disabled=true;}
 function clearInput(){held.clear();touch.clear();pointer=null;aim=null;s.mining=null;}
 function start(fresh=false){
  s=!fresh&&mode==='ready'&&resume?resume:M.initial();resume=null;mode='playing';victoryTime=0;victoryChime=false;clearInput();particles=[];art.reset();acc=0;last=performance.now();$('overlay').hidden=true;$('pause').disabled=false;kit.unlock();kit.activity=true;kit.tone('level');cv.focus({preventScroll:true});
  toast=s.upgradeNote||(s.trial?M.Trials.themes[s.trial.id].tip:s.drill===1?'Houd een steen vast om te delven. Volg de richtingaanwijzer naar proef 1. Graaf ook een terugweg: je springt twee blokken hoog.':M.objective(s).text);toastLeft=s.upgradeNote?9:5;delete s.upgradeNote;save();
 }
 function pause(){if(mode!=='playing')return;mode='paused';clearInput();save();panel(s.trial?'Portaalproef gepauzeerd':'Mijnwerk gepauzeerd',M.objective(s).text+' Onbeperkte pogingen; na een fout begin je weer bij het veldstation.','Verder');}
 function resumePlay(){mode='playing';clearInput();last=performance.now();acc=0;$('overlay').hidden=true;$('pause').disabled=false;cv.focus({preventScroll:true});}
 function finish(){mode='over';clearInput();save();panel(s.won?'Expeditie geslaagd':'Expeditie afgelopen',s.last,'Nieuwe expeditie');kit.tone(s.won?'bonus':'over');}
 $('action').onclick=()=>mode==='paused'?resumePlay():start();$('pause').onclick=pause;
 for(const ev of ['pira-first','pira-restart'])addEventListener(ev,()=>start(true));for(const ev of ['blur','arcadepause'])addEventListener(ev,pause);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});addEventListener('pagehide',save);
 if(resume){$('action').textContent=resume.trial?'Verder met portaalproef':'Verder graven';$('message').textContent='Poging '+(resume.deaths+1)+' · '+M.objective(resume).text;}
 addEventListener('keydown',e=>{
  if(window.PiraMenuOpen||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.toLowerCase();
  if(['arrowleft','arrowright','a','d',' ','arrowup','w','arrowdown','s'].includes(k)){e.preventDefault();if(mode==='playing'){held.add(k);if([' ','arrowup','w'].includes(k)&&!e.repeat)M.jump(s);}}
  if(['p','escape'].includes(k)&&!e.repeat){e.preventDefault();mode==='playing'?pause():mode==='paused'&&resumePlay();}
 });
 addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));
 for(const [id,dir] of [['left',-1],['right',1],['jump',0]]){
  const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(mode!=='playing')return;kit.unlock();touch.set(e.pointerId,dir);if(!dir)M.jump(s);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>touch.delete(e.pointerId));
 }
 cv.addEventListener('pointerdown',e=>{if(mode!=='playing'||window.PiraMenuOpen||e.button>0||pointer||s.trial||s.respawn||s.transition)return;e.preventDefault();cv.setPointerCapture(e.pointerId);const target=point(e.clientX,e.clientY);pointer={id:e.pointerId,x:e.clientX,y:e.clientY,target};aim=target;kit.unlock();});
 cv.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId){if(Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>=4){pointer.x=e.clientX;pointer.y=e.clientY;pointer.target=point(e.clientX,e.clientY);aim=pointer.target;}}else if(!pointer&&e.pointerType==='mouse'&&!s.trial)aim=point(e.clientX,e.clientY);});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])cv.addEventListener(ev,e=>{if(pointer?.id===e.pointerId){pointer=null;s.mining=null;}});cv.addEventListener('contextmenu',e=>e.preventDefault());
 function point(x,y){const b=cv.getBoundingClientRect();return {x:Math.floor((camera.x+(x-b.left)*cv.width/b.width)/M.C),y:Math.floor((camera.y+(y-b.top)*cv.height/b.height)/M.C)};}
 function resize(){clearInput();const portrait=innerWidth<768&&innerHeight>innerWidth;cv.width=portrait?640:1050;cv.height=portrait?850:650;document.querySelector('main')?.style.setProperty('--game-ratio',String(cv.width/cv.height));}
 for(const ev of ['resize','pira-view-change'])addEventListener(ev,resize);resize();
 function laserSound(){
  if(kit.muted||!kit.audio||!kit.fxGain||kit.audio.state!=='running')return;
  const now=kit.audio.currentTime;if(now-lastLaserSound<.14)return;lastLaserSound=now;
  try{const f=330+s.drill*24;kit.voice(f,.19,'sine',.055,kit.fxGain,0,f*1.025);kit.voice(f*2,.12,'triangle',.016,kit.fxGain,0,f*1.9);}catch{}
 }
 function portalSound(){
  if(kit.muted||!kit.audio||!kit.fxGain)return;
  try{kit.voice(170,.75,'sine',.19,kit.fxGain,0,780);kit.voice(480,.85,'triangle',.10,kit.fxGain,.06,95);kit.voice(950,.35,'sine',.10,kit.fxGain,.16,240);}catch{}
 }
 function events(){
  for(const e of s.events){
   if(e.text){toast=e.text;toastLeft=e.type==='portal'?6:4;}$('live-status').textContent=e.text||'';
   if(e.type==='break'){kit.tone('granite');for(let i=0;i<(reduced?4:13);i++)particles.push({x:e.x,y:e.y,vx:Math.cos(i*2.4)*70,vy:Math.sin(i*2.4)*70,life:.7,color:e.color||'#d9bc8d'});}
   if(e.type==='disarm')kit.tone('cool');if(e.type==='jump')kit.tone('move');if(e.type==='relay')kit.tone('quartz');if(e.type==='crack')kit.tone('impact');if(e.type==='locked')kit.tone('warning');
   if(e.type==='portal'||e.type==='upgrade'){clearInput();art.reset();particles=[];portalSound();if(e.type==='upgrade')kit.tone('upgrade');save();}
   if(e.type==='death'){clearInput();art.reset();particles=[];kit.tone('over');save();}
   if(e.type==='basin'){portalSound();toastLeft=8;save();}
   if(e.type==='probe'){clearInput();portalSound();kit.tone('bonus');toastLeft=7;save();}
   if(e.type==='respawn'){clearInput();art.reset();kit.tone('level');save();}
   if(e.type==='cave-warning')kit.tone('warning');if(e.type==='warning'||e.type==='surge')kit.tone('warning');if(e.type==='recede')kit.tone('cool');if(e.type==='win'){mode='celebrating';victoryTime=0;victoryChime=false;clearInput();save();$('pause').disabled=true;kit.tone('bonus');}if(e.type==='lose')finish();
  }s.events=[];
 }
 function draw(dt=0,playing=false){if(pointer&&!s.trial)aim=pointer.target;camera=art.draw(s,cv.width,cv.height,clock,{aim,dt,playing,toast,toastLeft,particles,victoryTime:mode==='celebrating'?victoryTime:undefined});}
 function frame(now){
  const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=reduced?0:dt;const playing=mode==='playing'&&!window.PiraMenuOpen&&!document.hidden;
  if(playing){
   let dir=(held.has('d')||held.has('arrowright')?1:0)-(held.has('a')||held.has('arrowleft')?1:0);for(const d of touch.values())dir+=d;
   const climb=(held.has('w')||held.has('arrowup')||held.has(' ')||[...touch.values()].includes(0)?1:0)-(held.has('s')||held.has('arrowdown')?1:0);
   acc+=dt;while(acc>=1/120&&mode==='playing'){const target=pointer&&!s.trial?pointer.target:null;M.step(s,1/120,{dir,target,climb});events();acc-=1/120;}
   if(s.mining)laserSound();saveClock+=dt;if(saveClock>3){save();saveClock=0;}
  }else acc=0;
  if(mode==='celebrating'&&!window.PiraMenuOpen&&!document.hidden){victoryTime+=dt;if(victoryTime>2.8&&!victoryChime){victoryChime=true;kit.tone('upgrade');}if(victoryTime>(reduced?2:6))finish();}
  kit.activityTick(dt,playing||mode==='celebrating',s.deepest/M.GOAL_DEPTH);for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;}particles=particles.filter(p=>p.life>0);toastLeft=Math.max(0,toastLeft-dt);
  const onLadder=M.Abyss.nearLadder(s);if(onLadder!==ladderHint){ladderHint=onLadder;$('jump').classList.toggle('climbing',onLadder);$('jump').setAttribute('aria-label',onLadder?'Houd vast om de ladder te beklimmen':'Spring maximaal twee blokken hoog');}
  if(!document.hidden)draw(dt,playing);requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
})();
