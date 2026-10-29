'use strict';
// World coordinates point upward. All physics runs in fixed 1/120-second steps.
(function(root){
const Abyss=root.JumpAbyss||(typeof require!=='undefined'?require('./abyss.js'):null);
const W=640,H=800,G=1200,JUMP=665,R=15,HEIGHT_UNIT=50;
const zones=[
 {name:'Aardmantel',from:0,to:50,short:'Mantel',color:'#ff965e',top:'#170f24',bottom:'#722a28',fact:'De mantel bestaat grotendeels uit vast gesteente dat op lange tijdschalen kan vervormen.'},
 {name:'Lithosfeer',from:50,to:150,short:'Lithosfeer',color:'#a4dfbb',top:'#102535',bottom:'#31504b',fact:'De lithosfeer omvat de aardkorst én het stijve bovenste deel van de mantel.'},
 {name:'Troposfeer & stratosfeer',from:150,to:300,short:'Atmosfeer',color:'#93dfff',top:'#123e78',bottom:'#69b7d3',fact:'Het meeste weer speelt zich af in de troposfeer. Daarboven ligt de stratosfeer met de ozonlaag.'},
 {name:'Magnetosfeer',from:300,to:500,short:'Magnetosfeer',color:'#9bfacb',top:'#080e31',bottom:'#153954',fact:'Het aardmagnetisch veld beïnvloedt geladen deeltjes. Poollicht ontstaat door botsingen met deeltjes in de bovenste atmosfeer.'},
 {name:'Exosfeer & kosmos',from:500,to:1000,short:'Kosmos',color:'#cfb7ff',top:'#060a1c',bottom:'#251b4a',fact:'De exosfeer gaat geleidelijk over in de ruimte. Zwaartekracht verdwijnt daar niet: ook satellieten blijven onder haar invloed.'},
 {name:'Singulariteit',from:1000,to:Infinity,short:'Onbekend',color:'#a8ffef',top:'#070914',bottom:'#251b44',fact:'Buiten de kaart. De meetapparatuur vraagt om een tweede mening. Dit gebied is spelfantasie.'}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),wrap=x=>((x%W)+W)%W,delta=(a,b)=>((a-b+W*1.5)%W)-W/2;
function rng(seed){let n=seed>>>0;return()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function zone(height){let i=0;while(i<zones.length-1&&height>=zones[i+1].from)i++;return i;}
function initial(seed=Date.now()){
 const s={seed,random:rng(seed),time:0,x:320,y:2,vx:0,vy:JUMP,maxY:0,camera:0,platforms:[],nextId:1,top:0,anchorX:320,row:0,events:[],ended:false,height:0,score:0,samples:0,bounces:0,plumes:0,eruptions:0,boost:0,zone:0,chain:0,singular:false,entry:0,objects:[],lastObjectRow:0};
 s.platforms.push({id:0,x:320,baseX:320,y:0,w:150,type:'granite',power:null,sample:false,broken:false,amp:0,phase:0,speed:0,anchor:true});generate(s);return s;
}
function generate(s,viewHeight=H){if(s.fall||s.abyss)return;while(s.top<s.camera+Math.max(H,viewHeight)+250){
 const h=s.top/HEIGHT_UNIT,d=1-Math.exp(-h/180),extra=1-Math.exp(-Math.max(0,h-300)/500);s.row++;
 const gap=82+s.random()*22+d*38+extra*18;
 s.top+=gap;const step=(s.random()-.5)*(h>=1000?70:185+d*75);s.anchorX=clamp(s.anchorX+step,55,W-55);
 const roll=s.random(),type=s.row<4?'granite':roll<.24+d*.13?'basalt':roll<.43+d*.43?'transform':'granite';
 const p={id:s.nextId++,baseX:s.anchorX,x:s.anchorX,y:s.top,w:110-d*39-extra*18-s.random()*7,type,broken:false,amp:type==='transform'?16+d*14+extra*5:0,phase:s.random()*Math.PI*2,speed:.75+d*.95+extra*.4,power:s.row%17===0?'eruption':s.row%9===0?'plume':null,sample:s.row%3===0,anchor:true};
 if(h>=1000){p.w=Math.max(28,44-(h-1000)/80);p.type=s.row%5===0?'basalt':'transform';p.amp=28+Math.min(12,(h-1000)/40);p.speed=2.4+Math.min(2,(h-1000)/250);p.power=s.row%23===0?'plume':null;p.phase=s.row*.71;if(s.row%3===0)s.objects.push({x:80+s.random()*480,y:p.y+65,r:15+s.random()*7,phase:s.random()*6,speed:1.2+s.random(),kind:s.row%4});}
 s.platforms.push(p);
 // A second, optional ledge offers a specimen, without removing the safe climbing route.
 if(s.row%4===0){const x=wrap(s.anchorX+220);s.platforms.push({id:s.nextId++,baseX:x,x,y:s.top-30,w:60,type:'basalt',broken:false,amp:0,phase:0,speed:0,power:null,sample:true,anchor:false});}
 }}
function tick(s,dt,input){if(s.ended)return;dt=clamp(dt,0,1/60);if(Abyss.tick(s,dt,input))return;if(s.entry>0){s.entry=Math.max(0,s.entry-dt);return;}s.time+=dt;
 for(const p of s.platforms)if(p.type==='transform')p.x=p.baseX+Math.sin(s.time*p.speed+p.phase)*p.amp+Math.sin(s.time*p.speed*.43+p.phase)*p.amp*.24;
 const target=clamp(input,-1,1)*330,acc=2400*dt;s.vx+=clamp(target-s.vx,-acc,acc);const oldY=s.y;s.x=wrap(s.x+s.vx*dt);
 if(s.boost>0){s.boost=Math.max(0,s.boost-dt);s.vy=Math.max(s.vy,870);}else s.vy-=G*dt;
 s.y+=s.vy*dt;
 if(s.vy<0){let hit=null;for(const p of s.platforms){if(p.broken||oldY<p.y||s.y>p.y)continue;if(Math.abs(delta(s.x,p.x))<=p.w/2+R*.7&&(!hit||p.y>hit.y))hit=p;}
  if(hit){if(hit.type==='singularity')for(const ledge of s.platforms)if(ledge.type==='basalt')ledge.broken=false;s.y=hit.y;s.vy=JUMP;hit.landTime=s.time;s.bounces++;s.chain++;s.events.push({type:'land',x:s.x,y:s.y,rock:hit.type});
   if(hit.sample){hit.sample=false;s.samples++;s.events.push({type:'sample',x:hit.x,y:hit.y+30});}
   if(hit.type==='basalt'){hit.broken=true;s.events.push({type:'break',x:hit.x,y:hit.y,w:hit.w});}
   if(hit.power){const kind=hit.power;hit.power=null;if(kind==='eruption'){s.boost=.85;s.vy=1020;s.eruptions++;}else{s.vy=910;s.plumes++;}s.events.push({type:kind,x:s.x,y:s.y});}
  }
 }
 if(!s.singular&&s.y>=1000*HEIGHT_UNIT){s.singular=true;s.entry=2.8;s.y=Math.max(s.y,1000*HEIGHT_UNIT+8);s.vy=JUMP;s.platforms.push({id:-1000,x:320,baseX:320,y:1000*HEIGHT_UNIT,w:W,type:'singularity',power:null,sample:false,broken:false,anchor:true});s.events.push({type:'singularity',x:s.x,y:s.y});}
 if(s.singular){for(const o of s.objects){const x=wrap(o.x+Math.sin(s.time*o.speed+o.phase)*70);if(Math.abs(delta(s.x,x))<o.r+10&&Math.abs(s.y-20-o.y)<o.r+20&&(!s.hitUntil||s.time>s.hitUntil)){s.vy=-210;s.vx=delta(s.x,x)>0?260:-260;s.hitUntil=s.time+1.2;s.events.push({type:'unknown',x:s.x,y:s.y});}}}
 if(s.singular&&s.y>=1111*HEIGHT_UNIT){s.maxY=Math.max(s.maxY,s.y);s.height=1111;s.score=1111+s.samples*5;Abyss.begin(s);return;}s.maxY=Math.max(s.maxY,s.y);s.height=Math.floor(s.maxY/HEIGHT_UNIT);s.camera=s.singular?Math.max(1000*HEIGHT_UNIT-330,s.y-330):Math.max(s.camera,s.maxY-330);s.score=s.height+s.samples*5;
 const z=zone(s.height);if(z!==s.zone){for(let i=s.zone+1;i<=z;i++)s.events.push({type:'zone',zone:i});s.zone=z;}
 generate(s);s.platforms=s.platforms.filter(p=>p.id===-1000||p.y>(s.singular?1000*HEIGHT_UNIT-1:s.camera-160));
 if(!s.singular&&s.y<s.camera-95){s.ended=true;s.events.push({type:'over'});}
}
const api={W,H,G,JUMP,R,HEIGHT_UNIT,zones,initial,tick,zone,wrap,delta,generate};root.EarthJump=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
