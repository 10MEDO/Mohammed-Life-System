/* Mohammed Life System — Google Calendar integration (static GitHub Pages safe)
   Uses Google Identity Services token model. No password or client secret is stored.
*/
(() => {
  'use strict';
  const KEY='mls-google-calendar-v1';
  const SCOPE='https://www.googleapis.com/auth/calendar.events';
  let tokenClient=null, accessToken=null, gisPromise=null;
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
  const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
  const lang=()=>{try{return JSON.parse(localStorage.getItem('mls-v3')||'{}').lang==='ar'}catch{return false}};
  const tr=(a,e)=>lang()?a:e;
  const esc=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const toast=m=>window.toast?window.toast(m):alert(m);

  function loadGIS(){
    if(window.google?.accounts?.oauth2)return Promise.resolve();
    if(gisPromise)return gisPromise;
    gisPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;s.defer=true;
      s.onload=resolve;s.onerror=()=>reject(new Error('Google Identity Services failed to load'));document.head.appendChild(s);
    });
    return gisPromise;
  }
  async function init(){
    const id=read().clientId;if(!id)throw new Error(tr('أدخل Google Client ID أولًا من الإعدادات.','Enter your Google Client ID in Settings first.'));
    await loadGIS();
    tokenClient=google.accounts.oauth2.initTokenClient({client_id:id,scope:SCOPE,callback:()=>{}});
  }
  async function connect(){
    try{
      await init();
      await new Promise((resolve,reject)=>{
        tokenClient.callback=r=>{if(r.error)return reject(new Error(r.error_description||r.error));accessToken=r.access_token;save({...read(),connected:true,connectedAt:new Date().toISOString()});resolve()};
        tokenClient.requestAccessToken({prompt:'consent'});
      });
      toast(tr('تم ربط Google Calendar بنجاح ✅','Google Calendar connected successfully ✅'));
      inject();
    }catch(e){console.error(e);toast('Google: '+e.message)}
  }
  function disconnect(){
    if(accessToken&&google?.accounts?.oauth2?.revoke)google.accounts.oauth2.revoke(accessToken,()=>{});
    accessToken=null;save({...read(),connected:false});toast(tr('تم فصل Google Calendar.','Google Calendar disconnected.'));inject();
  }
  async function token(){
    if(accessToken)return accessToken;
    await init();
    return new Promise((resolve,reject)=>{
      tokenClient.callback=r=>{if(r.error)return reject(new Error(r.error_description||r.error));accessToken=r.access_token;save({...read(),connected:true});resolve(accessToken)};
      tokenClient.requestAccessToken({prompt:''});
    });
  }
  async function api(path,opts={}){
    const t=await token();
    const r=await fetch('https://www.googleapis.com/calendar/v3'+path,{...opts,headers:{Authorization:'Bearer '+t,'Content-Type':'application/json',...(opts.headers||{})}});
    if(r.status===401){accessToken=null;throw new Error(tr('انتهت جلسة Google. أعد الربط.','Google session expired. Reconnect.'))}
    const txt=await r.text();let j={};try{j=txt?JSON.parse(txt):{}}catch{}
    if(!r.ok)throw new Error(j?.error?.message||`Google Calendar error ${r.status}`);return j;
  }
  function plus(h,m){const [hh,mm]=(h||'09:00').split(':').map(Number);const d=new Date(2000,0,1,hh||0,mm||0);d.setMinutes(d.getMinutes()+m);return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}
  async function createEvent(e){
    const date=e.date,time=e.time||'09:00',rem=Math.max(0,Number(e.reminderMinutes??read().reminderMinutes??10));
    const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'Africa/Cairo';
    return api('/calendars/primary/events',{method:'POST',body:JSON.stringify({summary:e.title,description:e.note||'Mohammed Life System',location:e.location||undefined,start:{dateTime:`${date}T${time}:00`,timeZone:tz},end:{dateTime:`${date}T${plus(time,60)}:00`,timeZone:tz},reminders:{useDefault:false,overrides:[{method:'popup',minutes:rem}]}})});
  }
  async function test(){const j=await api('/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin='+encodeURIComponent(new Date().toISOString())+'&maxResults=1');return j}

  function settingsCard(){
    const s=read();return `<section class="card google-calendar-card" style="margin-top:16px"><div class="card-head"><div><h3>🗓️ Google Calendar</h3><p class="mini">${tr('اربط حساب Google لإرسال المواعيد والامتحانات مع تنبيهات حقيقية.','Connect Google to send events and exams with real reminders.')}</p></div><span class="tag ${s.connected?'green':''}">${s.connected?tr('متصل','Connected'):tr('غير متصل','Not connected')}</span></div><div class="form-grid"><div class="field"><label>Google OAuth Client ID</label><input class="input" id="googleClientId" value="${esc(s.clientId||'')}" placeholder="...apps.googleusercontent.com"></div><div class="field"><label>${tr('التنبيه الافتراضي بالدقائق','Default reminder minutes')}</label><input class="input" id="googleReminder" type="number" min="0" value="${Number(s.reminderMinutes??10)}"></div></div><p class="mini" style="margin-top:8px">${tr('لا تضع Client Secret هنا. تطبيقات الويب تستخدم Client ID فقط في الواجهة.','Never put a Client Secret here. Web apps use the Client ID in the browser.')}</p><div class="btn-row"><button class="btn primary" id="googleSave">💾 ${tr('حفظ','Save')}</button><button class="btn primary" id="googleConnect">${s.connected?tr('🔄 إعادة الربط','🔄 Reconnect'):tr('🔗 ربط Google Calendar','🔗 Connect Google Calendar')}</button>${s.connected?'<button class="btn danger" id="googleDisconnect">'+tr('فصل الحساب','Disconnect')+'</button>':''}${s.connected?'<button class="btn" id="googleTest">🧪 '+tr('اختبار','Test')+'</button>':''}</div><div id="googleResult" class="mini" style="margin-top:10px"></div></section>`;
  }
  function plannerTools(){const s=read();return `<div class="google-planner-tools" style="margin-top:10px;padding:12px;border:1px solid #e5e1ff;border-radius:15px;background:#f7f5ff"><label class="check-row"><input type="checkbox" id="googleSyncEvent"> <span>🗓️ ${tr('أضف هذا الموعد أيضًا إلى Google Calendar','Also add this event to Google Calendar')}</span></label><div class="field" style="margin-top:8px"><label>${tr('التنبيه','Reminder')}</label><input class="input" id="googleEventReminder" type="number" min="0" value="${Number(s.reminderMinutes??10)}"></div></div>`}
  function inject(){
    const content=document.getElementById('app');if(!content)return;
    if(content.querySelector('[data-setting="theme"]') || content.querySelector('[data-setting="lang"]')){
      if(!content.querySelector('.google-calendar-card'))content.insertAdjacentHTML('beforeend',settingsCard());
    }
    if(content.querySelector('#eventForm')){
      const form=content.querySelector('#eventForm');
      if(form&&!form.querySelector('.google-planner-tools'))form.insertAdjacentHTML('beforeend',plannerTools());
    }
    bindUI();
  }
  function bindUI(){
    const saveBtn=document.getElementById('googleSave');if(saveBtn&&!saveBtn.dataset.bound){saveBtn.dataset.bound=1;saveBtn.onclick=()=>{save({...read(),clientId:document.getElementById('googleClientId').value.trim(),reminderMinutes:Number(document.getElementById('googleReminder').value||10)});toast(tr('تم حفظ إعدادات Google.','Google settings saved.'));inject()}}
    const connectBtn=document.getElementById('googleConnect');if(connectBtn&&!connectBtn.dataset.bound){connectBtn.dataset.bound=1;connectBtn.onclick=()=>{save({...read(),clientId:document.getElementById('googleClientId').value.trim(),reminderMinutes:Number(document.getElementById('googleReminder').value||10)});connect()}}
    const disc=document.getElementById('googleDisconnect');if(disc&&!disc.dataset.bound){disc.dataset.bound=1;disc.onclick=disconnect}
    const testBtn=document.getElementById('googleTest');if(testBtn&&!testBtn.dataset.bound){testBtn.dataset.bound=1;testBtn.onclick=async()=>{try{const j=await test();document.getElementById('googleResult').textContent=tr(`الاتصال ناجح. ${j.items?.[0]?.summary?'أقرب موعد: '+j.items[0].summary:'لا يوجد موعد قادم.'}`,`Connected. ${j.items?.[0]?.summary?'Next event: '+j.items[0].summary:'No upcoming event.'}`)}catch(e){document.getElementById('googleResult').textContent=e.message}}}
  }

  document.addEventListener('submit',e=>{
    const form=e.target;if(!(form instanceof HTMLFormElement)||form.id!=='eventForm')return;
    const cb=form.querySelector('#googleSyncEvent');if(!cb?.checked)return;
    const f=new FormData(form);const item={title:f.get('title'),date:f.get('date'),time:f.get('time'),note:f.get('note'),reminderMinutes:Number(form.querySelector('#googleEventReminder')?.value||read().reminderMinutes||10)};
    setTimeout(async()=>{try{const local=state.events[state.events.length-1];if(local){const g=await createEvent(item);local.googleEventId=g.id;local.googleHtmlLink=g.htmlLink||'';save();toast(tr('تمت إضافة الموعد في التطبيق وGoogle Calendar مع التنبيه ✅','Added to the app and Google Calendar with a reminder ✅'));}}catch(err){toast('Google: '+err.message)}},350);
  },true);

  const observer=new MutationObserver(()=>inject());
  function boot(){const app=document.getElementById('app');if(app)observer.observe(app,{childList:true,subtree:true});inject()}
  window.MohammedGoogleCalendar={connect,disconnect,createEvent,test,read};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
