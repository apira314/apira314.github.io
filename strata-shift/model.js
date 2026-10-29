'use strict';
const StrataModel=(()=>{
 const W=5,H=10,points={sand:10,clay:15,marble:100},fossilNames=['Ammoniet','Trilobiet','Bladfossiel','Dinosaurusbot','Schelpfossiel'];
 function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
 // No speed floor: each completed row increases pressure, even late in a run.
 function riseInterval(s){return 4.5/(1+s.rows/18);}
 function riseProgress(s){return Math.min(1,s.rise/riseInterval(s));}
 function rock(s){const n=random(s),basalt=Math.min(.10,.035+s.rows*.0012);return{type:n<basalt?'basalt':n<.53?'clay':'sand',id:++s.serial};}
 function row(s){const a=[];for(let x=0;x<W;x++){let b=rock(s);if(x>=2&&a[x-1].type===b.type&&a[x-2].type===b.type)b={...b,type:b.type==='sand'?'clay':'sand'};a.push(b);}return a;}
 function initial(seed=Date.now()>>>0){const s={seed,serial:0,grid:Array(W*H).fill(null),elapsed:0,rise:0,freeze:0,score:0,fossils:0,museum:{},water:2,hammers:3,matches:0,combo:0,multiplier:1,boostTime:0,ended:false,events:[],rows:0};for(let y=H-4;y<H;y++)s.grid.splice(y*W,W,...row(s));return s;}
 function emit(s,type,data={}){s.events.push({type,...data});}
 function gain(s,n){s.score+=Math.round(n*s.multiplier);}
 function clear(s,i,chain=1){const b=s.grid[i];if(!b)return;s.grid[i]=null;emit(s,'break',{i,kind:b.type});gain(s,(points[b.type]||0)*chain);if(b.type==='clay'&&random(s)<.25){s.grid[i]={type:'fossil',id:++s.serial,fossil:Math.floor(random(s)*fossilNames.length)};emit(s,'discover',{i});}}
 function gravity(s){let changed=false;for(let x=0;x<W;x++){for(let y=H-1;y>=0;y--){const i=y*W+x,b=s.grid[i];if(!b)continue;let to=y;while(to<H-1&&!s.grid[(to+1)*W+x])to++;if(to!==y){s.grid[to*W+x]=b;s.grid[i]=null;emit(s,'fall',{from:i,to:to*W+x});changed=true;}}
 const i=(H-1)*W+x,b=s.grid[i];if(b?.type==='fossil'){s.grid[i]=null;s.fossils++;s.museum[b.fossil]=(s.museum[b.fossil]||0)+1;gain(s,500);emit(s,'fossil',{i,fossil:b.fossil});changed=true;}}
 return changed;}
 function resolve(s){let chain=0;for(let cycle=0;cycle<60;cycle++){const moved=gravity(s),matches=new Set();for(let y=0;y<H;y++)for(let x=0;x<W-2;x++){const i=y*W+x,t=s.grid[i]?.type;if(!points[t])continue;let end=x+1;while(end<W&&s.grid[y*W+end]?.type===t)end++;if(end-x>=3){for(let xx=x;xx<end;xx++)matches.add(y*W+xx);x=end-1;}}
 if(!matches.size){if(moved)continue;break;}chain++;const magma=[];for(const i of matches)if(s.grid[i]?.type==='marble')magma.push(i);for(const i of matches)clear(s,i,chain);for(const i of magma)for(const d of [-W,W,-1,1]){const at=i+d;if(at<0||at>=W*H||Math.abs(d)===1&&Math.floor(at/W)!==Math.floor(i/W))continue;if(s.grid[at]?.type==='basalt')clear(s,at);}
 s.matches++;if(s.matches%4===0){s.water=Math.min(3,s.water+1);s.hammers=Math.min(4,s.hammers+1);emit(s,'supply');}s.rise=Math.max(0,s.rise-riseInterval(s)/9);emit(s,'match',{count:matches.size,chain,marble:magma.length>0});}
 s.combo=chain;return chain;}
 function canSwap(s,i,dir){if(s.ended||!Number.isInteger(i)||i<0||i>=W*H||![1,-1].includes(dir))return false;const x=i%W,j=i+dir;return x+dir>=0&&x+dir<W&&!!s.grid[i]&&s.grid[i].type!=='basalt'&&s.grid[j]?.type!=='basalt';}
 function swap(s,i,dir){if(!canSwap(s,i,dir))return false;const j=i+dir;[s.grid[i],s.grid[j]]=[s.grid[j],s.grid[i]];emit(s,'slide',{from:i,to:j});resolve(s);return true;}
 function partner(s,i){if(s.ended||!Number.isInteger(i)||i<0||i>=W*H||!['sand','clay'].includes(s.grid[i]?.type))return -1;return [i-W,i+W].find(k=>k>=0&&k<W*H&&s.grid[k]?.type===s.grid[i].type)??-1;}
 function compress(s,i,other){if(s.ended||!Number.isInteger(i)||i<0||i>=W*H)return false;const a=s.grid[i];if(!a||!['sand','clay'].includes(a.type))return false;let j=other;if(j===undefined||j===i)j=partner(s,i);if(j===undefined||Math.abs(j-i)!==W||s.grid[j]?.type!==a.type)return false;
 if(a.type==='sand'){s.grid[i]=null;s.grid[j]=null;s.grid[Math.max(i,j)]={type:'marble',id:++s.serial};gain(s,100);s.multiplier=Math.min(4,s.multiplier+1);s.boostTime=8;emit(s,'compress',{i:Math.max(i,j),kind:'marble'});}else{clear(s,i);clear(s,j);emit(s,'compress',{i,kind:'clay'});}resolve(s);return true;}
 function water(s){if(s.ended||s.water<=0)return false;s.water--;s.freeze=Math.min(16,s.freeze+8);emit(s,'water');return true;}
 function hammer(s,i){if(s.ended||s.hammers<=0||!Number.isInteger(i)||i<0||i>=W*H||!s.grid[i]||s.grid[i].type==='fossil')return false;s.hammers--;clear(s,i);emit(s,'hammer',{i});resolve(s);return true;}
 function step(s,dt){if(s.ended||!Number.isFinite(dt)||dt<=0)return;dt=Math.min(dt,.1);s.elapsed+=dt;s.boostTime=Math.max(0,s.boostTime-dt);if(s.boostTime===0)s.multiplier=1;const cooling=Math.min(dt,s.freeze);s.freeze-=cooling;s.rise+=dt-cooling;
 // Consume every due row, so high speeds are not capped by the display refresh rate.
 while(s.rise>=riseInterval(s)-1e-9){s.rise=Math.max(0,s.rise-riseInterval(s));if(s.grid.slice(0,W).some(Boolean)){s.ended=true;emit(s,'over');return;}s.grid.splice(0,W);s.grid.push(...row(s));s.rows++;emit(s,'rise');resolve(s);}}
 function pressure(s){const y=s.grid.findIndex(Boolean);return y<0?0:Math.min(1,(H-Math.floor(y/W)+riseProgress(s))/H);}
 return{W,H,points,fossilNames,initial,canSwap,swap,partner,compress,water,hammer,step,resolve,pressure,riseInterval,riseProgress};
})();
if(typeof module!=='undefined')module.exports=StrataModel;
