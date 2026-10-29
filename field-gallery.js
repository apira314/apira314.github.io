'use strict';
(()=>{
 const track=document.getElementById('field-slides');if(!track)return;
 const slides=[...track.querySelectorAll('figure')],prev=document.getElementById('field-prev'),next=document.getElementById('field-next'),count=document.getElementById('field-count');
 let index=0,pending=false;
 slides.forEach((slide,i)=>{slide.setAttribute('role','group');slide.setAttribute('aria-roledescription','dia');slide.setAttribute('aria-label',`${i+1} van ${slides.length}`);});
 function sync(){pending=false;index=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/Math.max(1,track.clientWidth))));count.textContent=`${index+1} / ${slides.length}`;slides.forEach((slide,i)=>{if(i!==index)slide.querySelectorAll("video").forEach(v=>v.pause());});prev.disabled=index===0;next.disabled=index===slides.length-1;}
 function go(delta){const target=Math.max(0,Math.min(slides.length-1,index+delta));track.scrollTo({left:target*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 prev.addEventListener('click',()=>go(-1));next.addEventListener('click',()=>go(1));
 track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();go(e.key==='ArrowLeft'?-1:1);}});
 track.addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(sync);}},{passive:true});
 let width=track.clientWidth;
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(track.clientWidth!==width){width=track.clientWidth;track.scrollTo({left:index*width,behavior:'instant'});sync();}}).observe(track);
 sync();
})();
