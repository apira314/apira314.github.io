'use strict';
(function(root){
const titles={10:'Het ribbenravijn',16:'De omgekeerde tijdlaag',19:'De meteorietenbreuk'};
const hint='Stap in de tijdpoort. Bleke botten breken; turquoise ankers blijven.';
function init(s){if(!titles[s.level.id])return;const rank=[10,16,19].indexOf(s.level.id);
 Object.assign(s,{vertical:false,cameraY:0,gravity:1,platforms:[],coins:[],hazards:[],enemies:[],ledges:[],glaciers:[],powerups:[],seals:[],crystals:[],vents:[],sweepers:[],canopies:[],gates:[],drafts:[],required:0,completed:0,standing:0,checkpoint:0,checkpointX:90,checkpointY:465,x:90,y:465,chapter:null});
 s.rift={rank,entered:false,era:0,transition:null,rotation:0,turned:false,meteorClock:0,portals:[],walls:[],impacts:[],checkpointEra:0,checkpointEntered:false,stage:0,shockwaves:[],bounceLock:0};
 const add=(x,y,w,extra={})=>{const p={id:s.platforms.length,x,y,baseX:x,baseY:y,w,floating:true,safe:true,checkpoint:false,moving:false,amp:0,phase:0,heat:0,crack:0,gone:false,eroded:0,rift:true,...extra};s.platforms.push(p);return p;};
 add(0,465,420);const landing=add(500,420,240,{checkpoint:true,anchor:true});
 s.rift.portals.push({kind:'entry',x:270,y:405,toX:570,toY:420});
 let x=820;const bones=[];for(let i=0;i<[13,6,7][rank];i++){const y=420+[-20,-70,-20,15,-50,-90,-35,0,-45,-10,10][(i+rank)%11],w=132-rank*10+(i%3===0?22:0);const p=add(x,y,w,{bone:i%3===1?'rib':'spine',fracture:0,breakDelay:2.2-rank*.27,elastic:rank===0&&i%4===2});bones.push(p);x+=w+65+rank*7;}
 s.rift.skeleton={from:bones[0].x,to:x-70,y:465};
 let a=add(x+15,425,245,{checkpoint:true,anchor:true});s.rift.turnX=a.x+145;x=a.x+a.w+75;
 const turns=[[[0,415],[175,330],[20,245],[200,180],[380,255],[560,335],[740,415]],[[0,415],[175,330],[25,245],[205,175],[390,250],[570,330],[740,415],[920,330],[1100,415]],[[0,415],[170,330],[20,245],[200,175],[385,255],[565,335],[740,415],[920,330],[770,245],[960,325],[1140,415]]][rank],turnBase=x;
 for(const [dx,y] of turns)add(turnBase+dx,y,148-rank*9,{turn:true,riftInactive:true,turnFromY:y-210,turnAngle:-Math.PI/2});x=turnBase+turns.at(-1)[0]+148-rank*9+85;
 a=add(x,425,235,{checkpoint:true,anchor:true});s.rift.portals.push({kind:'era',era:1,x:a.x+140,y:a.y-62,anchor:a.id});x+=a.w+75;
 for(let segment=0;segment<2;segment++){
  const era=segment===0?1:0;for(let i=0;i<[3,8,4][rank];i++){const y=415+[-30,-70,-15,10,0,-40][(i+rank+segment)%6];add(x,y,155-rank*12,{era,riftInactive:era!==0,phaseBridge:rank===1&&i%3===1,phaseOffset:i*.9});if(i===1||i===3)s.rift.walls.push({x:x+35,y:y,era:1-era});x+=230-rank*4;}
  a=add(x,425,235,{checkpoint:true,anchor:true});if(segment===0)s.rift.portals.push({kind:'era',era:0,x:a.x+140,y:a.y-62,anchor:a.id});else s.rift.meteorStart=a.x+a.w;
  x+=a.w+75;
 }
 for(let i=0;i<[6,7,17][rank];i++){const y=425+[-15,-55,-25,0][(i+rank)%4];add(x,y,125-rank*10,{meteor:true,anchor:i%4===3,checkpoint:i%4===3});x+=198+rank*3;}
 const last=s.platforms.at(-1);const goal=add(last.x+last.w+125,400,270,{anchor:true});s.goalX=goal.x+185;s.goalY=goal.y;s.end=s.goalX;s.worldWidth=goal.x+goal.w+80;
 for(const p of s.platforms){if(p.turn)p.y=p.turnFromY;if(p.id<2)continue;for(let j=0;j<(p.anchor?2:3);j++)s.coins.push({x:p.x+25+j*(p.w-50)/2,y:p.y-45,platform:p.id,offset:25+j*(p.w-50)/2,offsetY:-45,got:false});}
}
function begin(s,kind,q){const r=s.rift;r.transition={kind,q,time:0,duration:kind==='turn'?1.45:1.15};s.vx=s.vy=0;s.buffer=0;s.events.push({type:'timeportal',kind,x:s.x,y:s.y-45});}
function gate(s,dt){const r=s.rift;if(!r?.transition)return false;const tr=r.transition;tr.time+=dt;s.time+=dt;s.vx=s.vy=0;s.buffer=0;
 if(tr.kind==='turn'){r.rotation=Math.min(1,tr.time/tr.duration);for(const p of s.platforms)if(p.turn){p.turnAngle=-Math.PI/2*(1-r.rotation);p.y=p.turnFromY+210*r.rotation;}}
 if(tr.time>=tr.duration){if(tr.kind==='entry'){r.entered=true;s.x=tr.q.toX;s.y=tr.q.toY;s.checkpoint=1;s.checkpointX=570;s.checkpointY=420;r.checkpointEntered=true;r.checkpointEra=0;s.standing=1;}
  if(tr.kind==='era'){r.era=tr.q.era;tr.q.used=true;}
  if(tr.kind==='turn'){r.turned=true;r.rotation=1;for(const p of s.platforms)if(p.turn){p.y=p.baseY;p.riftInactive=false;}}
  s.grounded=true;s.immune=Math.max(s.immune,.7);r.transition=null;s.events.push({type:'riftready',x:s.x,y:s.y-40});sync(s);
 }
 s.camera=Math.min(Math.max(0,s.worldWidth-1000),Math.max(0,s.x-280));return true;
}
function sync(s){const r=s.rift;for(const p of s.platforms){if(p.era!==undefined)p.riftInactive=p.era!==r.era;if(p.turn)p.riftInactive=!r.turned;}}
function before(s,dt){const r=s.rift;if(!r)return;sync(s);r.bounceLock=Math.max(0,r.bounceLock-dt);r.shockwaves=r.shockwaves.filter(q=>(q.age+=dt)<1.3);r.impacts=r.impacts.filter(q=>(q.life-=dt)>0);
 for(const p of s.platforms){if(p.phaseBridge&&p.era===r.era){const phase=(s.time+p.phaseOffset)%5;p.phaseWarning=phase>3.2&&phase<4;p.riftInactive=phase>=4&&!(s.grounded&&s.standing===p.id);}if(p.bone&&!p.gone){if(s.grounded&&s.standing===p.id&&p.fracture===0)p.fracture=.001;if(p.fracture>0){p.fracture+=dt;if(p.fracture>=p.breakDelay){p.gone=true;r.impacts.push({x:p.x+p.w/2,y:p.y,life:1.4,bone:true});s.events.push({type:'collapse',x:p.x+p.w/2,y:p.y});}}}}
 if(r.entered&&s.x>r.meteorStart-180&&s.x<s.goalX-230){r.meteorClock+=dt;const period=2.5-r.rank*.3;if(r.meteorClock>=period){r.meteorClock=0;const candidates=s.platforms.filter(p=>p.meteor&&!p.gone&&p.x>s.x+70&&p.x<s.x+900);const n=Math.min(r.rank+1,candidates.length);for(let j=0;j<n;j++){const p=candidates[(j*2+Math.floor(s.time))%candidates.length];if(s.falls.some(f=>f.target===p.id))continue;s.falls.push({target:p.id,meteor:true,x:p.x+p.w*.5,y:-80-j*90,vy:0,age:-j*.2,warning:1.55-r.rank*.1,r:21+3*r.rank,hit:false});}}}
}
function impact(s,p,f){if(!s.rift||!f.meteor||!p.meteor||p.anchor||p.gone)return;if(s.rift.rank===2)s.rift.shockwaves.push({x:p.x+p.w/2,y:p.y,age:0});p.gone=true;p.remnants=[{offset:p.w*.3,w:p.w*.4}];p.restY=p.y;s.rift.impacts.push({x:f.x,y:p.y,life:1.4});s.events.push({type:'collapse',x:f.x,y:p.y});}
function after(s,dt,hurt){const r=s.rift;if(!r||s.ended)return;
 if(r.rank===0&&s.grounded&&s.platforms[s.standing]?.elastic&&r.bounceLock===0){s.vy=-680;s.grounded=false;r.bounceLock=.8;s.events.push({type:'spring',x:s.x,y:s.y});}if(hurt)for(const q of r.shockwaves){const d=Math.abs(s.x-q.x),radius=q.age*270;if(q.age>.18&&Math.abs(d-radius)<20&&s.grounded&&Math.abs(s.y-q.y)<65)hurt(s);}if(s.checkpoint!==r.lastCheckpoint){r.lastCheckpoint=s.checkpoint;r.checkpointEra=r.era;r.checkpointEntered=r.entered;}
 if(!r.entered){const q=r.portals[0];if(s.x>q.x-30){s.x=Math.min(s.x,q.x);begin(s,'entry',q);}return;}
 r.stage=s.x<r.turnX?0:s.x<r.portals[1].x?1:s.x<r.meteorStart?2:3;
 if(!r.turned&&s.x>=r.turnX&&s.grounded){begin(s,'turn',null);return;}
 for(const q of r.portals){if(q.kind!=='era'||r.era===q.era||q.used)continue;if(Math.abs(s.x-q.x)<32&&Math.abs(s.y-30-q.y)<95){begin(s,'era',q);return;}}
 for(const q of r.walls)if(q.era===r.era&&s.x>q.x-25&&s.x<q.x+45&&s.y>q.y-160){s.x=q.x-25;s.vx=Math.min(0,s.vx);}
}
function respawn(s){if(!s.rift)return;const r=s.rift;r.transition=null;r.era=r.checkpointEra;r.entered=r.checkpointEntered;r.meteorClock=0;r.impacts=[];r.shockwaves=[];r.bounceLock=0;for(const p of s.platforms){p.fracture=0;if(p.meteor)p.remnants=null;if(p.turn){p.y=r.turned?p.baseY:p.turnFromY;p.turnAngle=r.turned?0:-Math.PI/2;}}for(const q of r.portals)if(q.kind==='era')q.used=q.x<s.checkpointX;sync(s);}
function label(s){const r=s.rift;if(!r)return '';if(!r.entered)return 'Loop de lichtpoort in om de tijdsbreuk te betreden.';if(r.transition)return r.transition.kind==='turn'?'De aardlaag kantelt…':r.transition.kind==='entry'?'Door de tijdsbreuk…':'Het landschap wisselt van tijdperk…';if(r.rank===0&&r.stage===0)return 'De gouden ribben veren mee: gebruik ze voor lange sprongen over het skelet.';if(r.rank===1&&r.stage===2)return 'Tijdbruggen vervagen kort. Wacht op een anker; een brug onder je voeten blijft bestaan.';if(r.rank===2&&r.stage===3)return 'Spring over de uitdijende inslaggolven. Gouden ankers bieden rust tussen de meteorieten.';return ['Spring van wervel naar rib. Turquoise ankers blijven staan.','Volg de pijlen omhoog en terug: de gekantelde route wisselt van richting.','Stap door de tijdpoorten. Gestippelde bruggen bestaan in het andere tijdperk.','Ontwijk de inslagringen. Turquoise kernen overleven de meteorieten.'][r.stage];}
function portal(c,x,y,t,col,large=false){c.save();c.translate(x,y);const rx=large?72:35,ry=large?148:64;const g=c.createRadialGradient(0,0,8,0,0,ry*1.35);g.addColorStop(0,col+'80');g.addColorStop(.5,col+'35');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(-ry*1.4,-ry*1.4,ry*2.8,ry*2.8);c.fillStyle='#090d29';c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.fill();c.shadowColor=col;c.shadowBlur=18;c.strokeStyle=col;c.lineWidth=3;
 for(let j=0;j<3;j++){c.beginPath();c.ellipse(0,0,rx+4+j*5,ry+j*5,Math.sin(t*.7+j)*.09,t+j*2,t+j*2+4.6);c.stroke();}
 c.shadowBlur=0;for(let j=0;j<22;j++){const a=j*2.399+t*.7,k=.2+(j%7)/9;c.fillStyle=j%2?'#ecfaff':col;c.beginPath();c.arc(Math.cos(a)*rx*k,Math.sin(a)*ry*k,1+j%3*.55,0,7);c.fill();}c.restore();}
function background(c,s,reduced){if(!s.rift)return;const r=s.rift,t=reduced?0:s.time,g=c.createLinearGradient(0,0,0,600);g.addColorStop(0,r.era?'#082632':'#130e30');g.addColorStop(1,r.era?'#267778':'#54385f');c.fillStyle=g;c.fillRect(0,0,1000,600);
 for(let layer=0;layer<3;layer++){c.fillStyle=['#778ca321','#438e9850','#102635a0'][layer];c.beginPath();c.moveTo(0,600);for(let i=-1;i<12;i++){const x=i*120-(s.camera*(.07+layer*.06))%120,y=320+layer*70+Math.sin(i*1.7+layer)*45;c.lineTo(x,y);c.lineTo(x+50,y-100-layer*15);c.lineTo(x+120,y);}c.lineTo(1000,600);c.fill();}
 for(let i=0;i<48;i++){const x=((i*137.4-s.camera*.16)%1000+1000)%1000,y=(i*71.7+t*4)%530;c.fillStyle=i%4?'#deccfa55':'#a5ffe8';c.fillRect(x,y,1+i%2,1+i%2);}
 c.strokeStyle=r.era?'#91f4ce30':'#dd9dfa30';c.lineWidth=2;for(let j=0;j<4;j++){c.beginPath();for(let x=0;x<=1000;x+=15){const y=70+j*25+Math.sin(x*.008+t*.22+j)*25;if(!x)c.moveTo(x,y);else c.lineTo(x,y);}c.stroke();}
 const sk=r.skeleton,xx=sk.from-s.camera*.6-300;c.save();c.globalAlpha=.24;c.strokeStyle='#e7e0c0';c.lineWidth=16;c.lineCap='round';c.beginPath();c.moveTo(xx,475);c.bezierCurveTo(xx+300,265,xx+800,520,xx+1250,370);c.stroke();for(let i=0;i<17;i++){const x=xx+i*70,y=407+Math.sin(i*.35)*30;c.beginPath();c.ellipse(x,y+45,35,100,.25,Math.PI,Math.PI*2.8);c.stroke();}c.fillStyle='#e8debf';c.beginPath();c.ellipse(xx-65,425,95,45,-.2,0,7);c.fill();c.fillStyle='#151c32';c.beginPath();c.ellipse(xx-92,410,18,13,0,0,7);c.fill();c.restore();
 if(s.x>r.meteorStart-500){const x=s.goalX-s.camera*.9;c.save();c.strokeStyle='#c6a8ff';c.shadowColor='#bb8aff';c.shadowBlur=reduced?0:22;c.lineWidth=5;c.beginPath();c.moveTo(x-60,-20);for(let j=0;j<10;j++)c.lineTo(x+Math.sin(j*2+t*.3)*30,j*70);c.stroke();c.restore();}
}
function platform(c,s,p,reduced){if(!s.rift)return false;const x=p.x-s.camera,y=p.y;if(x>1100||x+p.w< -100)return true;c.save();const t=reduced?0:s.time;
 if(p.turn){c.translate(x+p.w/2,y+12);c.rotate(p.turnAngle||0);c.translate(-p.w/2,-12);}else c.translate(x,y);
 if(p.riftInactive){c.globalAlpha=.26;c.setLineDash([7,6]);c.strokeStyle='#b9b4ff';c.lineWidth=2;c.strokeRect(0,0,p.w,24);c.setLineDash([]);if(!p.turn){c.restore();return true;}}
 if(p.gone&&!p.remnants){c.restore();return true;}
 const pieces=p.gone?p.remnants:[{offset:0,w:p.w}];for(const piece of pieces){const left=piece.offset,w=piece.w;
 if(p.bone){const shake=p.fracture?(Math.sin(t*35)*Math.min(2,p.fracture)):0;c.translate(shake,0);c.fillStyle=p.fracture?'#e1b292':'#d9d1ad';c.beginPath();c.roundRect(left,0,w,23,10);c.fill();c.strokeStyle='#fff0c5';c.lineWidth=3;c.beginPath();c.moveTo(left+10,4);c.lineTo(left+w-10,4);c.stroke();if(p.bone==='rib'){c.strokeStyle='#c5bd9b';c.lineWidth=10;c.beginPath();c.moveTo(w*.2,18);c.bezierCurveTo(w*.7,55,w*.75,95,w*.38,115);c.stroke();}else for(let j=14;j<w;j+=28){c.fillStyle='#eee3bf';c.beginPath();c.roundRect(j, -5,14,34,5);c.fill();}if(p.fracture){c.strokeStyle='#7a4748';c.lineWidth=2;c.beginPath();c.moveTo(w*.5,0);c.lineTo(w*.4,10);c.lineTo(w*.55,23);c.stroke();c.fillStyle='#ffe9b2';c.fillRect(0,-12,w*(1-p.fracture/p.breakDelay),4);}}
 else{const g=c.createLinearGradient(0,0,0,45);g.addColorStop(0,p.anchor?'#448f8a':p.era!==undefined?'#7777a1':'#69607e');g.addColorStop(1,'#24283e');c.fillStyle=g;c.beginPath();c.moveTo(left,0);c.lineTo(left+w,0);c.lineTo(left+w-12,28);c.lineTo(left+w*.58,46);c.lineTo(left+12,28);c.closePath();c.fill();c.fillStyle=p.anchor?'#adffe8':p.turn?'#d5bcff':'#e3c8ad';c.fillRect(left,0,w,5);c.strokeStyle='#e3dbf03a';c.beginPath();c.moveTo(left+7,17);c.lineTo(left+w-9,15);c.stroke();}
 }
 if(p.elastic&&!p.gone){c.strokeStyle='#ffda80';c.lineWidth=3;c.beginPath();c.moveTo(p.w/2-12,-15);c.lineTo(p.w/2,-27);c.lineTo(p.w/2+12,-15);c.stroke();}if(p.phaseBridge&&!p.riftInactive){c.fillStyle=p.phaseWarning?'#ffcd8a':'#98fff0';c.fillRect(0,-8,p.w*(1-((s.time+p.phaseOffset)%5)/5),3);}if(p.meteor&&!p.anchor&&!p.gone){c.fillStyle='#adffe8';c.fillRect(p.w*.3,0,p.w*.4,5);c.fillStyle='#9befd5';c.fillRect(p.w*.3,15,p.w*.4,2);}
 if(p.turn&&!p.riftInactive){const next=s.platforms[p.id+1],dx=next.x-p.x,dy=next.y-p.y;c.fillStyle='#ecd6ff';c.font='bold 22px system-ui';c.textAlign='center';c.fillText(dy< -40?(dx<0?'↖':'↗'):dy>40?'↘':'→',p.w/2, -18);}
 if(p.checkpoint){c.strokeStyle='#d4eee9';c.lineWidth=2;c.beginPath();c.moveTo(22,0);c.lineTo(22,-42);c.stroke();c.fillStyle=p.id<=s.checkpoint?'#a8ffdc':'#f1d7ac';c.beginPath();c.moveTo(22,-42);c.lineTo(45,-34);c.lineTo(22,-25);c.fill();}
 c.restore();return true;}
function draw(c,s,reduced){if(!s.rift)return;const r=s.rift,t=reduced?0:s.time;
 for(const q of r.portals){if(q.kind==='entry'&&r.entered)continue;const x=q.x-s.camera;if(x< -120||x>1120)continue;portal(c,x,q.y,t,q.kind==='entry'?'#e4b2ff':q.era?'#91ffe0':'#d8adff');c.fillStyle='#e9f7ef';c.textAlign='center';c.font='11px system-ui';c.fillText(q.kind==='entry'?'BETREED DE BREUK':q.era?'OERWERELD':'VERSTEENDE WERELD',x,q.y-90);}
 for(const q of r.walls){if(q.era!==r.era)continue;const x=q.x-s.camera;if(x< -80||x>1100)continue;c.fillStyle='#57465f';c.strokeStyle='#cfadd0';c.lineWidth=2;c.beginPath();c.moveTo(x-10,q.y);c.lineTo(x-8,q.y-145);c.lineTo(x+15,q.y-170);c.lineTo(x+40,q.y-125);c.lineTo(x+35,q.y);c.closePath();c.fill();c.stroke();}
 for(const q of r.shockwaves){const radius=q.age*270;c.strokeStyle='#ffd69c';c.lineWidth=4;c.globalAlpha=Math.max(0,1-q.age/1.3);for(const sign of [-1,1]){const x=q.x-s.camera+sign*radius;c.beginPath();c.arc(x,q.y,17,Math.PI,Math.PI*2);c.stroke();}}c.globalAlpha=1;for(const q of r.impacts){const age=1.4-q.life;for(let j=0;j<9;j++){c.fillStyle=q.bone?'#e5cfb0':'#b6a6cb';c.globalAlpha=Math.max(0,q.life/1.4);c.save();c.translate(q.x-s.camera+(j-4)*age*35,q.y+age*age*160-j%3*16);c.rotate(age*(j-3));c.fillRect(-7,-4,14,9);c.restore();}}c.globalAlpha=1;
 if(s.goalX-s.camera<1150)portal(c,s.goalX-s.camera+70,s.goalY-135,t,'#d6b6ff',true);
}
function overlay(c,s,reduced){const tr=s.rift?.transition;if(!tr)return;const k=Math.sin(Math.PI*Math.min(1,tr.time/tr.duration));c.save();c.fillStyle='rgba(35,18,66,'+(k*.5)+')';c.fillRect(0,0,1000,600);if(!reduced){c.translate(500,300);for(let i=0;i<30;i++){const a=i*2.399+tr.time*1.2,r=40+((i*27+tr.time*450)%650);c.strokeStyle=i%2?'#a9ffe755':'#ead3ff77';c.lineWidth=1+i%3;c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r*.65);c.lineTo(Math.cos(a)*(r+65*k),Math.sin(a)*(r+65*k)*.65);c.stroke();}}c.restore();}
function sound(kit){if(kit.muted||!kit.audio||!kit.fxGain)return;for(let i=0;i<3;i++)kit.voice(110+i*7,.95,'sine',.17,kit.fxGain,i*.055,570+i*43);kit.voice(920,.75,'triangle',.10,kit.fxGain,.13,85);}
const api={titles,hint,init,gate,before,after,impact,respawn,label,background,platform,draw,overlay,sound};root.PaleoRifts=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
