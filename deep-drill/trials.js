'use strict';
// Eight authored routes. Only movement and jumping are available inside a portal.
const DrillTrials=(()=>{
 const G=1100,JUMP=Math.sqrt(2*G*96),R=13,PH=34;
 const themes=[
  {name:'De Wortelbrug',short:'Wortelbrug',color:'#b9e9a2',dark:'#123b35',sky:'#081e27',kind:'roots',tip:'Spring over de spleten. Raak beide lichtschakelaars en bereik de uitgang.',relays:2},
  {name:'Het Fossielenrif',short:'Fossielenrif',color:'#f2d49d',dark:'#51404b',sky:'#171b32',kind:'bones',tip:'De lichte ribben blijven staan. Gebarsten wervels bezwijken na je landing.',relays:2},
  {name:'De Prismagalerij',short:'Prismagalerij',color:'#c3b1ff',dark:'#35295d',sky:'#101b36',kind:'crystal',tip:'Wacht tot een laser dooft. Activeer de drie prisma’s onderweg.',relays:3},
  {name:'De Geiserschacht',short:'Geiserschacht',color:'#91e6e8',dark:'#174853',sky:'#0b2335',kind:'steam',tip:'Klim via de liften. Witte damp kondigt een hete straal aan.',relays:3},
  {name:'De Breukmachine',short:'Breukmachine',color:'#e6b994',dark:'#573441',sky:'#191c30',kind:'fault',tip:'De platen schuiven. Let op de lichtcirkels: daar valt straks gesteente.',relays:3},
  {name:'De Gletsjerkluis',short:'Gletsjerkluis',color:'#a5e4ff',dark:'#284e70',sky:'#101b38',kind:'ice',tip:'Rem vóór de rand van het ijs. IJspieken vallen na hun waarschuwing.',relays:3},
  {name:'De Magnetische Toren',short:'Magnetische Toren',color:'#cfa4ff',dark:'#3c2457',sky:'#12142e',kind:'magnet',tip:'Reis met de zwevende platen omhoog. Passeer de energievelden als ze uit zijn.',relays:4},
  {name:'De Mantelproef',short:'Mantelproef',color:'#ffc281',dark:'#692d3c',sky:'#23172c',kind:'mantle',tip:'Open de drie koelsluizen. Ontwijk pulsen, breukplaten en vallend gesteente.',relays:3}
 ];
 const routes=[
  [[46,-42,160],[58,42,145],[54,-54,145],[66,0,160],[50,54,155],[70,-42,155],[54,42,180],[60,-48,160],[54,48,160]],
  [[58,-48,135],[72,-42,140,'fragile'],[64,40,120],[70,42,125,'fragile'],[78,-50,138],[64,-36,125,'fragile'],[72,42,135],[74,40,125,'fragile'],[60,-46,145],[68,-36,130,'fragile'],[68,36,145],[75,0,150]],
  [[60,-45,135],[75,0,125,'moving'],[64,40,140],[75,-50,125],[65,0,125,'moving'],[75,45,145],[68,-45,130],[75,0,130],[66,45,125,'moving'],[76,-50,145],[74,0,135],[70,40,155]],
  [],
  [[68,-40,145,'moving'],[84,35,130],[74,-45,125,'fragile'],[88,40,120,'moving'],[72,-50,130],[86,42,130,'fragile'],[82,-35,130,'moving'],[76,40,140],[84,-45,125,'fragile'],[78,35,135,'moving'],[82,-42,130],[86,42,135],[70,-40,140,'moving']],
  [[65,0,170,'ice'],[85,-45,150,'ice'],[88,45,145,'moving'],[82,0,160,'ice'],[86,-48,145,'ice'],[90,40,150,'ice'],[85,-40,150,'moving'],[86,40,145,'ice'],[82,-45,145,'ice'],[88,40,155,'ice'],[84,-45,145,'moving'],[85,45,165,'ice'],[78,0,155,'ice']],
  [],
  [[78,-48,130],[90,40,120,'moving'],[86,-45,120,'fragile'],[90,40,125],[92,-45,125,'moving'],[85,40,120,'fragile'],[90,-45,125],[84,35,125],[90,-50,120,'moving'],[92,42,120,'fragile'],[86,-40,125],[90,35,130],[86,-45,125,'moving'],[90,40,130],[84,-40,135,'fragile']]
 ];
 function initial(id){
  id=Math.max(0,Math.min(7,id));const vertical=id===3||id===6;
  const t={id,time:0,x:100,y:vertical?1120:470,vx:0,vy:0,grounded:true,support:0,coyote:0,jumpBuffer:0,jumpOrigin:null,dead:false,won:false,reason:'',events:[],platforms:[],relays:[],hazards:[],rocks:[],rockClock:0,locked:0,width:0,height:vertical?1260:700};
  function platform(x,y,w,kind='stone',i=0){t.platforms.push({x,y,baseX:x,baseY:y,w,h:20,kind,amp:kind==='moving'?(vertical?20:16):0,speed:.65+id*.035,offset:i*1.7,crack:0,broken:false,dx:0,dy:0});}
  platform(30,t.y,245,'stone');
  if(vertical){
   const xs=id===3?[235,385,530,380,230,85,235,385,530,380,230,85,235,385,530]:[235,385,530,680,530,380,230,80,230,380,530,680,530,380,230,80,230,380];
   xs.forEach((x,i)=>platform(x,1120-(i+1)*(id===3?57:52),145,i%3===1?'moving':'stone',i));
   t.width=id===3?920:1060;
  }else{
   let end=275,y=470;routes[id].forEach(([gap,dy,w,kind],i)=>{y+=dy;const x=end+gap;platform(x,y,w,kind||(id===1?'bone':id===2?'crystal':'stone'),i);end=x+w;});t.width=end+450;
  }
  const last=t.platforms[t.platforms.length-1];platform(last.baseX+last.w+(vertical?15:70),last.baseY,245,'finish');t.width=Math.max(t.width,last.baseX+last.w+400);
  const finish=t.platforms[t.platforms.length-1];t.goal={x:finish.x+155,y:finish.y-30};
  const count=themes[id].relays;
  for(let j=1;j<=count;j++){const k=Math.max(2,Math.floor(j*(t.platforms.length-3)/(count+1)));t.relays.push({platform:k,on:false});}
  if(id>=2)for(let j=3;j<t.platforms.length-2;j+=id===7?3:4){const p=t.platforms[j];if(p.kind==='fragile')continue;t.hazards.push({platform:j,x:p.w*.58,kind:id===3?'vent':'beam',offset:j*.37,period:4.8-id*.11,warn:.9,active:id===7?1.15:.95});}
  return t;
 }
 function jump(t){if(!t.dead&&!t.won)t.jumpBuffer=.15;}
 function hazard(t,h){const p=t.platforms[h.platform],phase=(t.time+h.offset)%h.period,state=phase<h.warn?'warning':phase<h.warn+h.active?'active':'quiet';return {x:p.x+h.x,y:p.y,state,phase,width:h.kind==='vent'?26:12,height:h.kind==='vent'?116:100};}
 function kill(t,reason){t.dead=true;t.reason=reason;}
 function step(t,dt,input={}){
  t.events=[];if(t.dead||t.won)return;dt=Math.min(1/120,Math.max(0,dt));t.time+=dt;t.locked=Math.max(0,t.locked-dt);t.jumpBuffer=Math.max(0,t.jumpBuffer-dt);t.coyote=t.grounded?.10:Math.max(0,t.coyote-dt);
  for(const [i,p] of t.platforms.entries()){
   const oldX=p.x,oldY=p.y;p.x=p.baseX+Math.sin(t.time*p.speed+p.offset)*p.amp;
   p.y=p.baseY+(p.kind==='moving'&&[3,6].includes(t.id)?Math.sin(t.time*.8+p.offset)*12:0);p.dx=p.x-oldX;p.dy=p.y-oldY;
   if(p.crack>0){p.crack+=dt;if(p.crack>(t.id<4?1.25:1.05)){p.broken=true;if(t.support===i)t.grounded=false;}}
  }
  const support=t.platforms[t.support];if(t.grounded&&support&&!support.broken){t.x+=support.dx;t.y+=support.dy;}
  if(t.jumpBuffer>0&&t.coyote>0){t.vy=-JUMP;t.jumpOrigin=t.y;t.jumpBuffer=0;t.coyote=0;t.grounded=false;t.events.push('jump');}
  const dir=Math.max(-1,Math.min(1,input.dir||0)),ice=t.grounded&&support?.kind==='ice';
  t.vx+=(dir*215-t.vx)*Math.min(1,dt*(ice?7:t.grounded?22:12));t.x=Math.max(14,Math.min(t.width-14,t.x+t.vx*dt));
  const oldY=t.y,ny=t.y+t.vy*dt+G*dt*dt*.5;t.vy=Math.min(720,t.vy+G*dt);t.grounded=false;t.y=ny;
  if(t.vy>=0){let land=null;for(const [i,p] of t.platforms.entries())if(!p.broken&&t.x+R>p.x&&t.x-R<p.x+p.w&&oldY<=p.y+Math.abs(p.dy)+2&&ny>=p.y&&(!land||p.y<land.p.y))land={p,i};
   if(land){t.y=land.p.y;t.vy=0;t.grounded=true;t.support=land.i;t.jumpOrigin=null;if(land.p.kind==='fragile'&&!land.p.crack){land.p.crack=.001;t.events.push('crack');}}
  }
  if(t.jumpOrigin!==null&&t.y<t.jumpOrigin-96){t.y=t.jumpOrigin-96;t.vy=Math.max(0,t.vy);}
  if(t.y>t.height+60){kill(t,'Je viel uit het portaalparcours.');return;}
  for(const h of t.hazards){const q=hazard(t,h);if(q.state==='active'&&Math.abs(t.x-q.x)<R+q.width/2&&t.y>q.y-q.height&&t.y-PH<q.y){kill(t,h.kind==='vent'?'De hete geiser raakte je.':'Je raakte een actieve kristallaser.');return;}}
  if(t.id>=4){
   t.rockClock+=dt;if(t.rockClock>Math.max(2.3,4.9-t.id*.3)){
    t.rockClock=0;const n=t.id===7?2:1;
    for(let j=0;j<n;j++){const x=Math.max(60,Math.min(t.width-60,t.x+120+(Math.sin(t.time*2.7+j)*200)+j*190));t.rocks.push({x,y:t.y-320,top:t.y-320,warn:1.3,vy:0,r:t.id===5?11:15});}
   }
   for(const r of t.rocks){if(r.warn>0){r.warn-=dt;continue;}r.vy+=650*dt;r.y+=r.vy*dt;if(Math.abs(r.x-t.x)<R+r.r*.72&&r.y+r.r>t.y-PH&&r.y-r.r<t.y){kill(t,t.id===5?'Een vallende ijspiek raakte je.':'Vallend gesteente raakte je.');return;}}
   t.rocks=t.rocks.filter(r=>r.y<t.height+80);
  }
  for(const q of t.relays){const p=t.platforms[q.platform];if(!q.on&&Math.hypot(t.x-(p.x+p.w*.32),t.y-PH/2-(p.y-26))<38){q.on=true;t.events.push('relay');}}
  if(Math.hypot(t.x-t.goal.x,t.y-PH/2-t.goal.y)<48){if(t.relays.every(q=>q.on)){t.won=true;t.events.push('complete');}else if(t.locked===0){t.locked=2;t.events.push('locked');}}
 }
 return{themes,routes,initial,jump,step,hazard,G,JUMP,R,PH};
})();
if(typeof module!=='undefined')module.exports=DrillTrials;
