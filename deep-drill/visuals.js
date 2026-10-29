'use strict';
const DrillArt=(()=>{
function create(c,M,reduced){
 let beam={active:false,target:-1,from:null,to:null,color:'#93efe3'},cam={x:0,y:0};
 const rect=(x,y,w,h,col,r=0)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
 const line=(x,y,xx,yy,col,w=1)=>{c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();};
 const orb=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,Math.max(.1,r),0,Math.PI*2);c.fill();};
 const txt=(v,x,y,size=16,col='#e6f0e3',align='left')=>{c.font='600 '+size+'px system-ui, sans-serif';c.fillStyle=col;c.textAlign=align;c.fillText(v,x,y);};
 function glow(x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col+'55');g.addColorStop(1,col+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 function crystal(x,y,size,col,tilt=0){c.save();c.translate(x,y);c.rotate(tilt);c.fillStyle=col;c.beginPath();c.moveTo(0,-size);c.lineTo(size*.27,-size*.66);c.lineTo(size*.2,0);c.lineTo(-size*.2,0);c.lineTo(-size*.26,-size*.65);c.closePath();c.fill();c.fillStyle='#ffffff55';c.beginPath();c.moveTo(0,-size);c.lineTo(0,0);c.lineTo(-size*.2,0);c.lineTo(-size*.26,-size*.65);c.fill();line(0,-size,0,-size*.08,'#efffff88');c.restore();}
 function fossil(x,y,size,col){c.strokeStyle=col;c.lineWidth=Math.max(1.5,size*.10);c.beginPath();for(let j=0;j<64;j++){const a=j*.19,r=j/64*size,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;if(j)c.lineTo(xx,yy);else c.moveTo(xx,yy);}c.stroke();for(let j=0;j<9;j++){const a=j*.6;line(x+Math.cos(a)*size*.55,y+Math.sin(a)*size*.55,x+Math.cos(a+.1)*size,y+Math.sin(a+.1)*size,col,1);}}
 function paintRock(x,y,kind,col,row){
  if(kind===7){
   rect(x,y,48,48,'#222937');const n=(col*13+row*7)%8;
   for(let j=0;j<3;j++){const xx=x+j*16,tip=3+(n+j*3)%7;c.fillStyle=j%2?'#303345':'#3c3a4b';c.beginPath();c.moveTo(xx+1,y+tip);c.lineTo(xx+7,y+1);c.lineTo(xx+14,y+tip-1);c.lineTo(xx+15,y+39);c.lineTo(xx+9,y+47);c.lineTo(xx+1,y+43);c.closePath();c.fill();line(xx+7,y+3,xx+7,y+40,'#77707c55');line(xx+1,y+tip,xx+6,y+2,'#b2a39b66');if((n+j)%3===0){line(xx+14,y+20,xx+10,y+26,'#131e2b',1.4);line(xx+10,y+26,xx+15,y+30,'#131e2b',1.4);}}
   line(x+2,y+2,x+46,y+2,'#a6989266',2);return;
  }
  const r=M.rocks[kind-1];if(!r)return;const n=(col*17+row*13)%31;rect(x,y,48,48,r.color);rect(x,y,48,2,r.edge+'b0');rect(x,y+46,48,2,'#08172555');
  if(['earth','sand','lamina'].includes(r.texture)){
   for(let j=1;j<5;j++)line(x+1,y+j*9,x+47,y+j*9-2+(n%4),r.texture==='lamina'?'#d0e1e333':'#362a333b',r.texture==='lamina'?2:1);
   for(let j=0;j<8;j++)rect(x+3+(j*17+n)%42,y+4+(j*13+n)%40,1.5,1.5,r.edge+'88');
  }else if(r.texture==='pebbles'){for(let j=0;j<5;j++){const xx=x+8+(j*17+n)%34,yy=y+8+(j*23)%31;c.fillStyle=['#cab591','#665d59','#d6b382'][j%3];c.beginPath();c.ellipse(xx,yy,5+j%3,3+j%4,j,0,7);c.fill();}}
  else if(r.texture==='fossil'){for(let j=1;j<4;j++)line(x,y+j*12,x+48,y+j*12-2,'#403c4533');if((col+row)%3===0)fossil(x+25,y+25,12,r.edge+'c0');else{line(x+9,y+35,x+35,y+11,r.edge+'99',2);for(let j=0;j<4;j++)line(x+12+j*5,y+32-j*5,x+6+j*5,y+22-j*5,r.edge+'99',1.5);}}
  else if(r.texture==='pores'){for(let j=0;j<7;j++){const xx=x+6+(j*19+n)%37,yy=y+7+(j*13)%34;orb(xx,yy,2+j%3,'#172b3555');line(xx-2,yy+3,xx+2,yy+3,r.edge+'88');}}
  else if(r.texture==='columns'){for(let j=0;j<3;j++){const xx=x+6+j*17;line(xx,y,xx-3,y+28,'#17213488',2);line(xx-3,y+28,xx+1,y+48,'#17213488',2);line(xx+2,y+1,xx+5,y+24,r.edge+'55');}}
  else if(['waves','veins'].includes(r.texture)){for(let j=0;j<4;j++){c.strokeStyle=j%2?r.edge+'80':'#112f3544';c.lineWidth=2;c.beginPath();c.moveTo(x,y+8+j*11);c.bezierCurveTo(x+12,y+j*10-4,x+30,y+32+j*8,x+48,y+j*10+3);c.stroke();}}
  else if(r.texture==='glass'){c.fillStyle=r.edge+'33';c.beginPath();c.moveTo(x+7,y+43);c.lineTo(x+18,y+4);c.lineTo(x+39,y+14);c.closePath();c.fill();line(x+7,y+43,x+18,y+4,r.edge+'aa');line(x+18,y+4,x+39,y+14,r.edge+'55');}
  else if(r.texture==='crystal'){for(let j=0;j<3;j++)crystal(x+9+j*13,y+40-(j%2)*8,15+j%2*8,r.edge,j*.25-.2);}
  else{for(let j=0;j<12;j++)rect(x+4+(j*19+n)%40,y+5+(j*13)%38,2+j%3,2,j%2?r.edge+'aa':'#131c3488');}
 }
 const tiles=new Map();
 function rock(x,y,kind,col,row){
  const key=kind+':'+((col*17+row*13)%6)+':'+((col+row)%3);let tile=tiles.get(key);
  if(!tile){
   if(typeof OffscreenCanvas!=='undefined')tile=new OffscreenCanvas(48,48);
   else if(typeof document!=='undefined'){tile=document.createElement('canvas');tile.width=48;tile.height=48;}
   if(!tile){paintRock(x,y,kind,col,row);return;}
   const original=c;try{c=tile.getContext('2d');paintRock(0,0,kind,col,row);}finally{c=original;}
   tiles.set(key,tile);
  }
  c.drawImage(tile,x,y);
 }
 function fracture(x,y,progress){
  const points=[[21,4],[29,16],[17,28],[24,44]],length=Math.min(.999,progress)*3;
  c.save();c.beginPath();c.moveTo(x+points[0][0],y+points[0][1]);
  for(let j=0;j<3&&j<length;j++){const t=Math.min(1,length-j),a=points[j],b=points[j+1];c.lineTo(x+a[0]+(b[0]-a[0])*t,y+a[1]+(b[1]-a[1])*t);}
  c.strokeStyle='#172334';c.lineWidth=2.4;c.stroke();
  if(progress>.45)line(x+25,y+20,x+Math.max(9,25-(progress-.45)*30),y+22,'#172334',1.5);
  if(progress>.72)line(x+20,y+34,x+20+(progress-.72)*48,y+38,'#172334',1.5);
  c.restore();
 }
 function laserOrigin(s){return {x:s.x,y:s.y-52};}
 function octopus(x,y,vx,grounded,clock,ghost=false,hat=0,active=false){
  c.save();c.translate(x,y-14);if(ghost)c.globalAlpha=.55;
  for(let j=0;j<8;j++){const dx=(j-3.5)*4;c.strokeStyle=j%2?'#8cc6b9':'#b39edc';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(dx*.45,0);c.quadraticCurveTo(dx,8,dx+Math.sin(clock*(grounded&&Math.abs(vx)>5?9:3)+j)*3,13);c.stroke();}
  const skin=c.createLinearGradient(-15,-30,15,5);skin.addColorStop(0,'#e0c4ee');skin.addColorStop(1,'#788cb8');c.fillStyle=skin;c.beginPath();c.ellipse(0,-12,15,19,0,0,7);c.fill();
  for(const d of [-1,1]){orb(d*6,-13,4,'#f4f8eb');orb(d*6+Math.sign(vx),-13,1.6,'#173044');}
  if(hat){
   const accent=M.drillColors[hat],shell=c.createLinearGradient(0,-42,0,-24);shell.addColorStop(0,'#d5edf0');shell.addColorStop(.3,'#7193aa');shell.addColorStop(1,'#20374e');
   c.fillStyle=shell;c.beginPath();c.moveTo(-16,-28);c.bezierCurveTo(-16,-46,16,-46,16,-28);c.closePath();c.fill();
   c.strokeStyle='#d4f5ef99';c.lineWidth=1;c.stroke();rect(-19,-29,38,5,'#244559',2);line(-15,-25,15,-25,accent,1.5);
   line(-12,-31,-10,-36,accent,1.3);line(10,-36,12,-31,accent,1.3);rect(-8,-32,16,3,'#082636',1);
   for(let j=0;j<Math.min(4,1+Math.floor((hat-1)/2));j++)rect(-7+j*4,-32,2,2,accent,1);
   // The lens on the crown is the exact origin of the mining beam.
   orb(0,-38,7,'#122f44');orb(0,-38,5,accent);orb(-1,-39,2.3,active?'#ffffff':'#e9fffa');
   if(active)glow(0,-38,18,accent);
  }
  c.restore();
 }
 function updateLaser(s,playing){
  beam.active=!!(playing&&s.mining&&!s.trial&&!s.transition&&!s.respawn&&!s.ended);
  if(!beam.active){beam.target=-1;return;}
  beam.from=laserOrigin(s);beam.to={x:(s.mining.x+.5)*M.C,y:(s.mining.y+.5)*M.C};beam.target=s.mining.index;beam.color=M.drillColors[s.drill];
 }
 function laser(s,clock){
  if(!beam.active)return;
  const x=beam.from.x-cam.x,y=beam.from.y-cam.y,tx=beam.to.x-cam.x,ty=beam.to.y-cam.y,col=beam.color;
  const dx=tx-x,dy=ty-y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len,pulse=reduced?1:1+Math.sin(clock*15)*.09;
  c.save();c.lineCap='round';line(x,y,tx,ty,col+'20',13*pulse);line(x,y,tx,ty,col+'66',6*pulse);line(x,y,tx,ty,col,2.5*pulse);line(x,y,tx,ty,'#efffff',1);
  if(!reduced)for(let j=0;j<4;j++){const t=(clock*1.8+j*.25)%1;orb(x+dx*t,y+dy*t,1.5,col);}
  glow(tx,ty,30,col);orb(tx,ty,3,'#f3ffeb');
  for(let j=0;j<(reduced?2:8);j++){const t=reduced?.4:(clock*1.7+j*.173)%1,a=j*2.4,r=5+t*20;c.globalAlpha=(1-t)*.8;line(tx+Math.cos(a)*r,ty+Math.sin(a)*r,tx+Math.cos(a)*(r+4),ty+Math.sin(a)*(r+4),j%2?'#ffffff':col,1.4);}
  c.globalAlpha=.35;line(x+nx*5,y+ny*5,x+dx*.2+nx*3,y+dy*.2+ny*3,col,1);c.restore();
 }
 function portal(x,y,color,clock,used=false,label=''){
  glow(x,y,100,color);c.save();c.translate(x,y);rect(-38,-46,12,85,'#394650',5);rect(26,-46,12,85,'#394650',5);rect(-40,34,80,11,'#75877e',4);
  c.fillStyle='#0b1425';c.beginPath();c.ellipse(0,0,25,39,0,0,7);c.fill();for(let j=0;j<3;j++){c.strokeStyle=color;c.lineWidth=j?1.5:3;c.beginPath();c.ellipse(0,0,24+j*4,37+j*3,Math.sin(clock*.7+j)*.1,clock+j,clock+j+4.8);c.stroke();}for(let j=0;j<5;j++)orb(Math.sin(clock+j*3)*18,Math.cos(clock*.8+j)*29,1.8,color);if(used)txt('✓',0,8,24,color,'center');else{line(-8,0,7,0,color,2);line(2,-5,7,0,color,2);line(2,5,7,0,color,2);}if(label)txt(label,0,y-60<108?65:-60,12,color,'center');c.restore();
 }
 function chamber(q,clock){
  const col=M.biomes[q.kind].glow,v=q.variant%2,scale=Math.min(q.rx/330,q.ry/180);
  c.save();c.translate(q.x-cam.x,q.y-cam.y);c.scale(scale,scale);glow(0,0,300,col);
  // Each pair shares its geology, but has a different silhouette and focal object.
  if(q.kind===0){
   for(let j=-4;j<=4;j++){const xx=j*64;c.strokeStyle='#91ae7570';c.lineWidth=v?3:6;c.beginPath();c.moveTo(xx,-180);c.bezierCurveTo(xx+55,-130,xx-40,-55,xx+15,v?-65:20);c.stroke();for(let k=0;k<3;k++)orb(xx+8-k*9,-78+k*19,4,'#b1dc9288');}
   for(let j=-4;j<=4;j++){const xx=j*64,yy=114+(j*j%3)*7,r=v?22+(j*j%3)*10:14;line(xx,yy+25,xx,yy-r*.4,'#aedbc488',4);c.fillStyle=v?'#82dcbbc0':'#86bba788';c.beginPath();c.ellipse(xx,yy-r*.4,r,r*.45,0,Math.PI,Math.PI*2);c.fill();if(v){glow(xx,yy-r*.4,46,'#85e7ba');for(let k=-1;k<2;k++)orb(xx+k*10,yy-r*.5-5,2,'#dcffe6');}}
  }else if(q.kind===1){
   if(v){line(-240,45,158,30,'#d8c399aa',10);for(let j=0;j<14;j++){const xx=-230+j*30,yy=45-j;orb(xx,yy,8,'#ebd4a7cc');c.strokeStyle='#e8d0aa99';c.lineWidth=5;c.beginPath();c.ellipse(xx,yy+18,13,45,.22,.4,5.8);c.stroke();}c.fillStyle='#d9c7acc0';c.beginPath();c.moveTo(168,25);c.lineTo(212,-8);c.lineTo(252,40);c.lineTo(204,68);c.closePath();c.fill();orb(215,24,9,'#30293b');}
   else{for(let j=0;j<5;j++){const xx=-220+j*110,yy=Math.sin(j*2)*54;fossil(xx,yy,32+j%3*12,'#e6d0abb0');for(let k=0;k<5;k++)line(xx-20+k*9,yy+76,xx-24+k*11,yy+120,'#c4bba96a',2);}line(-270,145,270,134,'#ddd0af55',5);}
  }else if(q.kind===2){
   for(let j=-5;j<=5;j++){crystal(j*54,-150,-(v?110:55)-(j*j*13)%50,'#7bb2a294',.05);crystal(j*55+23,165,(v?75:24)+(j*j*11)%50,'#86b7a0aa',.1);}
   if(!v){for(let j=0;j<8;j++){const yy=-90+(clock*45+j*31)%200;orb(Math.sin(j*3)*160,yy,2.2,'#cafeeeaa');}c.fillStyle='#62c3c03f';c.beginPath();c.ellipse(0,115,210,23,0,0,7);c.fill();for(let j=0;j<3;j++){c.strokeStyle='#b3ebe088';c.beginPath();c.ellipse(-65+j*70,115,10+(clock*10+j*8)%40,3+(clock*2+j)%7,0,0,7);c.stroke();}}
   else{line(-20,-142,-20,104,'#bde0d13b',2);orb(-20,-40+(clock*60)%145,2,'#e2fff1');crystal(10,159,108,'#b4d1bb99',-.1);}
  }else if(q.kind===3){
   for(let j=-5;j<=5;j++){crystal(j*51,136,55+(j*j*23)%105,v?'#b4eef0b0':j%2?'#ae81d7bb':'#baace5bb',v?j*.025:j*.14);crystal(j*55,-155,-25-(j*j*13)%70,v?'#9dcedb99':'#cba3f388',j*.06);}
   if(v){crystal(0,83,153,'#d6f9eecc',.05);for(let j=0;j<3;j++)line(-105+j*100,-38,65+j*32,12,'#d5ffff35',2);}
   else{orb(0,-30,20,'#dbccff55');for(let j=0;j<7;j++)line(0,-30,Math.cos(j*.9+clock*.12)*190,-30+Math.sin(j*.9+clock*.12)*105,'#dfd9ff28');}
  }else if(q.kind===4){
   for(let j=-3;j<=3;j++){rect(j*80-7,-110,14,235,'#c0ab8050',3);line(j*80-28,-110,j*80+28,-110,'#d7c9a377',8);}
   if(v){line(-280,134,280,134,'#a29b8799',5);line(-280,152,280,152,'#6a8b9399',3);for(let j=-5;j<6;j++)line(j*47,130,j*47+8,157,'#b59b7788',4);rect(-45,63,96,55,'#7c8082',7);line(-39,66,44,66,'#e1cdaa',4);orb(-27,126,11,'#202a37');orb(31,126,11,'#202a37');}
   else{rect(-50,15,100,90,'#547680',9);rect(-36,27,72,40,'#0b2a3b',4);for(let j=0;j<5;j++)line(-28+j*12,46+Math.sin(j*2)*9,-16+j*12,46+Math.sin((j+1)*2)*9,'#aeefd0',2);orb(-26,85,5,'#e8c990');rect(-8,80,42,9,'#234a59',2);line(0,15,0,-50,'#a5c5c9',3);c.strokeStyle='#b3d4d999';c.lineWidth=3;c.beginPath();c.arc(0,-54,25,.2,2.9);c.stroke();glow(0,48,100,'#aedcb6');}
  }else if(q.kind===5){
   if(!v){c.strokeStyle='#92c6d94a';c.lineWidth=18;c.beginPath();c.ellipse(0,0,220,125,-.05,0,7);c.stroke();for(let j=0;j<18;j++){const a=j*Math.PI/9;crystal(Math.cos(a)*200,Math.sin(a)*110,38+j%3*13,'#b2e5f0b0',a+Math.PI/2);}glow(0,0,130,'#a5ddff');}
   else{for(let j=-3;j<=3;j++){c.strokeStyle=j%2?'#9ad4b977':'#6bbaa177';c.lineWidth=7;c.beginPath();c.moveTo(-240,j*33);c.bezierCurveTo(-105,-60+j*38,45,90+j*22,240,j*34-15);c.stroke();}for(let j=-3;j<=3;j++)crystal(j*72,112,35+(j*j*17)%75,'#a4d9a88f',j*.09);}
  }else if(q.kind===6){
   if(!v){for(let j=-5;j<=5;j++){const h=90+(j*j*19)%135;rect(j*50,155-h,42,h,'#a296ad66',3);line(j*50+4,158-h,j*50+4,149,'#e0c2b255',2);}}
   else{for(let j=-2;j<=2;j++){const x=j*101,y=110-(j*j%3)*13;c.fillStyle='#303048';c.beginPath();c.moveTo(x-34,y);c.lineTo(x-27,y-160);c.lineTo(x+8,y-211);c.lineTo(x+39,y-139);c.lineTo(x+30,y);c.closePath();c.fill();line(x+8,y-211,x+2,y-25,'#bda4d58f',2);line(x-20,y-133,x+27,y-104,'#f2c0d744',4);glow(x,y-110,70,'#b4a0e0');}}
   for(let j=0;j<10;j++)orb(Math.sin(j*7)*230,130-(clock*15+j*23)%280,1+j%2,'#ffc49288');
  }else{
   if(!v){for(let j=-4;j<=4;j++){const x=j*62;crystal(x,130,40+(j*j*23)%106,j%2?'#b8c66da0':'#dfd687aa',j*.13);crystal(x,-140,-45-(j*j*13)%62,'#a8b47588',-.08);}glow(0,30,170,'#d1c687');}
   else{c.fillStyle='#0e1323';c.beginPath();c.ellipse(0,0,180,116,0,0,7);c.fill();for(let j=0;j<4;j++){c.strokeStyle=['#fbb66c99','#ec886c88','#b9607188','#85608488'][j];c.lineWidth=5;c.beginPath();c.ellipse(0,0,175-j*24,108-j*15,.13,0,7);c.stroke();}for(let j=0;j<9;j++){const a=j*.7+clock*.06;orb(Math.cos(a)*110,Math.sin(a*2)*57,2,'#ffc195');}glow(0,0,160,'#ef997c');}
  }
  // Eight compositions per region: geology stays recognisable, silhouettes vary.
  const d=q.detail||0;
  if(d%4===0){for(let j=0;j<5;j++){const a=clock*.25+j*1.3;orb(Math.cos(a)*190,Math.sin(a*1.7)*95,2+j%2,col+'88');}fossil(-170,30,28,col+'50');}
  if(d%4===1){for(let j=-2;j<=2;j++){line(j*74,-130,j*60,-50,col+'44',2);crystal(j*60,-48,22+j*j*4,col+'99',.15*Math.sin(clock+j));}line(-190,138,195,138,col+'44',5);}
  if(d%4===2){c.strokeStyle=col+'55';c.lineWidth=13;c.beginPath();c.ellipse(0,15,200,130,0,Math.PI,Math.PI*2);c.stroke();for(let j=-3;j<=3;j++)rect(j*56-5,-84+Math.abs(j)*12,10,17,col+'77',2);}
  if(d%4===3){for(let j=0;j<4;j++){const xx=-170+j*110;glow(xx,50,65,col);c.strokeStyle=col+'44';c.beginPath();c.ellipse(xx,80,35,10,0,0,7);c.stroke();for(let k=0;k<3;k++)orb(xx+Math.sin(clock+j+k)*15,60-(clock*18+k*31)%120,2,col+'66');}}
  c.restore();
 }
 function roomScenery(s,q,clock){
  if(!q.profile){chamber(q,clock);return;}
  const C=48,col=M.biomes[q.kind].glow,x=q.x-cam.x,y=q.y-cam.y,base=q.floor*C-cam.y;
  c.save();c.beginPath();
  for(const p of q.profile)for(let row=p.top;row<p.bottom;row++)if(s.seen[M.at(p.col,row)]&&s.cells[M.at(p.col,row)]===0)c.rect(p.col*C-cam.x,row*C-cam.y,49,49);
  c.clip();
  const wall=c.createRadialGradient(x,y-12,12,x,y,q.rx*1.25);wall.addColorStop(0,M.biomes[q.kind].back);wall.addColorStop(.55,'#182736');wall.addColorStop(1,'#091522');rect(x-q.rx-10,y-q.ry-15,q.rx*2+20,q.ry*2+30,wall);
  // Soft strata on the back wall follow the cavity instead of forming a platform.
  for(let j=0;j<4;j++){
   c.strokeStyle=col+["16","12","0e","09"][j];c.lineWidth=6+j*4;c.beginPath();
   for(let i=0;i<q.profile.length;i++){const p=q.profile[i],xx=(p.col+.5)*C-cam.x,yy=p.top*C-cam.y+17+j*18+Math.sin(i*.8+q.shape)*6;if(i)c.lineTo(xx,yy);else c.moveTo(xx,yy);}c.stroke();
  }
  chamber(q,clock);
  for(const p of q.profile){
   const xx=p.col*C-cam.x,yy=p.top*C-cam.y,fy=p.bottom*C-cam.y;
   const shade=c.createLinearGradient(0,yy,0,yy+34);shade.addColorStop(0,'#07131cbb');shade.addColorStop(1,'#07131c00');rect(xx,yy,49,34,shade);
   c.fillStyle='#09172399';c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+10,yy+9+(p.col+q.detail)%8);c.lineTo(xx+25,yy+4);c.lineTo(xx+39,yy+11);c.lineTo(xx+49,yy);c.closePath();c.fill();
   const floorShade=c.createLinearGradient(0,fy-22,0,fy);floorShade.addColorStop(0,'#08121c00');floorShade.addColorStop(1,'#08121ca0');rect(xx,fy-22,49,22,floorShade);
   if(Math.abs(p.col-q.cx)>2){
    if(q.kind===0){for(let j=0;j<4;j++){const bx=xx+8+j*10;line(bx,fy-2,bx+Math.sin(clock*.7+j)*3,fy-8-(p.col+j)%9,col+'77',1.3);}}
    else if([2,3,5,7].includes(q.kind))crystal(xx+22,fy-1,12+(p.col*7)%21,col+'99',(p.col%3-1)*.18);
    else{orb(xx+13,fy-2,3,col+'55');orb(xx+32,fy-2,2,col+'66');}
   }
  }
  if([0,2,5].includes(q.kind))for(let j=0;j<4;j++){const dx=Math.sin(j*5+q.detail)*q.rx*.72,yy=y-q.ry+18+(clock*(23+j*4)+j*67)%(q.ry*1.7);line(x+dx,yy,x+dx,yy+4,col+'77',1);}
  c.restore();
 }
 function basinBackground(s,w,h,clock){
  if(cam.y+h<M.Abyss.TOP*48)return;
  const top=M.Abyss.TOP*48-cam.y,bottom=M.Abyss.BOTTOM*48-cam.y;
  const bg=c.createLinearGradient(0,top,0,bottom);bg.addColorStop(0,'#171c33');bg.addColorStop(.6,'#382333');bg.addColorStop(1,'#773a36');rect(0,top,w,bottom-top,bg);
  for(let layer=0;layer<2;layer++)for(let j=0;j<31;j++){
   const wx=630+j*(layer?227:307),x=wx-cam.x*(layer?.94:1),height=180+(j*137)%470,base=bottom-30;
   if(x< -260||x>w+260)continue;
   c.fillStyle=layer?'#352b3d':'#292638';c.beginPath();c.moveTo(x-85,base);c.lineTo(x-70,base-height);c.lineTo(x-26,base-height-55);c.lineTo(x+30,base-height-36);c.lineTo(x+65,base-height);c.lineTo(x+94,base);c.closePath();c.fill();
   line(x-26,base-height-51,x-20,base-15,layer?'#c26d4c33':'#9f8b8430',2);
   if(j%3===0){glow(x,base-55,170,'#f5945b');line(x-4,base-height*.45,x+11,base-27,'#ef986e33',2);}
  }
  for(let j=0;j<31;j++){
   const x=650+j*223-cam.x,drop=70+(j*71)%145;if(x< -100||x>w+100)continue;
   crystal(x,top+3,-drop,'#3a3548',.08*Math.sin(j));crystal(x+36,top+8,-drop*.5,'#565064',-.15);
  }
  const y=bottom-26;for(let j=0;j<25;j++){const x=(j*227+clock*11-cam.x*.9+w*99)%w,yy=y-(j*41+clock*(14+j%3))%420;orb(x,yy,1+j%3,'#ffbd7866');}
 }
 function basinCourse(s,w,h,clock){
  const a=s.abyss,C=48,visible=(x,y)=>x>cam.x-100&&x<cam.x+w+100&&y>cam.y-260&&y<cam.y+h+60;
  const seen=(x,y)=>s.seen[M.at(Math.floor(x/C),Math.floor(y/C))];
  for(const p of a.platforms){if(!visible(p.x,p.y)||!seen(p.x+24,p.y-12))continue;
   const x=p.x-cam.x,y=p.y-cam.y;line(x+2,y+1,x+p.w-2,y+1,'#e1c39c',3);line(x+4,y+6,x+p.w-4,y+6,'#986e6370');
   for(let xx=8;xx<p.w;xx+=31){orb(x+xx,y+6,1.6,'#d9c0a588');line(x+xx+6,y+3,x+xx+11,y+7,'#6f697944');}
   if(p.index%3!==0){for(let j=0;j<2;j++){const xx=x+20+j*(p.w-40);line(xx,y+85,xx-6,y+103,'#b18a7566',2);}}
  }
  const l=a.ladder,x=l.x-cam.x;
  for(let y=l.top-44;y<l.bottom;y+=16){if(!visible(l.x,y)||!seen(l.x,y))continue;const yy=y-cam.y;
   line(x-14,yy,x-14,yy+17,'#426b72',6);line(x+14,yy,x+14,yy+17,'#426b72',6);line(x-14,yy,x-14,yy+17,'#b9dfd5',1);line(x+14,yy,x+14,yy+17,'#b9dfd5',1);
   line(x-14,yy+8,x+14,yy+8,'#c5e7cf',4);line(x-12,yy+11,x+12,yy+11,'#213f4e',2);
  }
  if(visible(l.x,l.bottom)&&seen(l.x,l.bottom-20)){
   glow(x,l.bottom-cam.y-100,85,'#88e4d0');rect(x-60,l.bottom-cam.y-195,120,25,'#0d303ee8',6);txt('UITGANG ↑',x,l.bottom-cam.y-177,12,'#c4f7e3','center');
  }
  for(const col of a.entries){const xx=(col+.5)*C,yy=(M.Abyss.TOP-2)*C;if(!visible(xx,yy)||!seen(xx,yy))continue;txt('AFDALING',xx-cam.x,yy-cam.y-48,11,'#efca9a','center');txt('↓',xx-cam.x,yy-cam.y-24,24,'#f9d7a6','center');}
  for(const v of a.vents){if(!visible(v.x,v.y)||!seen(v.x,v.y-8))continue;const q=M.Abyss.vent(s,v),x=v.x-cam.x,y=v.y-cam.y;
   c.fillStyle='#e28a5b';c.beginPath();c.ellipse(x,y+2,16,5,0,0,7);c.fill();orb(x,y,5,'#2b2337');
   if(q.state==='warning'){glow(x,y,40,'#f6b16a');c.setLineDash([3,6]);line(x,y-7,x,y-v.height,'#ffca83b0',2);c.setLineDash([]);c.strokeStyle='#ffdd96';c.lineWidth=2;c.beginPath();c.arc(x,y-20,11,-Math.PI/2,-Math.PI/2+q.progress*Math.PI*2);c.stroke();}
   if(q.state==='active'){
    glow(x,y-35,100,'#ffaf64');for(let j=0;j<7;j++){const t=(clock*2+j/7)%1,yy=y-t*v.height,xx=x+Math.sin(clock*13+j)*8;c.globalAlpha=1-t*.6;orb(xx,yy,13-t*8,j%2?'#ffd489':'#f17b45');}c.globalAlpha=1;
    line(x,y,x,y-v.height*.7,'#fff4b9',5);
   }
  }
  for(const p of a.pendulums){const q=M.Abyss.pendulum(s,p);if(!visible(q.x,q.y)||!seen(q.x,q.y))continue;const x=q.x-cam.x,y=q.y-cam.y,ax=p.x-cam.x,ay=p.anchor-cam.y;
   line(ax,ay,x,y,'#74838c',3);for(let j=0;j<8;j++)orb(ax+(x-ax)*j/8,ay+(y-ay)*j/8,2,'#bdacac');orb(ax,ay,7,'#a5a7ac');glow(x,y,42,'#e88175');
   orb(x,y,p.r+2,'#483743');orb(x-2,y-2,p.r-1,'#8b6b74');line(x-10,y-7,x+4,y+1,'#f0a48b',2);line(x+4,y+1,x-1,y+12,'#f0a48b',2);orb(x-6,y-8,3,'#bca3a3');
  }
 }
 function coolingFields(s,w,h,clock){
  const visible=(x,y)=>x>cam.x-160&&x<cam.x+w+160&&y>cam.y-160&&y<cam.y+h+160;
  for(const q of s.refuges||[]){if(!visible(q.x,q.y)||!s.seen[M.at(q.col,q.floor-1)])continue;
   const x=q.x-cam.x,y=q.y-cam.y,active=s.lava.phase!=='quiet',pulse=reduced?1:.8+Math.sin(clock*2+q.col)*.2;
   if(q.natural){
    const g=c.createLinearGradient(x-70,y-143,x+70,y);g.addColorStop(0,'#75ded400');g.addColorStop(.5,active?'#75ded432':'#75ded412');g.addColorStop(1,'#75ded408');rect(x-70,y-143,140,142,g,28);
    glow(x,y-28,active?108:68,'#85e6d7');crystal(x-56,y-1,32,'#8eddd0',-.3);crystal(x+55,y-1,26,'#b9ece0',.23);
    if(active){c.strokeStyle='#acf4dc77';c.lineWidth=1.4;c.beginPath();c.ellipse(x,y-70,68,70,0,0,7);c.stroke();for(let j=0;j<6;j++)orb(x+Math.sin(j*2.4+clock*.5)*57,y-12-(clock*24+j*21)%117,1.6,'#c9ffe2aa');}
    txt('KOELKRISTAL',x,y-115,10,'#b0e9dd','center');continue;
   }
   rect(x-70,y-143,140,141,active?'#6deadc22':'#6deadc0b',16);glow(x,y-70,active?115:65,'#70ded7');
   line(x-69,y-3,x+69,y-3,'#85f2df',3);line(x-69,y-5,x-69,y-126,'#70c6c688',3);line(x+69,y-5,x+69,y-126,'#70c6c688',3);
   c.strokeStyle='#80dedac0';c.lineWidth=4;c.beginPath();c.ellipse(x,y-122,69,20,0,Math.PI,Math.PI*2);c.stroke();
   if(active)for(let j=0;j<5;j++){const yy=y-12-(clock*35+j*29)%125;line(x-60,yy,x+60,yy,'#bdfff3'+Math.floor(35*pulse).toString(16).padStart(2,'0'),1);}
   c.fillStyle='#0e3b48';c.beginPath();c.moveTo(x-12,y-121);c.lineTo(x+12,y-121);c.lineTo(x+10,y-105);c.lineTo(x,y-96);c.lineTo(x-10,y-105);c.closePath();c.fill();c.strokeStyle='#b9fff0';c.lineWidth=2;c.stroke();
   txt('KOELNIS',x,y-154,11,'#b7f0e6','center');
  }
 }
 function roomHazards(s,w,h,clock){
  const C=M.C,visible=(x,y)=>x>cam.x-160&&x<cam.x+w+160&&y>cam.y-160&&y<cam.y+h+160;
  for(const z of s.hazards||[]){if(!visible(z.x,z.y)||!s.seen[M.at(Math.floor(z.x/C),Math.floor(z.y/C)-1)])continue;
   const q=M.Caverns.hazard(s,z),x=z.x-cam.x,y=z.y-cam.y,color=z.kind==='resonance'?'#d8afff':z.kind==='steam'?'#a3eeeb':'#e5be8f';
   if(z.disabled){line(x-11,y+5,x+11,y+5,'#81bdad',2);continue;}
   c.fillStyle='#172533';c.beginPath();c.ellipse(x,y+2,16,5,0,0,7);c.fill();crystal(x-7,y+2,12,color,-.3);crystal(x+8,y+2,9,color,.2);
   if(q.state==='warning'){
    c.setLineDash([4,6]);line(x,y-3,x,y-(z.kind==='stone'?(z.fallHeight||150):65),color+'aa',2);c.setLineDash([]);
    c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(x,y-19,12,-Math.PI/2,-Math.PI/2+q.progress*Math.PI*2);c.stroke();
    if(z.kind==='stone')orb(x,y-(z.fallHeight||150),14,color+'aa');
   }else if(q.state==='active'){
    if(z.kind==='stone'){const yy=y-(z.fallHeight||150)+q.progress*((z.fallHeight||150)+30);orb(x,yy,16,color);line(x-9,yy-4,x+5,yy+8,'#4b4144',3);for(let j=1;j<4;j++)orb(x+Math.sin(j)*5,yy-j*17,4-j*.6,color+'66');}
    else{glow(x,y-35,60,color);line(x,y,x,y-65,color+'60',35);line(x,y,x,y-65,color,8);for(let j=0;j<6;j++)orb(x+Math.sin(clock*8+j)*12,y-(clock*100+j*11)%65,4,color+'aa');}
   }else orb(x,y-7,3,color+'77');
  }
 }
 function mine(s,w,h,clock,aim){
  cam.x=Math.max(0,Math.min(M.W*48-w,s.x-w*.5));cam.y=Math.max(0,Math.min((M.Abyss.BOTTOM+1)*48-h,s.y-h*.52));
  const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#273f52');bg.addColorStop(1,'#071322');c.fillStyle=bg;c.fillRect(0,0,w,h);
  const surf=M.SURFACE*48-cam.y;if(surf>0){for(let layer=0;layer<3;layer++){c.fillStyle=['#527477','#426566','#304f50'][layer];c.beginPath();c.moveTo(0,surf);for(let x=0;x<=w+50;x+=50)c.lineTo(x,surf-30-layer*24-Math.sin(x*.009+cam.x*.002+layer)*22);c.lineTo(w,surf);c.fill();}}
  const fromX=Math.max(0,Math.floor(cam.x/48)),toX=Math.min(M.W-1,Math.ceil((cam.x+w)/48)),fromY=Math.max(0,Math.floor(cam.y/48)),toY=Math.min(M.H-1,Math.ceil((cam.y+h)/48));
  const air=[];
  for(let row=fromY;row<=toY;row++)for(let col=fromX;col<=toX;col++){
   const id=M.at(col,row),x=col*48-cam.x,y=row*48-cam.y,kind=s.cells[id];
   if(!s.seen[id]){rect(x,y,49,49,'#070e19');continue;}
   if(kind){rock(x,y,kind,col,row);if(s.damage?.[id])fracture(x,y,s.damage[id]);}else if(row>=M.SURFACE){rect(x,y,49,49,M.biomes[M.typeAt(row)].back);air.push([x,y]);for(let j=0;j<2;j++)line(x+2,y+13+j*22,x+46,y+16+j*22,'#d9e6d411');}
  }
  // Scenery can only be drawn in already exposed air: unopened caverns stay hidden.
  c.save();c.beginPath();for(const [x,y] of air)c.rect(x,y,49,49);c.clip();
  basinBackground(s,w,h,clock);
  for(const q of s.structures)if(Math.abs(q.x-cam.x-w/2)<w/2+q.rx&&Math.abs(q.y-cam.y-h/2)<h/2+250)roomScenery(s,q,clock);
  for(let j=0;j<24;j++){const xx=(j*193+Math.sin(clock*.3+j)*12)%w,yy=(j*137-clock*(4+j%3))%h;orb(xx,(yy+h)%h,1,'#d0e8de33');}c.restore();
  if(surf>-80&&surf<h){line(0,surf,w,surf,'#adc98d',4);const x=80.5*48-cam.x;rect(x-72,surf,144,8,'#8ca1a0',2);if(s.carryingProbe)glow(x,surf-37,155,'#d8f1b2');rect(x-62,surf-70,108,66,'#557378',6);rect(x-13,surf-46,25,45,'#1d3845',3);rect(x-56,surf-65,34,23,'#92c8b6',3);line(x-62,surf-70,x+46,surf-70,'#cad39c',7);txt('VELDSTATION',x-8,surf-81,11,'#d4e4be','center');}
  roomHazards(s,w,h,clock);basinCourse(s,w,h,clock);
  for(const p of s.portals)if(!p.used&&s.seen[M.at(Math.floor(p.x/48),Math.floor(p.y/48))])portal(p.x-cam.x,p.y-cam.y,p.tier===s.drill+1?M.drillColors[p.tier]:'#56647e',clock,false,p.tier===s.drill+1?'PROEF '+(p.id+1):'LATER');
  if(!s.carryingProbe&&s.seen[M.at(Math.floor(s.goal.x/48),Math.floor(s.goal.y/48))]){const x=s.goal.x-cam.x,y=s.goal.y-cam.y;glow(x,y,150,'#ffe4a3');rect(x-35,y-32,70,60,'#97a68f',10);rect(x-24,y-24,48,30,'#29465a',4);line(x-17,y-10,x-4,y-10,'#cdf2ce',2);line(x-4,y-10,x+2,y-19,'#cdf2ce',2);line(x+2,y-19,x+11,y,'#cdf2ce',2);line(x+11,y,x+18,y-10,'#cdf2ce',2);txt('MANTELSONDE',x,y-57,13,'#ffedb8','center');}
  const l=s.lava;
  if(l.fill.length){
   c.save();c.beginPath();let visible=false;
   for(const id of l.fill){const x=id%M.W*48-cam.x,y=Math.floor(id/M.W)*48-cam.y,top=Math.max(y,(l.surface??l.head)-cam.y),height=y+48-top;
    if(x< -48||x>w||y< -48||y>h||height<=0)continue;c.rect(x,top,48.5,height+.5);visible=true;
   }
   c.clip();if(visible){
    const surface=(l.surface??l.head)-cam.y,g=c.createLinearGradient(0,surface,0,surface+330);g.addColorStop(0,'#fff1a0');g.addColorStop(.035,'#ffb354');g.addColorStop(.18,'#ee663d');g.addColorStop(.7,'#c43440');g.addColorStop(1,'#76283f');rect(0,Math.max(0,surface),w,h,g);
    glow(w*.2,surface,150,'#ffbb62');glow(w*.8,surface,150,'#ffbb62');
    for(let j=0;j<5;j++){const y=surface+18+j*48;c.strokeStyle=j%2?'#ffbb683b':'#702c4144';c.lineWidth=2+j%2;c.beginPath();for(let x=0;x<=w+12;x+=12){const yy=y+Math.sin((x+cam.x)*.025+clock*(j%2?1:-1)*1.4+j)*6;if(x)c.lineTo(x,yy);else c.moveTo(x,yy);}c.stroke();}
    c.strokeStyle='#fff4b5';c.lineWidth=2.5;c.beginPath();for(let x=0;x<=w+8;x+=8){const y=surface+2+Math.sin((x+cam.x)*.06+clock*2)*1.6;if(x)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();
    if(!reduced)for(let j=0;j<24;j++){const x=(j*127+clock*12)%w,y=surface+22+(j*61-clock*29+2000)%220;orb(x,y,1.5+j%3,'#ffcf8066');}
   }c.restore();
  }
  if(l.phase==='warning'){const y=l.base-cam.y;if(y>=0&&y<h){c.setLineDash([9,8]);line(0,y-2,w,y-2,'#ffbf9188',2);c.setLineDash([]);}}
  // The transparent shield is in front of the same lava backdrop, never a dry barrier.
  coolingFields(s,w,h,clock);
  if(aim&&aim.x>=0&&aim.x<M.W&&aim.y>=0&&aim.y<M.H&&s.seen[M.at(aim.x,aim.y)]){const check=M.canMine(s,aim.x,aim.y),x=aim.x*48-cam.x,y=aim.y*48-cam.y,id=M.at(aim.x,aim.y);if(s.cells[id]){c.strokeStyle=check.ok?(check.seconds>4?'#e8c38a':'#a6f5dd'):'#ff9e86';c.lineWidth=3;c.strokeRect(x+2,y+2,44,44);if(s.damage?.[id]){rect(x+5,y+39,38,4,'#132332',1);rect(x+5,y+39,38*s.damage[id],4,'#ecffc0',1);}}}
  laser(s,clock);
  if(!s.respawn){octopus(s.x-cam.x,s.y-cam.y,s.vx,s.grounded,clock,s.invulnerable>0&&Math.sin(clock*12)>0,s.drill,beam.active);
   if(s.carryingProbe){const x=s.x-cam.x-24,y=s.y-cam.y-29;glow(x,y,32,'#f7e7a3');rect(x-6,y-8,12,16,'#e5d594',3);rect(x-3,y-4,6,8,'#7fdcc6',2);}
  }
 }
 function trial(t,w,h,clock){
  cam.x=Math.max(0,Math.min(Math.max(0,t.width-w),t.x-w*.42));cam.y=Math.max(0,Math.min(Math.max(0,t.height-h),t.y-h*.64));
  const th=M.Trials.themes[t.id],bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,th.sky);bg.addColorStop(1,th.dark);c.fillStyle=bg;c.fillRect(0,0,w,h);
  // Three parallax strata, a distinct silhouette and colour vocabulary for every trial.
  for(let layer=0;layer<3;layer++){c.fillStyle=th.color+['0b','12','14'][layer];c.beginPath();c.moveTo(0,h);for(let x=-80;x<=w+100;x+=80){const v=(x+cam.x*(.15+layer*.12))*.012;c.lineTo(x,h*.18+layer*h*.2+Math.sin(v+layer*2)*70);}c.lineTo(w,h);c.fill();}
  if(th.kind==='bones'){for(let j=0;j<22;j++){const x=j*150-cam.x*.6;fossil(x,h*.4+Math.sin(j)*70,54,th.color+'20');}}
  else if(['crystal','magnet'].includes(th.kind)){for(let j=0;j<24;j++)crystal(j*190-cam.x*.4,h*.8-(j%3)*100,130+(j%3)*70,th.color+'26',Math.sin(j)*.6);}
  else if(th.kind==='roots'){for(let j=0;j<30;j++){const x=j*160-cam.x*.7;c.strokeStyle=th.color+'22';c.lineWidth=9;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+90,h*.2,x-50,h*.35,x+30,h*.65);c.stroke();}}
  else if(th.kind==='steam'){for(let j=0;j<14;j++){const x=j*130-cam.x*.5,y=(j*170-cam.y*.5)%h;glow(x,y,90,th.color);}}
  else if(th.kind==='ice'){for(let j=0;j<20;j++)crystal(j*105-cam.x*.6,-20,-100-(j%4)*44,th.color+'30',.04);}
  else{for(let j=0;j<30;j++){const x=j*125-cam.x*.5;rect(x,h*.18+(j%4)*44,50,h,th.color+'14',7);line(x+7,h*.18+(j%4)*44,x+7,h,th.color+'22',2);}}
  for(let j=0;j<30;j++)orb((j*157+Math.sin(clock*.2+j)*12-cam.x*.1+w*30)%w,(j*131-clock*(th.kind==='ice'?-14:9)+h*100)%h,1+j%2,th.color+'44');
  const floor=t.height+12-cam.y;const lava=c.createLinearGradient(0,floor-70,0,floor+50);lava.addColorStop(0,th.color+'00');lava.addColorStop(.75,t.id<2?'#63a6a866':t.id===5?'#b1e7ee66':t.id===2||t.id===6?'#bb8ddd66':'#f18a6a88');lava.addColorStop(1,t.id<2?'#2f767b':t.id===5?'#487ca1':t.id===2||t.id===6?'#745787':'#cf4751');rect(0,floor-70,w,150,lava);
  for(const p of t.platforms){if(p.broken)continue;const x=p.x-cam.x,y=p.y-cam.y;if(x+p.w<0||x>w||y< -80||y>h+50)continue;const bone=p.kind==='bone',fragile=p.kind==='fragile',ice=p.kind==='ice';
   rect(x,y,p.w,p.h,bone?'#bcaa8d':ice?'#92bed6':th.dark,6);rect(x,y,p.w,4,fragile?'#deb77f':bone?'#f2deb1':th.color,2);rect(x+4,y+15,p.w-8,5,'#080f2655',3);
   if(bone){for(let j=12;j<p.w;j+=24){orb(x+j,y+10,7,'#dbc9a6');line(x+j,y+6,x+j,y+14,'#8d7969',1);}}
   else if(fragile){const count=3+Math.floor(p.crack*8);for(let j=0;j<count;j++){const xx=x+10+j*(p.w-18)/count;line(xx,y+4,xx+5,y+10,'#171a2a',2);line(xx+5,y+10,xx-1,y+18,'#171a2a',2);}if(p.crack>0)rect(x,y-7,p.w*Math.max(0,1-p.crack/(t.id<4?1.25:1.05)),3,'#ffd49d',1);}
   else if(ice){for(let j=12;j<p.w;j+=22)line(x+j,y+3,x+j-8,y+14,'#ebfaff88');}
   else{for(let j=10;j<p.w;j+=30)orb(x+j,y+10,1.6,th.color+'88');}
   if(p.kind==='moving'){for(let j=0;j<3;j++){const xx=x+p.w/2-14+j*14;line(xx,y+8,xx+4,y+12,th.color,1.5);line(xx+4,y+12,xx,y+16,th.color,1.5);}glow(x+p.w/2,y+20,33,th.color);}
  }
  for(const relay of t.relays){const p=t.platforms[relay.platform],x=p.x+p.w*.32-cam.x,y=p.y-26-cam.y;glow(x,y,relay.on?45:26,relay.on?'#bdf1b2':th.color);rect(x-12,y+4,24,21,'#455668',5);crystal(x,y+5,27,relay.on?'#c5f1b7':th.color,0);if(relay.on)txt('✓',x,y-32,14,'#d8ffd2','center');else{c.strokeStyle=th.color;c.lineWidth=1.5;c.beginPath();c.arc(x,y,22,0,7);c.stroke();}}
  for(const z of t.hazards){const q=M.Trials.hazard(t,z),x=q.x-cam.x,y=q.y-cam.y;rect(x-13,y-4,26,7,'#858d9a',3);if(q.state==='quiet'){orb(x,y-6,3,'#b6e6c0');continue;}
   if(q.state==='warning'){c.setLineDash([5,7]);line(x,y-8,x,y-q.height,th.color+'88',2);c.setLineDash([]);glow(x,y-12,22,th.color);txt('!',x,y-q.height-8,18,'#ffdda2','center');}
   else{glow(x,y-q.height/2,70,z.kind==='vent'?'#b5eced':'#ff859e');line(x,y-4,x,y-q.height,z.kind==='vent'?'#d3f5ee66':'#ff789daa',q.width+7);line(x,y-4,x,y-q.height,z.kind==='vent'?'#f4ffffaa':'#ffe5f0',q.width*.45);for(let j=0;j<5;j++)orb(x+Math.sin(j+clock*5)*10,y-(clock*120+j*24)%q.height,3,th.color+'aa');}
  }
  for(const r of t.rocks){const x=r.x-cam.x;if(r.warn>0){c.setLineDash([4,8]);line(x,102,x,h-20,'#ffc99288',1.5);c.setLineDash([]);txt('▼',x,122,22,'#ffcea0','center');}else if(t.id===5)crystal(x,r.y-cam.y-10,-28,'#def5ff',.04);else{orb(x,r.y-cam.y,r.r,'#bb8f8b');line(x-8,r.y-cam.y-5,x+3,r.y-cam.y+8,'#604b62',2);}}
  const ready=t.relays.every(q=>q.on);portal(t.goal.x-cam.x,t.goal.y-cam.y,ready?'#c8f3b6':'#6c8299',clock,false,ready?'UPGRADE':'SCHAKELAARS');
  octopus(t.x-cam.x,t.y-cam.y,t.vx,t.grounded,clock);
 }
 function hud(s,w,clock,aim){
  const compact=w<800;rect(10,10,w-20,88,'#0a1e2ceb',13);const target=M.objective(s),angle=Math.atan2(target.y-s.y,target.x-s.x);c.save();c.translate(52,34);c.strokeStyle='#668b91';c.lineWidth=1.5;c.beginPath();c.arc(0,0,18,0,Math.PI*2);c.stroke();c.rotate(angle);c.fillStyle='#eddd91';c.beginPath();c.moveTo(15,0);c.lineTo(-9,-7);c.lineTo(-5,0);c.lineTo(-9,7);c.closePath();c.fill();c.restore();txt('POGING '+(s.deaths+1),24,58,10,'#a4c3c7');
  if(s.trial){const th=M.Trials.themes[s.trial.id];txt('PROEF '+(s.trial.id+1)+' / 8',122,37,compact?17:19,th.color);txt(th.short,w-24,37,compact?17:19,'#e4e8f0','right');txt(M.objective(s).text,122,63,compact?15:17);s.trial.relays.forEach((q,j)=>orb(30+j*22,82,5,q.on?'#c5efb2':'#53667d'));txt('Lopen + springen · straal uit',w-25,86,13,'#a6c1cd','right');}
  else{const depth=Math.floor(Math.max(0,Math.min(M.GOAL_DEPTH,(s.y/48-M.SURFACE)*5))),goal=M.objective(s),dx=goal.x-s.x,dy=goal.y-s.y,arrow=Math.abs(dx)>Math.abs(dy)*.7?(dx<0?'←':'→'):dy<0?'↑':'↓';txt('DIEPTE '+depth+' / '+M.GOAL_DEPTH+' m',122,37,compact?17:20);txt(M.drillNames[s.drill]+' · '+s.drill,w-25,37,compact?16:19,M.drillColors[s.drill],'right');txt((s.drill<9&&!s.carryingProbe?'AFSTAND TOT PROEF: '+Math.ceil(Math.hypot(dx,dy)/48)+' blokken · proef '+s.drill:goal.text),122,62,compact?13:16,s.carryingProbe?'#f9e9a9':'#e6f0e3');txt(s.y>=M.Abyss.TOP*48?'Het Mantelbassin':M.regions[M.regionAt(Math.floor(s.y/48))].name,24,84,13,'#a8c5c8');let label=M.Abyss.nearLadder(s)?'↑ vasthouden · klimmen':'Bereik 5 blokken';if(aim&&aim.x>=0&&aim.x<M.W&&aim.y>=0&&aim.y<M.H){const kind=s.cells[M.at(aim.x,aim.y)];if(kind&&kind!==7&&s.seen[M.at(aim.x,aim.y)]){const check=M.canMine(s,aim.x,aim.y);label=M.rocks[kind-1].name+(check.ok?' · '+(check.progress>0?'nog ':'')+Math.max(.1,check.remaining).toFixed(1).replace('.',',')+' s':' · buiten bereik');}}txt(label,w-25,84,13,'#a8c5c8','right');}
 }
 function victory(s,w,h,time){
  const t=reduced?3:time,fade=Math.min(1,time*1.5),ground=h*.72,mid=w*.5;
  c.save();c.globalAlpha=fade;
  const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#071d30');sky.addColorStop(.7,'#276371');sky.addColorStop(1,'#153647');rect(0,0,w,h,sky);
  const shades=['#355364','#3d5062','#584451','#623b45'];for(let j=0;j<4;j++){rect(0,ground+j*h*.07,w,h*.08,shades[j]);line(0,ground+j*h*.07,w,ground+j*h*.07,'#b0c6bd24',2);}
  glow(mid,ground-100,60+Math.min(t,3)*95,'#bfeacc');
  for(let j=0;j<3;j++){c.fillStyle=['#345864','#264958','#193b4b'][j];c.beginPath();c.moveTo(0,ground);for(let x=0;x<=w+60;x+=60)c.lineTo(x,ground-32-j*22-Math.sin(x*.008+j)*25);c.lineTo(w,ground);c.fill();}
  line(0,ground,w,ground,'#b6d2a4',4);
  const stationX=mid+75;rect(stationX-44,ground-103,148,102,'#71908c',9);rect(stationX-52,ground-115,164,16,'#c5cea4',4);rect(stationX+30,ground-68,36,66,'#163442',4);rect(stationX-30,ground-94,46,37,'#b9f0dc',5);line(stationX-22,ground-85,stationX+8,ground-61,'#eaffef88',2);txt('VELDSTATION',stationX+32,ground-138,12,'#d0e6d9','center');
  c.save();c.translate(mid-95,ground+(reduced?0:Math.sin(t*3)*3));c.scale(2.1,2.1);octopus(0,0,0,true,t,false,9);c.restore();
  const fly=Math.min(1,Math.max(0,(t-.8)/2)),px=mid-44+fly*141,py=ground-60-Math.sin(fly*Math.PI)*100;glow(px,py,55,'#ffeca7');rect(px-11,py-17,22,34,'#e3d6a5',5);rect(px-6,py-10,12,17,'#87edce',3);
  if(t>2.8){const spread=Math.min(1,(t-2.8)/1.4);for(let j=0;j<(reduced?12:38);j++){const a=j*2.399,r=(50+(j%7)*32)*spread,x=mid+Math.cos(a)*r,y=ground-115+Math.sin(a)*r*.65;orb(x,y,1.4+j%3,['#d3eeb2','#f5d4a1','#8fdedb'][j%3]);}c.globalAlpha=fade*Math.min(1,t-2.8);txt('EXPEDITIE VOLTOOID',mid,h*.18,w<800?28:34,'#e4f4d9','center');txt('Het Mantelbassin bereikt. Veilig terug aan het oppervlak.',mid,h*.18+36,w<800?16:20,'#bcd8d7','center');}
  else{txt('THUISKOMST',mid,h*.18,w<800?28:34,'#e4f4d9','center');txt('De mantelsonde bereikt het veldstation.',mid,h*.18+36,w<800?16:20,'#bcd8d7','center');}
  c.restore();
 }
 function draw(s,w,h,clock,info={}){
  const aim=info.aim;updateLaser(s,!!info.playing);if(s.trial)trial(s.trial,w,h,clock);else mine(s,w,h,clock,aim);
  for(const p of info.particles||[]){c.globalAlpha=Math.max(0,p.life);rect(p.x-cam.x,p.y-cam.y,3,3,p.color);}c.globalAlpha=1;
  hud(s,w,clock,aim);
  if(!s.trial&&!s.respawn&&s.lava.phase!=='quiet'){
   const l=s.lava,safe=M.Caverns.sheltered(s),q=M.Caverns.nearest(s),dx=q?(q.via?.x??q.x)-s.x:0,dy=q?(q.via?.y??q.y)-s.y:0,arrow=Math.abs(dy)>70?(dy<0?'↑':'↓'):dx<0?'←':'→',level=Math.max(0,Math.round((l.head/48-M.SURFACE)*5));
   const direction=q?arrow+' koelnis '+q.distance+' blokken':'zoek een hogere gang';
   const label=safe?'KOELVELD · jij bent beschermd · lavapeil '+level+' m':l.phase==='warning'?'LAVADRUK · '+Math.ceil(Math.max(0,l.warning-l.time))+' s · '+direction:l.phase==='rising'?'LAVA STIJGT · peil '+level+' m · '+direction:'LAVA ZAKT · peil '+level+' m';
   rect(10,107,w-20,35,safe?'#174c50ee':'#682a3dea',10);txt(label,w/2,131,w<800?14:17,safe?'#bdfbea':'#ffe0b3','center');
  }
  if(info.toastLeft>0){const words=(info.toast||'').split(' '),lines=[''];c.font='500 15px system-ui, sans-serif';for(const word of words){const i=lines.length-1;if(c.measureText(lines[i]+word).width>w-70)lines.push(word+' ');else lines[i]+=word+' ';}rect(15,h-77,w-30,63,'#0d2335eb',12);lines.slice(0,2).forEach((v,j)=>txt(v.trim(),w/2,h-53+j*21,15,'#e3eedb','center'));}
  if(s.transition>0){const v=s.transition/1.05,alpha=Math.sin(v*Math.PI)*.82;rect(0,0,w,h,'rgba(8,14,31,'+alpha+')');c.save();c.translate(w/2,h/2);const color=s.trial?M.Trials.themes[s.trial.id].color:M.drillColors[s.drill];for(let j=0;j<10;j++){c.strokeStyle=color+Math.floor(alpha*200).toString(16).padStart(2,'0');c.lineWidth=2+j%3;c.beginPath();const r=30+(j*43+(1-v)*380)%Math.max(w,h);c.ellipse(0,0,r,r*.6,clock*.8+j*.16,0,7);c.stroke();}c.restore();}
  if(s.respawn>0){rect(0,0,w,h,'#0b152cd9');txt('Terug naar de oppervlakte',w/2,h*.45,w<800?26:32,'#e9e7ec','center');txt('Poging '+(s.deaths+1)+' · onbeperkte pogingen',w/2,h*.45+39,21,'#bce5d8','center');txt('Mijnhoed en tunnels blijven behouden',w/2,h*.45+70,16,'#aac6cb','center');}
  if(info.victoryTime!==undefined)victory(s,w,h,info.victoryTime);
  return cam;
 }
 return {draw,laserOrigin,getLaser:()=>beam,reset:()=>{beam.active=false;beam.target=-1;},octopus};
}
return {create};
})();
if(typeof module!=='undefined')module.exports=DrillArt;
