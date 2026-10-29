/* Layout follows the viewport. Touch remains available on landscape phones. */
(()=>{'use strict';
 const wide=matchMedia('(min-width: 768px)'),coarse=matchMedia('(any-pointer: coarse)');
 function apply(){const next=wide.matches?'desktop':'phone',touch=next==='phone'||coarse.matches||(navigator.maxTouchPoints||0)>0,changed=window.PiraDevice!==next||window.PiraTouch!==touch;
 window.PiraDevice=next;window.PiraTouch=touch;window.PiraDevicePending=false;document.documentElement.dataset.device=next;document.documentElement.dataset.touch=String(touch);
 if(changed)dispatchEvent(new Event('pira-device-change'));}
 for(const query of [wide,coarse]){if(query.addEventListener)query.addEventListener('change',apply);else query.addListener?.(apply);}addEventListener('resize',apply);apply();
})();
