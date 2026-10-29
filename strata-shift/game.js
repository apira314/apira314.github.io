'use strict';
(()=>{
 const $=id=>document.getElementById(id),cv=$('game'),c=cv.getContext('2d'),M=StrataModel,kit=new GameKit('strata'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const museumKey='pira.strata.museum.v1',colours={sand:'#d8b777',clay:'#92b5bb',basalt:'#52616e',marble:'#caa4f2',fossil:'#f2d699'};
 let state=M.initial(),mode='ready',selected=32,selectedId=null,selectionActive=false,hammerArmed=false,last=0,clock=0,collapse=0,particles=[],rings=[],positions=new Map(),gesture=null,lastTap=null,history=[],museum={},paintedMuseum='';
 try{const data=JSON.parse(localStorage.getItem(museumKey)||'{}');for(let i=0;i<M.fossilNames.length;i++)museum[i]=Number.isSafeInteger(data?.[i])&&data[i]>0?data[i]:0;}catch(e){kit.available=false;}
 function announce(text){$('announcement').textContent=text;}
 function save(){kit.score=state.score;kit.save();try{localStorage.setItem(museumKey,JSON.stringify(museum));}catch(e){kit.available=false;kit.refresh();}}
 function update(){
  syncSelection();$('compress-action').disabled=mode!=='playing'||!selectionActive||M.partner(state,selected)<0||hammerArmed;
  kit.score=state.score;kit.refresh();$('fossils').textContent=state.fossils;const p=Math.round(M.pressure(state)*100);$('pressure-value').textContent=state.freeze>0?'❄ '+Math.ceil(state.freeze)+'s':p+'%';$('pressure').value=p;$('pressure').parentElement.dataset.danger=p>=80;
  $('multiplier').textContent='×'+state.multiplier;$('multiplier-time').textContent=state.boostTime>0?Math.ceil(state.boostTime)+' seconden bonus':'Pers zandsteen voor een bonus.';
  $('water-count').textContent=state.water;$('hammer-count').textContent=state.hammers;$('water-power').disabled=mode!=='playing'||state.water===0;$('hammer-power').disabled=mode!=='playing'||state.hammers===0;$('hammer-power').setAttribute('aria-pressed',String(hammerArmed));
  $('power-note').textContent=hammerArmed?'Tik op de steen die je wilt breken.':state.freeze>0?'Water koelt de schacht. De bodem staat stil.':'Elke vier matches krijg je nieuwe hulpmiddelen.';
  const key=JSON.stringify(museum)+':'+state.fossils;if(key!==paintedMuseum){paintedMuseum=key;$('museum').replaceChildren();M.fossilNames.forEach((name,i)=>{const li=document.createElement('li'),b=document.createElement('b');li.textContent=name+' ';b.textContent=museum[i]||'—';li.append(b);if(museum[i])li.classList.add('found');$('museum').append(li);});$('round-collection').textContent=state.fossils?state.fossils+' fossielen veilig aan de bodem.':'Nog geen fossielen deze ronde.';}
 }
 function panel(heading,message,button){$('heading').textContent=heading;$('message').textContent=message;$('action').textContent=button;document.querySelector('.start-guide').hidden=true;$('overlay').hidden=false;$('pause').disabled=true;hammerArmed=false;kit.activity=false;kit.applyAudio();update();}
 function start(){state=M.initial();positions.clear();particles=[];rings=[];history=[];selected=32;selectedId=state.grid[selected]?.id??null;selectionActive=false;gesture=null;lastTap=null;hammerArmed=false;collapse=0;mode='playing';kit.reset();kit.activity=true;kit.unlock();$('overlay').hidden=true;$('result').hidden=true;$('pause').disabled=false;$('combo-history').replaceChildren();announce('Maak ruimte met horizontale matches. De eerste rij komt over 4,5 seconden. Tik een steen en daarna een buurvak.');last=performance.now();update();cv.focus({preventScroll:true});}
 function pause(){if(mode!=='playing')return;mode='paused';gesture=null;lastTap=null;panel('Even geen druk.','Je schacht, score en hulpmiddelen wachten op je.','Verder spelen');}
 function resume(){if(mode!=='paused')return;mode='playing';last=performance.now();$('overlay').hidden=true;$('pause').disabled=false;kit.activity=true;kit.unlock();update();cv.focus({preventScroll:true});}
 $('action').onclick=()=>mode==='paused'?resume():start();$('pause').onclick=pause;
 for(const event of ['pira-restart','pira-first'])addEventListener(event,start);
 addEventListener('arcadepause',pause);addEventListener('blur',pause);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 function burst(i,colour,n=14){const x=(i%5)*100+50,y=Math.floor(i/5)*100+50-M.riseProgress(state)*100;rings.push({x,y,age:0,colour});if(reduced)return;for(let j=0;j<n;j++){const a=Math.random()*Math.PI*2,v=40+Math.random()*180;particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,age:0,life:.35+Math.random()*.5,colour,size:3+Math.random()*6});}if(particles.length>220)particles.splice(0,particles.length-220);}
 function log(text){history.unshift(text);history=history.slice(0,4);$('combo-history').replaceChildren();for(const text of history){const li=document.createElement('li');li.textContent=text;$('combo-history').append(li);}}
 function events(){let notice='',changed=false;for(const e of state.events){
  if(e.type==='break'){burst(e.i,colours[e.kind],8);changed=true;}
  if(e.type==='match'){log(e.marble?'Magmapuls · basalt breekt':(e.chain>1?'Ketting ×'+e.chain+' · ':'')+e.count+' stenen');kit.tone(e.chain>1?'bonus':'gem');notice=e.marble?'Marmermatch. Aangrenzend basalt is gebroken.':e.chain>1?'Ketting van '+e.chain+' combinaties.':'Match! Er is weer ruimte.';}
  if(e.type==='compress'){burst(e.i,e.kind==='marble'?'#e8bbff':'#b8e4dd',22);kit.tone('upgrade');notice=e.kind==='marble'?'Marmer gevormd. Multiplier ×'+state.multiplier+'.':'Kleilagen gebroken.';log(e.kind==='marble'?'Marmer · ×'+state.multiplier:'Klei samengeperst');changed=true;}
  if(e.type==='fossil'){museum[e.fossil]=(museum[e.fossil]||0)+1;burst(e.i,'#ffdf9a',26);kit.tone('bonus');log(M.fossilNames[e.fossil]+' gevonden');notice=M.fossilNames[e.fossil]+' in je museum. +'+500*state.multiplier+' punten.';changed=true;}
  if(e.type==='slide')kit.tone('click');if(e.type==='hammer'){kit.tone('impact');notice='Steen gebroken.';}
  if(e.type==='water'){kit.tone('water');notice='De bodem staat acht seconden stil.';}
  if(e.type==='supply')notice='Voorraad aangevuld: water en hamer.';
  if(e.type==='over'){mode='collapse';collapse=0;$('pause').disabled=true;kit.tone('over');kit.activity=false;kit.applyAudio();state.grid.forEach((b,i)=>{if(b)burst(i,colours[b.type],4);});save();notice='De schacht is ingestort.';}
 }
 state.events=[];if(notice)announce(notice);if(changed)save();update();}
 function act(fn){if(mode!=='playing'||window.PiraMenuOpen)return;kit.unlock();if(fn()){events();return true;}kit.tone('click');announce(hammerArmed?'Kies een gesteente om te breken.':'Deze zet kan niet. Basalt zit vast; samenpersen vraagt twee gelijke lagen.');return false;}
 function indexOf(id){return id==null?-1:state.grid.findIndex(b=>b?.id===id);}
 function syncSelection(){if(selectedId==null)return;const i=indexOf(selectedId);if(i>=0)selected=i;else{selectedId=null;selectionActive=false;}}
 function select(i){selected=i;selectedId=state.grid[i]?.id??null;selectionActive=true;}
 function shift(i,dir){const id=state.grid[i]?.id;if(!act(()=>M.swap(state,i,dir)))return false;const at=indexOf(id);if(at>=0)select(at);else{selectedId=null;selectionActive=false;}lastTap=null;update();return true;}
 function press(i=selected,other){if(!act(()=>M.compress(state,i,other)))return false;lastTap=null;syncSelection();update();return true;}
 $('compress-action').onclick=()=>{syncSelection();press();cv.focus({preventScroll:true});};
 $('water-power').onclick=()=>{lastTap=null;act(()=>M.water(state));};
 $('hammer-power').onclick=()=>{if(mode!=='playing'||!state.hammers)return;hammerArmed=!hammerArmed;lastTap=null;kit.unlock();kit.tone('click');announce(hammerArmed?'Hamer geselecteerd. Tik op een steen.':'Hamer opgeborgen.');update();cv.focus({preventScroll:true});};
 function hit(x,y){const b=cv.getBoundingClientRect(),xx=(x-b.left)*500/b.width,yy=(y-b.top)*1000/b.height;if(xx<0||xx>=500||yy<0||yy>=1000)return -1;
 // Hit the stone where it is drawn, including during falling and sliding animations.
 for(let i=49;i>=0;i--){const rock=state.grid[i],pos=rock&&positions.get(rock.id);if(pos&&xx>=pos.x&&xx<pos.x+100&&yy>=pos.y&&yy<pos.y+100)return i;}
 const row=Math.floor((yy+M.riseProgress(state)*100)/100);return row<10?row*5+Math.floor(xx/100):-1;}
 function choose(i,previous){const id=state.grid[i]?.id,now=performance.now();select(i);
 if(hammerArmed){if(act(()=>M.hammer(state,i)))hammerArmed=false;lastTap=null;update();return;}
 const from=previous?.id!=null?indexOf(previous.id):-1;
 if(from>=0&&from!==i){if(Math.floor(from/5)===Math.floor(i/5)&&Math.abs(from-i)===1&&M.canSwap(state,from,i-from)){shift(from,i-from);return;}
 if(Math.abs(from-i)===5&&state.grid[from]?.type===state.grid[i]?.type&&M.partner(state,i)>=0){press(i,from);return;}}
 if(id!=null&&lastTap?.id===id&&now-lastTap.at<520&&M.partner(state,i)>=0){press(i);return;}
 lastTap=id!=null?{at:now,id}:null;announce(M.partner(state,i)>=0?'Deze lagen passen bij elkaar. Tik Pers of tik de gemarkeerde steen.':state.grid[i]?.type==='basalt'?'Basalt zit vast. De hamer kan het breken.':'Tik een buurvak of swipe om deze steen te verschuiven.');update();}
 function dragDirection(g,x,y){const dx=x-g.x,dy=y-g.y,threshold=Math.max(10,cv.getBoundingClientRect().width/5*.18);return Math.abs(dx)>=threshold&&Math.abs(dx)>=Math.abs(dy)*.7?(dx>0?1:-1):0;}
 cv.addEventListener('pointerdown',e=>{if(mode!=='playing'||window.PiraMenuOpen||gesture||e.button>0)return;e.preventDefault();const i=hit(e.clientX,e.clientY);if(i<0)return;kit.unlock();cv.focus({preventScroll:true});syncSelection();const previous=selectionActive?{id:selectedId}:null;
 gesture={id:e.pointerId,rockId:state.grid[i]?.id??null,i,x:e.clientX,y:e.clientY,dir:0,previous};select(i);cv.setPointerCapture(e.pointerId);update();});
 cv.addEventListener('pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;e.preventDefault();gesture.dir=hammerArmed?0:dragDirection(gesture,e.clientX,e.clientY);});
 cv.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;e.preventDefault();const g=gesture;gesture=null;if(mode!=='playing'||window.PiraMenuOpen)return;
 // Stable IDs keep a new rising row from changing the target halfway through a gesture.
 const i=g.rockId!=null?indexOf(g.rockId):hit(e.clientX,e.clientY);if(i<0){lastTap=null;return;}const dir=hammerArmed?0:dragDirection(g,e.clientX,e.clientY);
 if(dir){shift(i,dir);lastTap=null;}else if(Math.abs(e.clientX-g.x)<18&&Math.abs(e.clientY-g.y)<18)choose(i,g.previous);});
 for(const type of ['pointercancel','lostpointercapture'])cv.addEventListener(type,e=>{if(gesture?.id===e.pointerId){gesture=null;lastTap=null;}});
 addEventListener('keydown',e=>{if(window.PiraMenuOpen||e.ctrlKey||e.altKey||e.metaKey||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.toLowerCase();if(['p','escape'].includes(k)&&!e.repeat){if(mode==='playing')pause();else if(mode==='paused')resume();return;}if(mode!=='playing')return;
 if(['arrowleft','arrowright','arrowup','arrowdown',' ','1','2'].includes(k)){if(e.target.tagName==='BUTTON'&&k===' ')return;e.preventDefault();if(e.repeat)return;kit.unlock();gesture=null;lastTap=null;syncSelection();
 if(k==='1')$('water-power').click();else if(k==='2')$('hammer-power').click();else if(k==='arrowup')select(Math.max(0,selected-5));else if(k==='arrowdown')select(Math.min(49,selected+5));else if(k===' '){if(hammerArmed){if(act(()=>M.hammer(state,selected)))hammerArmed=false;}else press();}else shift(selected,k==='arrowleft'?-1:1);update();}});
 function rect(x,y,w,h,r=10){c.beginPath();c.roundRect(x,y,w,h,r);}
 function spiral(x,y,size,colour){c.strokeStyle=colour;c.lineWidth=4;c.beginPath();for(let i=0;i<80;i++){const a=i*.15,r=size*i/80;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.stroke();}
 function tile(b,x,y){c.save();c.translate(x,y);c.shadowColor=b.type==='marble'?'#bb8bff44':'#0008';c.shadowBlur=b.type==='marble'?16:5;c.shadowOffsetY=4;rect(5,5,90,90,10);const gradient=c.createLinearGradient(0,0,85,100);const palette={sand:['#e4c28b','#aa7f49'],clay:['#aec8cc','#597f8e'],basalt:['#465464','#172430'],marble:['#dfbdff','#795caa'],fossil:['#f7d69b','#a57645']}[b.type];gradient.addColorStop(0,palette[0]);gradient.addColorStop(1,palette[1]);c.fillStyle=gradient;c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle='#ffffff35';c.lineWidth=2;c.stroke();c.save();c.clip();
 if(b.type==='sand'){for(let n=0;n<26;n++){const px=(n*37+b.id*7)%87+7,py=(n*n*13+b.id*11)%85+8;c.fillStyle=n%2?'#fff3':'#59341044';c.fillRect(px,py,n%3+1,2);}c.strokeStyle='#8d65334d';for(let n=0;n<3;n++){c.beginPath();c.moveTo(7,25+n*23);c.quadraticCurveTo(60,17+n*23,94,31+n*23);c.stroke();}}
 if(b.type==='clay'){for(let n=0;n<9;n++){c.strokeStyle=n%2?'#d1e4e244':'#294d6866';c.lineWidth=n%3+1;c.beginPath();c.moveTo(6,12+n*10);c.bezierCurveTo(32,18+n*10,55,4+n*10,94,13+n*10);c.stroke();}}
 if(b.type==='basalt'){c.strokeStyle='#6b7a87';c.lineWidth=2;c.beginPath();c.moveTo(18,5);c.lineTo(29,24);c.lineTo(14,43);c.moveTo(93,59);c.lineTo(72,48);c.lineTo(66,72);c.lineTo(75,95);c.stroke();c.strokeStyle='#c1ccd1';c.lineWidth=3;rect(39,46,23,21,4);c.stroke();c.beginPath();c.arc(50.5,45,8,Math.PI,0);c.stroke();}
 if(b.type==='marble'){c.strokeStyle='#f4dcff9c';c.lineWidth=2;for(let n=0;n<3;n++){c.beginPath();c.moveTo(-10+n*43,0);c.bezierCurveTo(40+n*24,33,13+n*30,50,85+n*20,110);c.stroke();}c.fillStyle='#f7e4ff';c.beginPath();c.moveTo(50,31);c.lineTo(65,50);c.lineTo(50,69);c.lineTo(35,50);c.closePath();c.fill();}
 if(b.type==='fossil'){spiral(50,48,25,'#674721');c.fillStyle='#735326';c.font='bold 10px system-ui';c.textAlign='center';c.fillText('FOSSIEL',50,83);}
 c.restore();c.restore();}
 function draw(dt){c.clearRect(0,0,500,1000);const bg=c.createLinearGradient(0,0,0,1000);bg.addColorStop(0,'#071923');bg.addColorStop(.6,'#102c36');bg.addColorStop(1,'#354337');c.fillStyle=bg;c.fillRect(0,0,500,1000);const offset=M.riseProgress(state)*100;
 c.lineWidth=1;c.strokeStyle='#9bd0c514';for(let x=0;x<=500;x+=100){c.beginPath();c.moveTo(x,0);c.lineTo(x,1000);c.stroke();}for(let y=-offset;y<=1000;y+=100){c.beginPath();c.moveTo(0,y);c.lineTo(500,y);c.stroke();}
 c.fillStyle='#9fc6c470';c.font='12px system-ui';c.textAlign='center';c.fillText('S T R A T A  /  S H I F T',250,59);c.fillStyle='#8cafae5e';c.font='11px system-ui';c.fillText('5 KOLOMMEN · 10 LAGEN',250,83);
 const alive=new Set();state.grid.forEach((b,i)=>{if(!b)return;alive.add(b.id);const x=i%5*100,y=Math.floor(i/5)*100-offset;let pos=positions.get(b.id);if(!pos)pos={x,y};const rate=reduced?1:Math.min(1,dt*18);pos.x+=(x-pos.x)*rate;pos.y+=(y-pos.y)*rate;positions.set(b.id,pos);let sink=mode==='collapse'&&!reduced?collapse*collapse*180*(1+(i%5)*.08):0;tile(b,pos.x,pos.y+sink);});for(const id of positions.keys())if(!alive.has(id))positions.delete(id);
 // A rising, unplayable bedrock line previews the next row without revealing it.
 if(offset>0){c.fillStyle=state.freeze>0?'#608f9c':'#516557';c.fillRect(0,1000-offset,500,offset);c.strokeStyle=state.freeze>0?'#c6f2ff':'#b7d4a2';c.lineWidth=3;c.beginPath();c.moveTo(0,1000-offset);c.lineTo(500,1000-offset);c.stroke();for(let x=25;x<500;x+=50){c.strokeStyle='#ffffff28';c.beginPath();c.moveTo(x,1000);c.lineTo(x+40,1000-offset);c.stroke();}}
 if(mode==='playing'&&selectionActive){const x=selected%5*100,y=Math.floor(selected/5)*100-offset;c.strokeStyle=hammerArmed?'#ffdb8a':'#e5ffce';c.lineWidth=4;rect(x+3,y+3,94,94,11);c.stroke();
 if(hammerArmed){c.fillStyle='#ffdc9240';c.fill();}else{
 const pair=M.partner(state,selected);if(pair>=0){const py=Math.floor(pair/5)*100-offset;c.strokeStyle='#e5ffce99';c.lineWidth=3;c.setLineDash([7,5]);rect(x+7,py+7,86,86,9);c.stroke();c.setLineDash([]);c.fillStyle='#e5ffce';c.font='bold 22px system-ui';c.textAlign='center';c.fillText('⇵',x+50,(y+py)/2+58);}
 for(const dir of [-1,1])if(M.canSwap(state,selected,dir)){const px=x+50+dir*35,py=y+50;c.fillStyle='#0b263bd9';c.beginPath();c.arc(px,py,12,0,Math.PI*2);c.fill();c.strokeStyle='#efffe0';c.lineWidth=2;c.beginPath();c.moveTo(px-dir*3,py-5);c.lineTo(px+dir*3,py);c.lineTo(px-dir*3,py+5);c.stroke();}
 if(gesture?.dir&&M.canSwap(state,selected,gesture.dir)){const tx=x+gesture.dir*100;c.fillStyle='#dff8ba25';rect(tx+4,y+4,92,92,10);c.fill();c.strokeStyle='#dff8ba';c.lineWidth=3;c.stroke();}
 }}
 const pressure=M.pressure(state);if(pressure>=.8){c.globalAlpha=reduced?.35:.25+Math.sin(clock*5)*.12;c.fillStyle='#ff8064';c.fillRect(0,0,500,6);c.globalAlpha=1;}
 if(state.freeze>0){c.strokeStyle='#a9eaf688';c.lineWidth=6;c.strokeRect(3,3,494,994);}
 for(const p of particles){p.age+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=200*dt;c.globalAlpha=Math.max(0,1-p.age/p.life);c.fillStyle=p.colour;c.fillRect(p.x,p.y,p.size,p.size);}particles=particles.filter(p=>p.age<p.life);c.globalAlpha=1;
 for(const r of rings){r.age+=dt;c.globalAlpha=Math.max(0,1-r.age/.5)*.6;c.strokeStyle=r.colour;c.lineWidth=3;c.beginPath();c.arc(r.x,r.y,20+r.age*(reduced?30:120),0,Math.PI*2);c.stroke();}rings=rings.filter(r=>r.age<.5);c.globalAlpha=1;
 if(mode==='collapse'){c.fillStyle='rgba(5,13,19,'+Math.min(.75,collapse*.6)+')';c.fillRect(0,0,500,1000);}
 }
 let uiClock=0;
 function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;clock+=dt;if(mode==='playing'&&!window.PiraMenuOpen&&!document.hidden){M.step(state,dt);if(state.events.length)events();}if(mode==='collapse'){collapse+=dt;if(collapse>.95){mode='over';panel('De schacht is vol.','Een nieuwe ronde begint met verse lagen en een lege score. Je museum blijft staan.','Nog een ronde');$('result').hidden=false;$('result').textContent=state.score+' punten · '+state.fossils+' fossielen · record '+kit.best;}}
 kit.activityTick(dt,mode==='playing'&&!document.hidden,M.pressure(state));uiClock+=dt;if(uiClock>.12){update();uiClock=0;}draw(dt);requestAnimationFrame(frame);}
 update();requestAnimationFrame(frame);
})();
