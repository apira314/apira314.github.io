/* Shared visitor statistics; advertising features stay disabled. */
(()=>{
 'use strict';
 if(window.PiraAnalyticsLoaded)return;window.PiraAnalyticsLoaded=true;
 const ID='G-LZW0SYHSNE',KEY='pira.analytics.consent.v1';
 let loaded=false,choice=null;
 try{choice=localStorage.getItem(KEY);}catch{}
 function start(){
  window['ga-disable-'+ID]=false;
  gtag('consent','update',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  if(loaded)return;loaded=true;
  const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+ID;tag.id='google-analytics-tag';document.head.appendChild(tag);
  gtag('config',ID,{allow_google_signals:false,allow_ad_personalization_signals:false});
 }
 function stop(){
  window['ga-disable-'+ID]=true;gtag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  const host=location.hostname.split('.');
  for(const item of document.cookie.split(';')){const name=item.split('=')[0].trim();if(!/^_ga(?:_|$)/.test(name))continue;
   document.cookie=name+'=; Max-Age=0; path=/';for(let i=0;i<host.length-1;i++)document.cookie=name+'=; Max-Age=0; path=/; domain=.'+host.slice(i).join('.');
  }
 }
 const details=document.createElement('details');details.className='analytics-privacy';
 const summary=document.createElement('summary');summary.textContent='Bezoekersstatistieken';details.appendChild(summary);
 const info=document.createElement('p');info.textContent='Deze site gebruikt Google Analytics met cookies voor bezoekersstatistieken. Advertentiefuncties staan uit. Je kunt de meting hier uitschakelen; je spelvoortgang blijft bewaard.';details.appendChild(info);
 const status=document.createElement('p');status.className='analytics-status';status.setAttribute('role','status');details.appendChild(status);
 const toggle=document.createElement('button');toggle.type='button';toggle.id='analytics-toggle';details.appendChild(toggle);
 const privacy=document.createElement('a');privacy.href='https://policies.google.com/privacy';privacy.target='_blank';privacy.rel='noopener noreferrer';privacy.textContent='Privacybeleid van Google';details.appendChild(privacy);
 (document.querySelector('footer')||document.body).appendChild(details);
 function apply(){const enabled=choice!=='denied';enabled?start():stop();status.textContent='Statistiekmeting: '+(enabled?'aan':'uit');toggle.textContent=enabled?'Statistieken uitschakelen':'Statistieken inschakelen';}
 toggle.addEventListener('click',()=>{choice=choice==='denied'?'granted':'denied';try{localStorage.setItem(KEY,choice);}catch{}apply();});
 // An existing refusal remains respected. No banner for new visitors.
 apply();
 addEventListener('storage',e=>{if(e.key===KEY||e.key===null){choice=e.key===KEY?e.newValue:null;apply();}});
})();
