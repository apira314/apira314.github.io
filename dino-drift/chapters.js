'use strict';
/* Each chapter has an authored rhythm, readable hazards and an independent objective. */
(function(root){
const chapters=[
['Het fossielenspoor','Volg de bogen van fossielen. Groene richels geven je rustig de tijd.','trail'],
['De afkoelende lavabrug','De groene uiteinden blijven. Oranje delen breken na de afteller.','remnants'],
['De ademende vulkaan','Klim in de vulkaan. Warme lucht draagt je hoger; lava volgt van onderen.','updraft'],
['De drie obsidiaansluizen','Raak elke blauwe druksteen aan: de bijbehorende sluis opent.','gates'],
['De aswindpassage','Windvaantjes wijzen de vlaag. Wacht op luwte en spring naar het volgende terras.','gust'],
['De kraterontluchting','Klim tussen de vuurstralen; ontlucht bovenaan de magmakern.','firetower'],
['De weegschaalbreuk','Platen zakken onder je gewicht. Spring door voordat je te laag staat.','weight'],
['De breuklift','Blauwe liften stijgen en dalen. Stap over wanneer de hoogte klopt.','lifts'],
['Het tektonische slot','Volg de drukstenen 1–2–3. Elk anker opent de volgende doorgang.','ordered'],
['De schuilgroeve','Let op de inslagringen. Onder de overhang ben je veilig voor steenregen.','shelter'],
['De hangende richel','Spring via de groene reststukken. Gele bogen vormen een hogere bonusroute.','arch'],
['De naschoktoren','Spring wanneer de vloer oplicht. Herstel bovenaan de breukankers.','quake'],
['Het geiserpracticum','De drukring loopt vol: een volle bron lanceert je omhoog.','pressure'],
['De stoomschacht','Klim langs de bronnen. Doorzichtige stoom waarschuwt voor de hete straal.','steamshaft'],
['Het ammonietenarchief','Vind drie grote ammonieten op de verhoogde zijpaden.','excavate'],
['De getijdensluis','Laag water geeft ruimte. Klim op de drijvende pontons wanneer het water stijgt.','flood'],
['De drukestafette','Elke bron geeft een andere spronghoogte. Volg de hoge fossielenbogen.','relay'],
['De zingende kathedraal','Beweeg onder druipstenen door; lichtflitsen verraden wat gaat vallen.','stalactite'],
['De remmende morene','Ruw, gestreept gesteente remt. Gladde blauwe banen laten je doorschuiven.','traction'],
['De dooiende ijsbrug','IJs scheurt, groene stukken blijven. De smeltwaterstroom duwt mee.','thaw'],
['De Magnetische Kristalmijn','Spring bij paarse kristallen. De pijlen wisselen vloer en plafond.','magnet'],
['Het lawinevenster','Ontwijk de steenregen en ijsfronten. Rust onder overhangen.','avalanche'],
['Het poollichtarchipel','IJsschotsen deinen. Zijwind en kristallen vragen nauwkeurige landingen.','aurora'],
['De laatste aardlaag','Klim door vier aardlagen; boven wacht de poollichtkern.','finale']
];
const top=(p,t)=>p.gone&&Number.isFinite(p.restY)?p.restY:p.y+(p.moving?Math.sin(t*1.2+p.phase)*p.amp:0);
const routes={
0:[[300,40,0],[250,48,-16],[360,45,8],[250,55,-25]],
1:[[235,55,-12],[290,65,10],[205,58,-8],[330,70,-25]],
3:[[300,64,-8],[250,70,-28],[320,65,0],[240,76,-15]],
4:[[280,70,-20],[220,78,10],[350,74,-15],[235,80,-35]],
6:[[260,65,-10],[290,70,8],[245,76,-22],[310,72,0]],
8:[[295,78,-20],[235,82,8],[315,76,-30],[250,85,0]],
9:[[340,82,0],[250,86,-25],[300,78,12],[265,89,-12]],
10:[[230,78,-18],[195,88,8],[290,85,-25],[220,92,-5]],
12:[[290,75,0],[250,83,-30],[340,85,8],[230,90,-18]],
14:[[320,82,-12],[245,88,-35],[290,90,8],[260,94,-20]],
15:[[300,80,5],[270,88,-25],[330,84,12],[260,90,-12]],
16:[[270,86,-10],[290,95,-32],[240,92,5],[340,98,-18]],
18:[[420,88,-15],[360,94,10],[400,96,-20],[450,92,-5]],
19:[[390,98,-20],[330,100,5],[440,96,-10],[370,103,-28]],
21:[[440,102,0],[370,108,-25],[410,105,10],[460,110,-12]]};
function layout(s){const route=routes[s.level.id];if(!route)return;s.coins=s.coins.filter(q=>s.platforms.some(p=>q.x>=p.x&&q.x<=p.x+p.w&&Math.abs(q.y-p.y)<110));const links=[...s.coins,...s.powerups,...s.seals].map(q=>({q,p:s.platforms.find(p=>q.x>=p.x&&q.x<=p.x+p.w&&Math.abs(q.y-p.y)<110),x:q.x,y:q.y}));let right=420;for(const p of s.platforms){if(!p.id)continue;const [w,gap,dy]=route[(p.id-1)%route.length],oldX=p.x,oldY=p.y,oldW=p.w;p.x=p.baseX=right+gap;p.y=p.baseY=420+dy;p.w=w;right=p.x+w;
for(const link of links)if(link.p===p){link.q.x=p.x+(link.x-oldX)/oldW*w;link.q.y=link.y+p.y-oldY;}
for(const q of s.hazards)if(q.platform===p.id){q.x=p.x+(q.x-oldX)/oldW*w;q.y=p.y;}
for(const q of s.enemies)if(q.platform===p.id){q.x=q.base=p.x+w*.5;q.y=p.y;q.range=Math.max(18,w*.22);}
for(const q of s.glaciers)if(q.platform===p.id){q.x=q.origin=p.x+w*.68;q.y=p.y;}
if(p.remnants){const rw=Math.min(120,(w-60)/2);p.remnants=[{offset:10,w:rw},{offset:w-10-rw,w:rw}];}
}/* Optional high routes are rebuilt against the new supports. */
s.ledges=s.platforms.filter(p=>p.spring).map(p=>({x:p.x+50,y:p.y-200,w:170,seed:p.id}));s.goalX=s.end=right-55;s.goalY=s.platforms.at(-1).y;s.worldWidth=right+15;
}
function init(s){layout(s);const id=s.level.id;s.chapter={kind:chapters[id][2],shock:0,cycle:-1,flood:580,gust:0,combo:0,lastCoin:-10};s.canopies=[];s.gates=[];s.drafts=[];
const addVent=(p,kind,period,height)=>{s.vents=s.vents.filter(v=>v.platform!==p.id);s.vents.push({platform:p.id,offset:p.w*.68,phase:p.id*.71,period,height,kind});};
const highRoute=(p,rise=88)=>{const q={x:p.x+p.w*.22,y:p.y-rise,w:Math.min(160,p.w*.6),seed:p.id};s.ledges.push(q);for(let j=0;j<3;j++)s.coins.push({x:q.x+20+j*35,y:q.y-38,got:false});return q;};
for(const p of s.platforms){
 if(id===0){s.hazards=s.hazards.filter(h=>h.platform!==p.id||p.id>5);if(p.id===3||p.id===6)highRoute(p,75);}
 if(id===1&&!p.safe){p.breakDelay=4.1;p.brittle=true;}
 if(id===2&&p.id%5===2)s.drafts.push({x:p.x+15,y:p.y,w:p.w-30,h:180,phase:p.id});
 if(id===4&&!p.safe){p.windbreak=p.id%3===0;p.traction=true;}
 if(id===5&&!p.safe&&p.id%4===2)addVent(p,'lava',5.6,78);
 if(id===6&&!p.safe){p.weighted=true;p.sink=0;p.moving=false;p.remnants=null;}
 if(id===7&&!p.safe){p.moving=true;p.amp=20;p.phase=p.id*.9;p.lift=true;}
 if([9,21].includes(id)&&p.id>0&&p.id%3===1){s.canopies.push({x:p.x+20,y:p.y-112,w:Math.min(170,p.w-40)});s.hazards=s.hazards.filter(h=>h.platform!==p.id);s.enemies=s.enemies.filter(e=>e.platform!==p.id);}
 if(id===10&&!p.safe&&p.id%3===1)highRoute(p,85);
 if(id===11&&!p.safe&&p.id%4===2)p.quake=true;
 if(id===12){p.spring=!p.safe&&p.id%3===1;p.geyserPhase=p.id*.5;}
 if(id===13&&!p.safe&&p.id%4===1)addVent(p,'steam',6,90);
 if(id===15&&!p.safe){p.moving=true;p.amp=28;p.phase=p.id*.5;p.pontoon=true;s.vents=s.vents.filter(v=>v.platform!==p.id);}
 if(id===16&&!p.safe&&p.id%2===0){p.spring=true;p.boost=760+(p.id%3)*90;p.geyserPhase=p.id*.8;highRoute(p,150);s.vents=s.vents.filter(v=>v.platform!==p.id);}
 if(id===18&&p.id%2===0)p.traction=true;
 if(id===19&&!p.safe){p.current=p.id%2?35:-25;p.breakDelay=3.8;}
 if(id===22&&!p.safe){p.moving=true;p.amp=18;p.phase=p.id*.6;}
 if(id===23&&!p.safe){const band=Math.floor(p.id/s.platforms.length*4);p.band=band;if(band===0&&p.id%3===1)addVent(p,'lava',5.4,85);if(band===1&&p.id%3===1)p.quake=true;if(band===2&&p.id%3===1){p.spring=true;p.boost=790;}if(band===3&&p.id%3===1)p.traction=true;}
}
if([3,8].includes(id)){s.seals.forEach((q,i)=>{q.order=id===8?i:null;const p=s.platforms[q.platform];q.offset=p.w*.25;q.x=p.x+q.offset;s.gates.push({x:p.x+p.w*.8,y:p.y,platform:p.id,seal:i,open:false});});s.hazards=s.hazards.filter(h=>!s.seals.some(q=>q.platform===h.platform));}
if(id===14)s.seals.forEach(q=>{const p=s.platforms[q.platform],ledge=highRoute(p,95);q.x=ledge.x+ledge.w*.5;q.offset=q.x-p.x;q.y=ledge.y-28;q.offsetY=-123;q.raised=true;});
if(id===17)s.platforms.filter(p=>!p.safe&&p.id%3===2).forEach(p=>s.canopies.push({x:p.x+30,y:p.y-150,w:30,stalactite:true,platform:p.id,clock:p.id*.43}));
if(id===18)s.glaciers=s.glaciers.slice(0,2);
}
function before(s,dt){if(s.trial||!s.chapter)return;const a=s.chapter,id=s.level.id;
if([4,22].includes(id)){const wave=Math.sin(s.time*(id===4?.65:.88));a.gust=Math.abs(wave)<.4?0:wave*(id===4?100:60);s.wind=a.gust;if(s.platforms[s.standing]?.windbreak)s.wind*=.15;}
if(id===15)a.flood=500-Math.sin(s.time*.48)*38;
for(const p of s.platforms){if(p.weighted){p.sink=Math.max(0,Math.min(44,(p.sink||0)+(s.grounded&&s.standing===p.id?22:-17)*dt));p.y=p.baseY+p.sink;}}
for(const q of s.drafts){const on=(s.time+q.phase)%5<3.4;if(on&&s.x>q.x&&s.x<q.x+q.w&&s.y<q.y+5&&s.y>q.y-q.h&&!s.grounded)s.vy-=690*dt;}
}
function after(s,dt,hurt){if(s.trial||!s.chapter||s.ended)return;const a=s.chapter,id=s.level.id;
for(const g of s.gates){g.open=!!s.seals[g.seal]?.got;const p=s.platforms[g.platform];g.y=top(p,s.time);if(!g.open&&s.x>g.x-19&&s.x<g.x+25&&s.y>g.y-165&&s.y<g.y+10){s.x=g.x-19;s.vx=Math.min(0,s.vx);}}
const p=s.platforms[s.standing];if(s.grounded&&p?.current&&!p.gone&&!p.remnants?.some(r=>s.x>=p.x+r.offset&&s.x<=p.x+r.offset+r.w))s.x+=p.current*dt;
if(id===15&&s.y-15>a.flood)hurt(s);
for(const p of s.platforms){if(!p.quake||p.gone)continue;const period=id===23?4.6:5.7,phase=(s.time+p.id*.6)%period;p.shockPhase=phase>period-.32?'active':phase>period-1.5?'warning':'off';if(p.shockPhase==='active'&&s.grounded&&s.standing===p.id)hurt(s);}
if(id===17){for(const q of s.canopies){if(!q.stalactite)continue;q.clock+=dt;const phase=q.clock%5.5;if(phase>4.3&&!q.fired&&Math.abs(q.x-s.x)<550){q.fired=true;s.falls.push({x:q.x+15,y:q.y,vy:0,age:0,warning:.9,r:15,hit:false});}if(phase<1)q.fired=false;}}
}
function draw(c,s,reduced){if(s.trial||!s.chapter)return;const t=reduced?0:s.time,cam=s.camera;const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x-cam,y,w,h);};c.save();
for(const p of s.platforms){if(p.gone)continue;const x=p.x-cam,y=top(p,s.time);if(x>1100||x+p.w<0||y-s.cameraY>650||y-s.cameraY< -150)continue;
 if(p.band!==undefined){rect(p.x,y,p.w,5,['#ffb375','#e8d398','#9ce9d6','#b7d9ff'][p.band]);}
 if(p.traction){c.strokeStyle='#d8d9b8';c.lineWidth=3;for(let j=12;j<p.w;j+=22){c.beginPath();c.moveTo(x+j,y+4);c.lineTo(x+j-7,y+10);c.stroke();}}
 if(p.weighted){c.strokeStyle='#ffe1ad';c.lineWidth=2;c.beginPath();c.moveTo(x+p.w*.5,y+8);c.lineTo(x+p.w*.5,y+50);c.moveTo(x+20,y+43);c.lineTo(x+p.w-20,y+43);c.stroke();rect(p.x+12,y+15,(p.w-24)*(1-(p.sink||0)/44),4,'#ffcf93');}
 if(p.lift){c.strokeStyle='#a8efff55';c.setLineDash([3,6]);c.beginPath();c.moveTo(x+p.w*.5,p.baseY-25);c.lineTo(x+p.w*.5,p.baseY+55);c.stroke();c.setLineDash([]);}
 if(p.current){c.fillStyle='#bcf2ff';c.font='20px system-ui';c.textAlign='center';for(let j=30;j<p.w;j+=60)c.fillText(p.current>0?'›':'‹',x+j,y+22);}
 if(p.quake&&p.shockPhase!=='off'){rect(p.x,y-4,p.w,8,p.shockPhase==='active'?'#ff866a':'#ffe7aa');c.strokeStyle='#ffe7aa';c.lineWidth=2;c.beginPath();for(let j=0;j<p.w;j+=12)c.lineTo(x+j,y-16+Math.sin(j*.1+t*12)*6);c.stroke();}
 if(p.spring){const pressure=((s.time+p.geyserPhase)%6)/6;c.strokeStyle='#9cfff2';c.lineWidth=3;c.beginPath();c.arc(x+p.w*.5,y-50,13,-Math.PI/2,-Math.PI/2+pressure*6.28);c.stroke();}
 if(p.windbreak){rect(p.x+15,y-70,10,70,'#526770');rect(p.x+12,y-73,16,7,'#e2c996');}
}
for(const q of s.canopies){const x=q.x-cam;if(q.stalactite){c.fillStyle=q.clock%5.5>3.5?'#fff1bd':'#77988e';c.beginPath();c.moveTo(x,q.y-28);c.lineTo(x+30,q.y-28);c.lineTo(x+15,q.y+15);c.closePath();c.fill();}else{rect(q.x,q.y,q.w,18,'#52676b');rect(q.x,q.y,q.w,4,'#acd6c7');c.strokeStyle='#acd6c744';c.setLineDash([4,7]);c.strokeRect(x,q.y+20,q.w,90);c.setLineDash([]);}}
for(const g of s.gates){if(g.open)continue;const x=g.x-cam;c.strokeStyle='#80dbeb';c.lineWidth=6;c.beginPath();c.moveTo(x,g.y);c.lineTo(x,g.y-165);c.stroke();c.fillStyle='#a9f2ff';c.textAlign='center';c.font='bold 18px system-ui';c.fillText(g.seal+1,x,g.y-178);}
for(const q of s.drafts){const on=(s.time+q.phase)%5<3.4;c.strokeStyle=on?'#ffd6a760':'#ffd6a725';c.lineWidth=2;for(let j=0;j<6;j++){const x=q.x-cam+j*q.w/6,y=q.y-((t*60+j*27)%q.h);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+12,y-20,x,y-42);c.stroke();}}
if(s.level.id===15){const y=s.chapter.flood;c.fillStyle='#3da8cc44';c.beginPath();c.moveTo(0,700);for(let x=0;x<=1000;x+=12)c.lineTo(x,y+Math.sin(x*.03+t*2)*4);c.lineTo(1000,700);c.fill();c.strokeStyle='#a7eaff';c.lineWidth=2;c.beginPath();for(let x=0;x<=1000;x+=12)c.lineTo(x,y+Math.sin(x*.03+t*2)*4);c.stroke();}
c.restore();}
const api={chapters,init,before,after,draw};root.PaleoChapters=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
