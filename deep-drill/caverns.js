'use strict';
// Compact, sealed chambers. Only the player excavates the routes between them.
const DrillCaverns=(()=>{
 const shields=new WeakMap(),escapes=new WeakMap();
 function build({C,W,H,SURFACE,seed,cells,regions,hash}){
  const structures=[],portals=[],refuges=[],hazards=[],at=(x,y)=>y*W+x;
  const floors=regions.map((r,i)=>26+i*14),columns=[12,31,50,69,88,107,126,145],portalRooms=[4,2,6];
  for(let region=0;region<regions.length;region++)for(let j=0;j<columns.length;j++){
   const area=regions[region],cx=columns[j]+hash(j+8,region+3,seed)%5-2;
   const floor=floors[region]+hash(j+19,region+7,seed)%3-1,rx=4+hash(j,region,seed)%2,height=5+hash(region,j+41,seed)%2,shape=hash(j+42,region,seed)%4;
   const profile=[],roomCells=[];
   // One contiguous air span per column: an organic outline, never floating rock islands.
   for(let dx=-rx;dx<=rx;dx++){
    const edge=Math.abs(dx)/rx,bottom=floor-(Math.abs(dx)===rx?1:0);
    const dome=Math.sqrt(Math.max(.1,1-(dx/(rx+.7))**2));
    const irregular=dx===0?0:(hash(cx+dx,floor,seed)%3-1)*.35;
    const lobe=shape===1?Math.sin((dx+rx)*.8)*.6:shape===2?dx/rx*.6:shape===3?Math.cos(dx*.9)*.5:0;
    const top=Math.max(floor-6,bottom-Math.max(2,Math.round(height*dome+irregular+lobe)));
    const col=cx+dx;profile.push({col,top,bottom});
    for(let y=top;y<bottom;y++){const id=at(col,y);cells[id]=0;roomCells.push(id);}
   }
   const top=Math.min(...profile.map(q=>q.top)),q={x:(cx+.5)*C,y:(top+floor)*C/2,cx,top,kind:area.kind,region,rx:(rx+.5)*C,ry:(floor-top)*C/2,variant:area.variant,detail:j,shape,floor,profile,roomCells};
   structures.push(q);
   const lane=portalRooms.indexOf(j),isPortal=region%2===0&&lane>=0;
   if(isPortal){const id=region/2;portals.push({key:id+':'+lane,id,tier:id+2,used:false,x:(cx+1.5)*C,y:floor*C-24,row:floor-3,region,room:structures.length-1});}
   // A few cool mineral pockets are flush with the natural floor, not raised platforms.
   if(isPortal||(j+region)%3===0){const col=cx-2;
    if([col-1,col,col+1].every(x=>profile.some(p=>p.col===x&&p.top<=floor-3&&p.bottom===floor)))refuges.push({col,floor,region,x:(col+.5)*C,y:floor*C,width:3*C,natural:true});
   }
   if(region>=2&&j%2===1){const col=cx+2,span=profile.find(p=>p.col===col),kind=['stone','steam','resonance'][(region+j)%3];
    hazards.push({id:hazards.length,kind,x:(col+.5)*C,y:floor*C,region,clock:0,near:false,period:8.7-region*.14,warn:Math.max(1.25,2-region*.04),active:kind==='stone'?1.3:1.55,fallHeight:Math.min(150,(floor-span.top)*C-18),core:at(col,floor),disabled:false});
   }
  }
  // Preserve stable portal ordering for saves, trials and duplicate entrance groups.
  portals.sort((a,b)=>Number(a.key.split(':')[1])-Number(b.key.split(':')[1])||a.id-b.id);
  return {structures,portals,refuges,hazards,floors,routes:[],plugs:[],walkways:[],stairsLinks:[],infrastructure:[]};
 }
 function tread(s,col,row){
  // The field station and the top rung of the final ladder are the only fixed supports.
  return row===6&&col>=79&&col<=81||(s.routes||[]).some(r=>r.ladderCap&&r.floor===row&&r.col===col);
 }
 function prepareReturn(s){s.walkways=[];}
 function protectedCell(s,col,row){
  let cached=shields.get(s);if(!cached||cached.source!==s.refuges){const cells=new Set();for(const q of s.refuges||[])for(let y=q.floor-3;y<q.floor;y++)for(let x=q.col-1;x<=q.col+1;x++)cells.add(y*160+x);cached={source:s.refuges,cells};shields.set(s,cached);}
  return cached.cells.has(row*160+col);
 }
 function sheltered(s,C=48){return protectedCell(s,Math.floor((s.x-10)/C),Math.floor((s.y-2)/C))&&protectedCell(s,Math.floor((s.x+10)/C),Math.floor((s.y-32)/C));}
 function nearest(s,C=48){
  const px=Math.floor(s.x/C),py=Math.floor((s.y-17)/C),start=py*160+px,previous=escapes.get(s);
  if(previous?.cell===start&&previous.revision===s.revision)return previous.result;
  const targets=new Map((s.refuges||[]).map(q=>[(q.floor-1)*160+q.col,q]));
  const visited=new Set(),queue=[{i:start,d:0,via:null}];let result=null;
  for(let head=0;head<queue.length;head++){
   const n=queue[head],x=n.i%160,y=Math.floor(n.i/160);if(visited.has(n.i)||s.cells[n.i]||Math.abs(x-px)>32||Math.abs(y-py)>16)continue;visited.add(n.i);
   if(targets.has(n.i)){result={...targets.get(n.i),distance:n.d,via:n.via};break;}
   for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])if(x+dx>0&&x+dx<159&&y+dy>=0&&y+dy<Math.floor(s.cells.length/160)-1)queue.push({i:(y+dy)*160+x+dx,d:n.d+1,via:n.via||{x:(x+dx+.5)*C,y:(y+dy+1)*C}});
  }
  escapes.set(s,{cell:start,revision:s.revision,result});return result;
 }
 function hazard(s,h){
  if(h.disabled||!h.near)return {state:'quiet',progress:0};
  const t=h.clock%h.period;
  if(t<h.warn)return {state:'warning',progress:t/h.warn};
  if(t<h.warn+h.active)return {state:'active',progress:(t-h.warn)/h.active};
  return {state:'quiet',progress:0};
 }
 function update(s,dt,die,emit,C=48){
  for(const h of s.hazards||[]){
   if(h.disabled)continue;
   if(!s.cells[h.core]){h.disabled=true;emit(s,'disarm','Doorgang veilig.',{x:h.x,y:h.y});continue;}
   const near=Math.abs(s.x-h.x)<C*8&&Math.abs(s.y-h.y)<C*3;
   if(!near){h.near=false;h.clock=0;continue;}
   if(!h.near){h.near=true;h.clock=0;emit(s,'cave-warning','',{kind:h.kind});}const before=h.clock;h.clock+=dt;
   if(Math.floor(before/h.period)!==Math.floor(h.clock/h.period))emit(s,'cave-warning','',{kind:h.kind});
   const q=hazard(s,h);if(q.state!=='active')continue;
   const x=h.x,y=h.kind==='stone'?h.y-(h.fallHeight||150)+q.progress*((h.fallHeight||150)+30):h.y;
   const collision=h.kind==='stone'?Math.abs(s.x-x)<25&&s.y>y-16&&s.y-34<y+16:Math.abs(s.x-x)<21&&s.y>y-65&&s.y-34<y;
   if(collision){die(s,h.kind==='stone'?'Een vallend gesteente heeft je geraakt.':h.kind==='steam'?'De hete stoom heeft je geraakt.':'De kristalontlading heeft je geraakt.');return;}
  }
 }
 return {build,tread,prepareReturn,protectedCell,sheltered,nearest,hazard,update};
})();
if(typeof module!=='undefined')module.exports=DrillCaverns;
