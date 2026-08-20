const KEY="mohammed-life-system-v1";
const state=JSON.parse(localStorage.getItem(KEY)||"{}");
state.days=state.days||{};state.settings=state.settings||{lang:"ar"};state.goals=state.goals||{phoneTarget:0};let current=new Date(),view="today";

const T={
ar:{today:"اليوم",planner:"المخطط",health:"الصحة",study:"المذاكرة",finance:"المال",history:"السجل",analytics:"التحليلات",english:"English",backup:"نسخة احتياطية",restore:"استعادة",sleep:"النوم",prayer:"الصلاة",activity:"النشاط",studyTime:"المذاكرة",healthLog:"سجل الألم",goals:"الأهداف",habits:"العادات",journal:"مذكرات اليوم",quick:"إضافة سريعة",score:"تقييم اليوم",water:"المياه",walk:"المشي",reading:"القراءة",screen:"وقت الشاشة",mood:"المزاج",energy:"الطاقة",bed:"النوم",wake:"الاستيقاظ",duration:"الساعات",minutes:"الدقائق",shoulder:"الكتف",neck:"الرقبة",back:"الظهر",save:"حفظ",add:"إضافة",subject:"المادة",topic:"الموضوع",focus:"التركيز",income:"الدخل",spent:"المصروف",target:"هدف الموبايل",saved:"المُدخر",remaining:"المتبقي",date:"التاريخ",actions:"إجراءات",delete:"حذف",summary:"ملخص",week:"الأسبوع",month:"الشهر",noData:"لا توجد بيانات بعد",recorded:"أيام مسجلة",prayersDone:"صلوات مكتملة",quickSleep:"تسجيل النوم",quickStudy:"إضافة مذاكرة",quickWalk:"إضافة مشي",quickWater:"إضافة مياه",quickExpense:"إضافة مصروف",quickPain:"تسجيل الألم",habitWake:"الاستيقاظ في الموعد",habitStudy:"المذاكرة",habitWalk:"المشي",habitRead:"القراءة",habitRoutine:"روتين الكتف والرقبة",habitScreen:"تقليل الشاشة",notes:"ملاحظات",amount:"المبلغ",category:"التصنيف",description:"الوصف"},
en:{today:"Today",planner:"Planner",health:"Health",study:"Study",finance:"Finance",history:"History",analytics:"Analytics",english:"العربية",backup:"Backup",restore:"Restore",sleep:"Sleep",prayer:"Prayer",activity:"Activity",studyTime:"Study",healthLog:"Pain log",goals:"Goals",habits:"Habits",journal:"Journal",quick:"Quick add",score:"Daily score",water:"Water",walk:"Walking",reading:"Reading",screen:"Screen time",mood:"Mood",energy:"Energy",bed:"Bed",wake:"Wake",duration:"Hours",minutes:"Minutes",shoulder:"Shoulder",neck:"Neck",back:"Back",save:"Save",add:"Add",subject:"Subject",topic:"Topic",focus:"Focus",income:"Income",spent:"Spent",target:"Phone target",saved:"Saved",remaining:"Remaining",date:"Date",actions:"Actions",delete:"Delete",summary:"Summary",week:"Week",month:"Month",noData:"No data yet",recorded:"Recorded days",prayersDone:"Prayers completed",quickSleep:"Log sleep",quickStudy:"Add study",quickWalk:"Add walking",quickWater:"Add water",quickExpense:"Add expense",quickPain:"Log pain",habitWake:"Wake on time",habitStudy:"Study",habitWalk:"Walk",habitRead:"Read",habitRoutine:"Shoulder & neck routine",habitScreen:"Limit screen time",notes:"Notes",amount:"Amount",category:"Category",description:"Description"}
};
const tr=k=>T[state.settings.lang][k]||k;
const iso=d=>{const x=new Date(d);x.setHours(12,0,0,0);return x.toISOString().slice(0,10)};
const day=()=>{const k=iso(current);if(!state.days[k])state.days[k]={sleep:{},prayer:{},activity:{},health:{},study:[],finance:{income:0,spent:0,items:[]},goals:["","",""],habits:{},journal:"",mood:"",energy:""};return state.days[k]};
const persist=()=>localStorage.setItem(KEY,JSON.stringify(state));
const toast=m=>{const e=document.getElementById("toast");e.textContent=m;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1300)};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=x=>Number(x||0);
function studyMinutes(d){return (d.study||[]).reduce((a,x)=>a+num(x.minutes),0)}
function prayerCount(d){return Object.values(d.prayer||{}).filter(Boolean).length}
function habitCount(d){return Object.values(d.habits||{}).filter(Boolean).length}
function score(d){const checks=[num(d.sleep?.duration)>=7,studyMinutes(d)>=30,num(d.activity?.walk)>=20,num(d.activity?.water)>=1.5,num(d.activity?.reading)>=10,prayerCount(d)>=4,habitCount(d)>=3];return Math.round(checks.filter(Boolean).length/checks.length*100)}
function saveAndRender(){persist();toast(state.settings.lang==="ar"?"تم الحفظ":"Saved");render()}
function input(label,key,value="",type="text"){return `<label class="field">${label}<input data-key="${key}" type="${type}" value="${esc(value)}"></label>`}
function setPath(obj,path,value){const p=path.split(".");let x=obj;for(let i=0;i<p.length-1;i++)x=x[p[i]]||(x[p[i]]={});x[p.at(-1)]=value}
function bindFields(obj){document.querySelectorAll("[data-key]").forEach(e=>e.addEventListener("change",()=>setPath(obj,e.dataset.key,e.type==="number"?num(e.value):e.value)))}
function section(title,body,action=""){return `<section class="section"><div class="section-head"><h2>${title}</h2>${action}</div>${body}</section>`}
function stats(d){return `<div class="stats">
<div class="stat"><small>${tr("sleep")}</small><strong>${d.sleep.duration||"—"}</strong><small>${tr("duration")}</small></div>
<div class="stat"><small>${tr("studyTime")}</small><strong>${studyMinutes(d)}</strong><small>${tr("minutes")}</small></div>
<div class="stat"><small>${tr("walk")}</small><strong>${d.activity.walk||0}</strong><small>${tr("minutes")}</small></div>
<div class="stat"><small>${tr("water")}</small><strong>${d.activity.water||0}</strong><small>L</small></div>
</div>`}

function renderToday(root){
const d=day(),s=score(d);
root.innerHTML=`<div class="hero"><div class="hero-main"><span class="eyebrow">${tr("today")}</span><h2>${s}%</h2><p>${tr("summary")} · ${prayerCount(d)}/5 ${tr("prayersDone")} · ${habitCount(d)} ${tr("habits")}</p></div><div class="hero-score"><div class="score-ring" style="--score:${s}"><b>${s}%</b></div></div></div>${stats(d)}
${section(tr("prayer"),`<div class="card"><div class="checks">${["Fajr","Dhuhr","Asr","Maghrib","Isha"].map(p=>`<label class="check"><input type="checkbox" data-prayer="${p}" ${d.prayer[p]?"checked":""}>${p}</label>`).join("")}</div></div>`)}
${section(tr("habits"),`<div class="card"><div class="checks">${["habitWake","habitStudy","habitWalk","habitRead","habitRoutine","habitScreen"].map((k,i)=>`<label class="check"><input type="checkbox" data-habit="${i}" ${d.habits[i]?"checked":""}>${tr(k)}</label>`).join("")}</div></div>`)}
${section(tr("goals"),`<div class="card"><div class="form-grid">${d.goals.map((g,i)=>input("#"+(i+1),"goal."+i,g)).join("")}</div><button class="primary" id="saveGoals">${tr("save")}</button></div>`)}
${section(tr("journal"),`<div class="card"><label class="field">${tr("notes")}<textarea id="journal">${esc(d.journal)}</textarea></label><button class="primary" id="saveJournal">${tr("save")}</button></div>`)}
`;
document.querySelectorAll("[data-prayer]").forEach(e=>e.addEventListener("change",()=>{d.prayer[e.dataset.prayer]=e.checked;saveAndRender()}));
document.querySelectorAll("[data-habit]").forEach(e=>e.addEventListener("change",()=>{d.habits[e.dataset.habit]=e.checked;saveAndRender()}));
document.getElementById("saveGoals").onclick=()=>{document.querySelectorAll('[data-key^="goal."]').forEach(e=>d.goals[+e.dataset.key.split(".")[1]]=e.value);saveAndRender()};
document.getElementById("saveJournal").onclick=()=>{d.journal=document.getElementById("journal").value;saveAndRender()};
}

function renderPlanner(root){
const d=day();
root.innerHTML=`${section(tr("quick"),`<div class="card"><div class="form-grid">
${input(tr("bed"),"sleep.bed",d.sleep.bed,"time")}${input(tr("wake"),"sleep.wake",d.sleep.wake,"time")}${input(tr("duration"),"sleep.duration",d.sleep.duration,"number")}
${input(tr("water"),"activity.water",d.activity.water,"number")}${input(tr("walk"),"activity.walk",d.activity.walk,"number")}${input(tr("reading"),"activity.reading",d.activity.reading,"number")}${input(tr("screen"),"activity.screen",d.activity.screen,"number")}${input(tr("mood"),"mood",d.mood,"number")}${input(tr("energy"),"energy",d.energy,"number")}
</div><button class="primary" id="savePlan">${tr("save")}</button></div>`)}
${section(tr("goals"),`<div class="card"><div class="form-grid">${d.goals.map((g,i)=>input("#"+(i+1),"goal."+i,g)).join("")}</div><button class="primary" id="saveGoals2">${tr("save")}</button></div>`)}
`;
bindFields(d);document.getElementById("savePlan").onclick=saveAndRender;document.getElementById("saveGoals2").onclick=()=>{document.querySelectorAll('[data-key^="goal."]').forEach(e=>d.goals[+e.dataset.key.split(".")[1]]=e.value);saveAndRender()};
}

function renderHealth(root){
const d=day(),h=d.health;
root.innerHTML=section(tr("healthLog"),`<div class="card"><div class="form-grid">${input(tr("shoulder"),"health.shoulder",h.shoulder,"number")}${input(tr("neck"),"health.neck",h.neck,"number")}${input(tr("back"),"health.back",h.back,"number")}</div><p class="muted">${state.settings.lang==="ar"?"سجّل شدة الألم من 0 إلى 10. هذا سجل متابعة وليس تشخيصًا طبيًا.":"Record pain intensity from 0 to 10. This is tracking, not a medical diagnosis."}</p><button class="primary" id="saveHealth">${tr("save")}</button></div>`);
bindFields(d);document.getElementById("saveHealth").onclick=saveAndRender;
}

function renderStudy(root){
const d=day();
root.innerHTML=`${section(tr("studyTime"),`<div class="card"><div class="form-grid">${input(tr("subject"),"subject")}${input(tr("topic"),"topic")}${input(tr("minutes"),"minutes","", "number")}${input(tr("focus"),"focus","", "number")}</div><button class="primary" id="addStudy">${tr("add")}</button></div>`)}
${section(tr("studyTime"),`<div class="table-card"><div class="table-wrap"><table class="table"><thead><tr><th>${tr("subject")}</th><th>${tr("topic")}</th><th>${tr("minutes")}</th><th>${tr("focus")}</th><th>${tr("actions")}</th></tr></thead><tbody>${d.study.map((x,i)=>`<tr><td>${esc(x.subject)}</td><td>${esc(x.topic)}</td><td>${num(x.minutes)}</td><td>${num(x.focus)}/10</td><td><button class="mini-btn" data-del-study="${i}">${tr("delete")}</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">${tr("noData")}</td></tr>`}</tbody></table></div></div>`)}
`;
document.getElementById("addStudy").onclick=()=>{const x={};document.querySelectorAll("[data-key]").forEach(e=>x[e.dataset.key]=e.type==="number"?num(e.value):e.value);if(!x.subject&&!x.topic&&!x.minutes)return toast(tr("noData"));d.study.push(x);saveAndRender()};
document.querySelectorAll("[data-del-study]").forEach(b=>b.onclick=()=>{d.study.splice(+b.dataset.delStudy,1);saveAndRender()});
}

function renderFinance(root){
const d=day(),f=d.finance,target=num(state.goals.phoneTarget),net=num(f.income)-num(f.spent),remaining=Math.max(0,target-net),pct=target?Math.min(100,Math.round(net/target*100)):0;
root.innerHTML=`${section(tr("target"),`<div class="card"><div class="form-grid">${input(tr("target"),"goalTarget",target,"number")}${input(tr("income"),"finance.income",f.income,"number")}${input(tr("spent"),"finance.spent",f.spent,"number")}</div><div class="progress"><i style="width:${pct}%"></i></div><div class="row"><b>${pct}%</b><span class="muted">${tr("saved")}: ${net.toLocaleString()} · ${tr("remaining")}: ${remaining.toLocaleString()}</span></div><button class="primary" id="saveFinance">${tr("save")}</button></div>`)}
${section(tr("quickExpense"),`<div class="card"><div class="form-grid">${input(tr("category"),"category")}${input(tr("amount"),"amount","", "number")}${input(tr("description"),"description")}</div><button class="primary" id="addExpense">${tr("add")}</button></div>`)}
${section(tr("finance"),`<div class="table-card"><div class="table-wrap"><table class="table"><thead><tr><th>${tr("date")}</th><th>${tr("category")}</th><th>${tr("description")}</th><th>${tr("amount")}</th><th>${tr("actions")}</th></tr></thead><tbody>${(f.items||[]).slice().reverse().map((x,i)=>`<tr><td>${x.date}</td><td>${esc(x.category)}</td><td>${esc(x.description)}</td><td>${num(x.amount).toLocaleString()}</td><td><button class="mini-btn" data-del-exp="${f.items.length-1-i}">${tr("delete")}</button></td></tr>`).join("")||`<tr><td colspan="5" class="empty">${tr("noData")}</td></tr>`}</tbody></table></div></div>`)}
`;
bindFields(d);document.querySelector('[data-key="goalTarget"]').onchange=e=>state.goals.phoneTarget=num(e.target.value);
document.getElementById("saveFinance").onclick=saveAndRender;
document.getElementById("addExpense").onclick=()=>{const q={};document.querySelectorAll("[data-key]").forEach(e=>q[e.dataset.key]=e.type==="number"?num(e.value):e.value);if(!q.amount)return toast(tr("noData"));f.items=f.items||[];f.items.push({date:iso(current),category:q.category,description:q.description,amount:q.amount});f.spent=num(f.spent)+num(q.amount);saveAndRender()};
document.querySelectorAll("[data-del-exp]").forEach(b=>b.onclick=()=>{f.items.splice(+b.dataset.delExp,1);f.spent=f.items.reduce((a,x)=>a+num(x.amount),0);saveAndRender()});
}

function renderHistory(root){
const keys=Object.keys(state.days).sort().reverse();
root.innerHTML=section(tr("history"),`<div class="table-card"><div class="table-wrap"><table class="table"><thead><tr><th>${tr("date")}</th><th>${tr("sleep")}</th><th>${tr("studyTime")}</th><th>${tr("walk")}</th><th>${tr("healthLog")}</th><th>${tr("score")}</th></tr></thead><tbody>${keys.map(k=>{const d=state.days[k];return `<tr><td><button class="mini-btn" data-day="${k}">${k}</button></td><td>${d.sleep?.duration||"—"}</td><td>${studyMinutes(d)}</td><td>${d.activity?.walk||0}</td><td>${num(d.health?.shoulder)}/${num(d.health?.neck)}/${num(d.health?.back)}</td><td>${score(d)}%</td></tr>`}).join("")||`<tr><td colspan="6" class="empty">${tr("noData")}</td></tr>`}</tbody></table></div></div>`);
document.querySelectorAll("[data-day]").forEach(b=>b.onclick=()=>{current=new Date(b.dataset.day+"T12:00:00");view="today";render()});
}

function renderAnalytics(root){
const keys=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);keys.push(iso(d))}
const vals=keys.map(k=>state.days[k]?score(state.days[k]):0),avg=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
root.innerHTML=`${section(tr("week"),`<div class="card"><div class="bars">${vals.map((v,i)=>`<div class="bar"><b>${v}%</b><i style="height:${Math.max(3,v)}%"></i><span>${keys[i].slice(5)}</span></div>`).join("")}</div></div>`)}
${section(tr("summary"),`<div class="stats"><div class="stat"><small>${tr("score")}</small><strong>${avg}%</strong><small>${tr("week")}</small></div><div class="stat"><small>${tr("recorded")}</small><strong>${keys.filter(k=>state.days[k]).length}</strong><small>7</small></div><div class="stat"><small>${tr("studyTime")}</small><strong>${keys.reduce((a,k)=>a+studyMinutes(state.days[k]||{}),0)}</strong><small>${tr("minutes")}</small></div><div class="stat"><small>${tr("walk")}</small><strong>${keys.reduce((a,k)=>a+num(state.days[k]?.activity?.walk),0)}</strong><small>${tr("minutes")}</small></div></div>`)}
`;
}

function openQuick(){
const body=document.getElementById("drawerBody");
body.innerHTML=`<div class="quick-grid">
<button class="quick" data-q="sleep">😴 ${tr("quickSleep")}</button>
<button class="quick" data-q="study">📚 ${tr("quickStudy")}</button>
<button class="quick" data-q="walk">🚶 ${tr("quickWalk")}</button>
<button class="quick" data-q="water">💧 ${tr("quickWater")}</button>
<button class="quick" data-q="expense">💰 ${tr("quickExpense")}</button>
<button class="quick" data-q="pain">🦾 ${tr("quickPain")}</button>
</div>`;
document.getElementById("drawer").classList.add("open");
document.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>quickForm(b.dataset.q));
}
function quickForm(type){
const d=day(),body=document.getElementById("drawerBody");let html="";
if(type==="sleep")html=`<div class="form-grid">${input(tr("bed"),"sleep.bed",d.sleep.bed,"time")}${input(tr("wake"),"sleep.wake",d.sleep.wake,"time")}${input(tr("duration"),"sleep.duration",d.sleep.duration,"number")}</div>`;
if(type==="study")html=`<div class="form-grid">${input(tr("subject"),"subject")}${input(tr("topic"),"topic")}${input(tr("minutes"),"minutes","", "number")}${input(tr("focus"),"focus","", "number")}</div>`;
if(type==="walk")html=input(tr("walk"),"activity.walk",d.activity.walk,"number");
if(type==="water")html=input(tr("water"),"activity.water",d.activity.water,"number");
if(type==="expense")html=`<div class="form-grid">${input(tr("category"),"category")}${input(tr("amount"),"amount","", "number")}${input(tr("description"),"description")}</div>`;
if(type==="pain")html=`<div class="form-grid">${input(tr("shoulder"),"health.shoulder",d.health.shoulder,"number")}${input(tr("neck"),"health.neck",d.health.neck,"number")}${input(tr("back"),"health.back",d.health.back,"number")}</div>`;
body.innerHTML=`${html}<button class="primary" id="quickSave">${tr("save")}</button>`;
document.getElementById("quickSave").onclick=()=>{const q={};document.querySelectorAll("#drawerBody [data-key]").forEach(e=>q[e.dataset.key]=e.type==="number"?num(e.value):e.value);if(type==="study")d.study.push(q);else if(type==="expense"){d.finance.items.push({date:iso(current),category:q.category,description:q.description,amount:q.amount});d.finance.spent=num(d.finance.spent)+num(q.amount)}else Object.keys(q).forEach(k=>setPath(d,k,q[k]));persist();closeDrawer();render();toast(tr("save"))};
}
function closeDrawer(){document.getElementById("drawer").classList.remove("open")}

const views={today:renderToday,planner:renderPlanner,health:renderHealth,study:renderStudy,finance:renderFinance,history:renderHistory,analytics:renderAnalytics};
function render(){
document.documentElement.lang=state.settings.lang;document.documentElement.dir=state.settings.lang==="ar"?"rtl":"ltr";
document.getElementById("date").textContent=current.toLocaleDateString(state.settings.lang==="ar"?"ar-EG":"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
document.getElementById("miniDate").textContent=current.toLocaleDateString(state.settings.lang==="ar"?"ar-EG":"en-US",{month:"short",day:"numeric"});
document.getElementById("title").textContent=tr(view);document.getElementById("jump").textContent=tr("today");document.getElementById("lang").textContent=tr("english");document.getElementById("export").textContent=tr("backup");
const nav=[["today","🏠"],["planner","📅"],["health","🦾"],["study","📚"],["finance","💰"],["history","📋"],["analytics","📊"]];
document.getElementById("nav").innerHTML=nav.map(([k,i])=>`<button class="nav ${view===k?"active":""}" data-view="${k}">${i} ${tr(k)}</button>`).join("");
document.querySelectorAll("[data-view]").forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelector(".sidebar").classList.remove("open");render()});
views[view](document.getElementById("content"));
}
document.getElementById("prev").onclick=()=>{current.setDate(current.getDate()-1);render()};
document.getElementById("next").onclick=()=>{current.setDate(current.getDate()+1);render()};
document.getElementById("jump").onclick=()=>{current=new Date();render()};
document.getElementById("menuBtn").onclick=()=>document.querySelector(".sidebar").classList.toggle("open");
document.getElementById("quickBtn").onclick=openQuick;
document.getElementById("closeDrawer").onclick=closeDrawer;
document.getElementById("drawer").addEventListener("click",e=>{if(e.target.id==="drawer")closeDrawer()});
document.getElementById("lang").onclick=()=>{state.settings.lang=state.settings.lang==="ar"?"en":"ar";persist();render()};
document.getElementById("export").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="mohammed-life-backup.json";a.click()};
document.getElementById("import").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const incoming=JSON.parse(r.result);localStorage.setItem(KEY,JSON.stringify(incoming));location.reload()}catch{toast("Invalid backup")}};r.readAsText(f)};
render();
