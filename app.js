
const KEY="mohammed-life-system-v1";
const state=JSON.parse(localStorage.getItem(KEY)||'{"days":{},"settings":{"lang":"en"},"goals":{"phoneTarget":25000}}');
let selectedDate=new Date(); let currentView="today";

const T={
 en:{Today:"Today",Planner:"Planner",Health:"Health",Study:"Study",Finance:"Finance",History:"History",Analytics:"Analytics",
 Arabic:"العربية",English:"English",Export:"Export data",Import:"Import data",Sleep:"Sleep",Prayer:"Prayer",StudyTime:"Study time",
 Walking:"Walking",Reading:"Reading",Pain:"Pain",Water:"Water",Screen:"Screen time",Savings:"Phone savings",Goals:"Goals",
 Save:"Save",Hours:"hours",Minutes:"minutes",Notes:"Notes",NoData:"No data yet.",DailyPlan:"Daily plan",TopGoals:"Top 3 goals",
 SleepTime:"Sleep duration",Wake:"Wake time",Bed:"Bed time",Focus:"Focus /10",WaterLiters:"Water (L)",WalkMin:"Walking (min)",
 ReadMin:"Reading (min)",ScreenMin:"Screen time (min)",Shoulder:"Shoulder pain /10",Neck:"Neck pain /10",Back:"Back pain /10",
 MoneyIn:"Money added",MoneyOut:"Money spent",PhoneTarget:"Phone target",Saved:"Saved",Remaining:"Remaining",Add:"Add",
 Journal:"Daily journal",PrayerLog:"Prayer log",Completed:"Completed",Plan:"Plan",Review:"Review",ThisWeek:"This week",
 Month:"Month",Entries:"entries",Trend:"Trend",Exported:"Data exported.",Imported:"Data imported.",SavedMsg:"Saved.",
 Quick:"Quick entry",Mood:"Mood /10",Energy:"Energy /10",Habit:"Habit tracker",ReadPages:"Pages",Expense:"Expense",
 ExpenseNote:"Expense note",Income:"Income",Amount:"Amount",Category:"Category",Description:"Description",AddExpense:"Add expense",
 Date:"Date",BackToToday:"Today",NoHistory:"No saved days yet.",DailyInsight:"Daily insight",Best:"Best",Average:"Average",
 Language:"Language",Settings:"Settings",WeeklyReview:"Weekly review",MonthlyReview:"Monthly review",Next:"Next",Previous:"Previous"
 },
 ar:{Today:"اليوم",Planner:"المخطط",Health:"الصحة",Study:"المذاكرة",Finance:"المال",History:"السجل",Analytics:"التحليلات",
 Arabic:"English",English:"العربية",Export:"تصدير البيانات",Import:"استيراد البيانات",Sleep:"النوم",Prayer:"الصلاة",StudyTime:"وقت المذاكرة",
 Walking:"المشي",Reading:"القراءة",Pain:"الألم",Water:"المياه",Screen:"وقت الشاشة",Savings:"ادخار الموبايل",Goals:"الأهداف",
 Save:"حفظ",Hours:"ساعة",Minutes:"دقيقة",Notes:"ملاحظات",NoData:"لا توجد بيانات بعد.",DailyPlan:"خطة اليوم",TopGoals:"أهم 3 أهداف",
 SleepTime:"مدة النوم",Wake:"وقت الاستيقاظ",Bed:"وقت النوم",Focus:"التركيز /10",WaterLiters:"المياه (لتر)",WalkMin:"المشي (دقيقة)",
 ReadMin:"القراءة (دقيقة)",ScreenMin:"وقت الشاشة (دقيقة)",Shoulder:"ألم الكتف /10",Neck:"ألم الرقبة /10",Back:"ألم الظهر /10",
 MoneyIn:"المبلغ المضاف",MoneyOut:"المصروف",PhoneTarget:"هدف الموبايل",Saved:"المدخر",Remaining:"المتبقي",Add:"إضافة",
 Journal:"مذكرات اليوم",PrayerLog:"متابعة الصلاة",Completed:"تم",Plan:"الخطة",Review:"المراجعة",ThisWeek:"هذا الأسبوع",
 Month:"الشهر",Entries:"سجلات",Trend:"الاتجاه",Exported:"تم تصدير البيانات.",Imported:"تم استيراد البيانات.",SavedMsg:"تم الحفظ.",
 Quick:"إدخال سريع",Mood:"المزاج /10",Energy:"الطاقة /10",Habit:"متابعة العادات",ReadPages:"الصفحات",Expense:"مصروف",
 ExpenseNote:"وصف المصروف",Income:"دخل",Amount:"المبلغ",Category:"التصنيف",Description:"الوصف",AddExpense:"إضافة مصروف",
 Date:"التاريخ",BackToToday:"اليوم",NoHistory:"لا توجد أيام محفوظة بعد.",DailyInsight:"ملخص اليوم",Best:"الأفضل",Average:"المتوسط",
 Language:"اللغة",Settings:"الإعدادات",WeeklyReview:"مراجعة الأسبوع",MonthlyReview:"مراجعة الشهر",Next:"التالي",Previous:"السابق"
 }};
function tr(k){return T[state.settings.lang][k]||k}
function iso(d){return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10)}
function day(){const k=iso(selectedDate); if(!state.days[k]) state.days[k]={sleep:{},prayer:{},study:[],health:{},activity:{},reading:{},finance:{income:0,spent:0,items:[]},goals:["","",""],habits:{},journal:"",mood:"",energy:""}; return state.days[k]}
function save(){localStorage.setItem(KEY,JSON.stringify(state)); toast(tr("SavedMsg"))}
function toast(x){const e=document.querySelector("#toast");e.textContent=x;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1400)}
function fmtDate(d){return d.toLocaleDateString(state.settings.lang==="ar"?"ar-EG":"en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
function pct(v,target){return Math.max(0,Math.min(100,target?Math.round(v/target*100):0))}
function nav(){document.querySelectorAll(".nav").forEach(b=>{b.classList.toggle("active",b.dataset.view===currentView);b.textContent=tr(b.dataset.view[0].toUpperCase()+b.dataset.view.slice(1))})}
function render(){document.documentElement.lang=state.settings.lang;document.documentElement.dir=state.settings.lang==="ar"?"rtl":"ltr";document.querySelector("#date").textContent=fmtDate(selectedDate);document.querySelector("#title").textContent=tr(currentView[0].toUpperCase()+currentView.slice(1));document.querySelector("#lang").textContent=tr("Arabic");document.querySelector("#export").textContent=tr("Export");document.querySelector(".file").firstChild&&(document.querySelector(".file").childNodes[0].textContent=tr("Import")+" ");nav(); const root=document.querySelector("#app");({today,planner,health,study,finance,history,analytics}[currentView])(root)}
function field(label,key,val="",type="text"){return `<label class="field">${label}<input data-key="${key}" type="${type}" value="${String(val??"").replaceAll('"','&quot;')}"></label>`}
function section(title,body){return `<section class="section"><div class="section-title"><h2>${title}</h2></div>${body}</section>`}
function today(root){
 const d=day(), s=d.sleep||{}, h=d.health||{}, a=d.activity||{}, f=d.finance||{};
 const saved=Number(f.income||0)-Number(f.spent||0);
 root.innerHTML=`
 <div class="grid cards">
  ${metric(tr("Sleep"),s.duration||"—",tr("Hours"))}${metric(tr("StudyTime"),studyMinutes(d)+" min", "")}
  ${metric(tr("Walking"),a.walk||0,tr("Minutes"))}${metric(tr("Reading"),(d.reading||{}).minutes||0,tr("Minutes"))}
  ${metric(tr("Pain"),`${h.shoulder||0}/${h.neck||0}/${h.back||0}`,"Shoulder / Neck / Back")}
  ${metric(tr("Savings"),`${saved.toLocaleString()} EGP`,tr("Saved"))}
 </div>
 ${section(tr("Quick"),`
 <div class="card"><div class="form-grid">
 ${field(tr("SleepTime"),"sleep.duration",s.duration,"number")}${field(tr("Bed"),"sleep.bed",s.bed,"time")}${field(tr("Wake"),"sleep.wake",s.wake,"time")}
 ${field(tr("WaterLiters"),"activity.water",a.water,"number")}${field(tr("WalkMin"),"activity.walk",a.walk,"number")}${field(tr("ScreenMin"),"activity.screen",a.screen,"number")}
 ${field(tr("Mood"),"mood",d.mood,"number")}${field(tr("Energy"),"energy",d.energy,"number")}
 </div><div class="row" style="margin-top:12px"><button class="save" id="quickSave">${tr("Save")}</button></div></div>`)}
 ${section(tr("PrayerLog"),`<div class="card checklist">${["Fajr","Dhuhr","Asr","Maghrib","Isha"].map(x=>`<label class="check"><input type="checkbox" data-prayer="${x}" ${d.prayer[x]?"checked":""}> ${x}</label>`).join("")}</div>`)}
 ${section(tr("TopGoals"),`<div class="card checklist">${d.goals.map((g,i)=>`<label class="field">${i+1}<input data-goal="${i}" value="${String(g||"").replaceAll('"','&quot;')}"></label>`).join("")}</div>`)}
 ${section(tr("Habit"),`<div class="card checklist">${["Wake on time","Study","Walk","Read","Neck/shoulder routine","Limit screen time"].map((x,i)=>`<label class="check"><input type="checkbox" data-habit="${i}" ${d.habits[i]?"checked":""}> ${x}</label>`).join("")}</div>`)}
 ${section(tr("Journal"),`<div class="card"><textarea id="journal">${d.journal||""}</textarea><div class="row" style="margin-top:10px"><button class="save" id="journalSave">${tr("Save")}</button></div></div>`)}
 `;
 document.querySelector("#quickSave").onclick=()=>{document.querySelectorAll("[data-key]").forEach(e=>setPath(d,e.dataset.key,e.type==="number"?Number(e.value):e.value));save();render()}
 document.querySelector("#journalSave").onclick=()=>{d.journal=document.querySelector("#journal").value;save()}
 document.querySelectorAll("[data-prayer]").forEach(e=>e.onchange=()=>{d.prayer[e.dataset.prayer]=e.checked;save()})
 document.querySelectorAll("[data-goal]").forEach(e=>e.onchange=()=>{d.goals[+e.dataset.goal]=e.value;save()})
 document.querySelectorAll("[data-habit]").forEach(e=>e.onchange=()=>{d.habits[+e.dataset.habit]=e.checked;save()})
}
function metric(a,b,c){return `<div class="card"><h3>${a}</h3><div class="metric">${b}</div><div class="muted">${c}</div></div>`}
function setPath(obj,path,val){const p=path.split(".");let x=obj;for(let i=0;i<p.length-1;i++){x=x[p[i]]||(x[p[i]]={})}x[p.at(-1)]=val}
function studyMinutes(d){return (d.study||[]).reduce((s,x)=>s+Number(x.minutes||0),0)}
function planner(root){
 const d=day();
 root.innerHTML=section(tr("DailyPlan"),`<div class="card"><div class="form-grid">
 ${field(tr("SleepTime"),"sleep.duration",d.sleep.duration,"number")}${field(tr("WalkMin"),"activity.walk",d.activity.walk,"number")}
 ${field(tr("ReadMin"),"reading.minutes",(d.reading||{}).minutes,"number")}${field(tr("Focus"),"health.focus",d.health.focus,"number")}
 </div><div class="row" style="margin-top:12px"><button class="save" id="savePlan">${tr("Save")}</button></div></div>`);
 document.querySelector("#savePlan").onclick=()=>{document.querySelectorAll("[data-key]").forEach(e=>setPath(d,e.dataset.key,e.type==="number"?Number(e.value):e.value));save();render()}
}
function health(root){
 const h=day().health||{};
 root.innerHTML=section(tr("Health"),`<div class="card"><div class="form-grid">
 ${field(tr("Shoulder"),"health.shoulder",h.shoulder,"number")}${field(tr("Neck"),"health.neck",h.neck,"number")}${field(tr("Back"),"health.back",h.back,"number")}${field(tr("Focus"),"health.focus",h.focus,"number")}
 </div><p class="muted">Track symptoms consistently. Do not use the dashboard as a diagnosis. Seek clinical assessment for persistent or worsening pain, weakness, numbness, major injury, or other red-flag symptoms.</p><button class="save" id="saveHealth">${tr("Save")}</button></div>`);
 document.querySelector("#saveHealth").onclick=()=>{document.querySelectorAll("[data-key]").forEach(e=>setPath(day(),e.dataset.key,Number(e.value)));save();render()}
}
function study(root){
 const d=day(); const rows=d.study||[];
 root.innerHTML=section(tr("StudyTime"),`<div class="card"><div class="form-grid">${field("Subject","subject","","text")}${field("Topic","topic","","text")}${field(tr("Minutes"),"minutes","","number")}${field(tr("Focus"),"focus","","number")}</div><button class="save" id="addStudy" style="margin-top:12px">${tr("Add")}</button></div>
 <div class="table-wrap"><table><thead><tr><th>Subject</th><th>Topic</th><th>Minutes</th><th>Focus</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${x.subject||""}</td><td>${x.topic||""}</td><td>${x.minutes||0}</td><td>${x.focus||""}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">${tr("NoData")}</td></tr>`}</tbody></table></div>`);
 document.querySelector("#addStudy").onclick=()=>{const vals={};document.querySelectorAll("[data-key]").forEach(e=>vals[e.dataset.key]=e.type==="number"?Number(e.value):e.value);d.study.push(vals);save();render()}
}
function finance(root){
 const f=day().finance||{income:0,spent:0,items:[]}; const saved=Number(f.income||0)-Number(f.spent||0); const target=Number(state.goals.phoneTarget||0);
 root.innerHTML=section(tr("Savings"),`<div class="grid cards"><div class="card"><h3>${tr("PhoneTarget")}</h3><div class="metric">${target.toLocaleString()} EGP</div><input id="target" type="number" value="${target}"></div><div class="card"><h3>${tr("Saved")}</h3><div class="metric">${saved.toLocaleString()} EGP</div><div class="progress"><i style="width:${pct(saved,target)}%"></i></div><div class="muted">${pct(saved,target)}%</div></div><div class="card"><h3>${tr("Remaining")}</h3><div class="metric">${Math.max(0,target-saved).toLocaleString()} EGP</div></div></div>`)
 + section(tr("Finance"),`<div class="card"><div class="form-grid">${field(tr("Income"),"income",f.income,"number")}${field(tr("MoneyOut"),"spent",f.spent,"number")}${field(tr("Category"),"category","","text")}${field(tr("Amount"),"amount","","number")}${field(tr("Description"),"description","","text")}</div><button class="save" id="saveFinance" style="margin-top:12px">${tr("Save")}</button></div>`)
 + `<div class="table-wrap"><table><thead><tr><th>${tr("Date")}</th><th>${tr("Category")}</th><th>${tr("Amount")}</th><th>${tr("Description")}</th></tr></thead><tbody>${(f.items||[]).map(x=>`<tr><td>${x.date}</td><td>${x.category}</td><td>${x.amount} EGP</td><td>${x.description||""}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">${tr("NoData")}</td></tr>`}</tbody></table></div>`;
 document.querySelector("#target").onchange=e=>{state.goals.phoneTarget=Number(e.target.value);save();render()}
 document.querySelector("#saveFinance").onclick=()=>{const d=day();const q={};document.querySelectorAll("[data-key]").forEach(e=>q[e.dataset.key]=e.type==="number"?Number(e.value):e.value);d.finance.income=Number(q.income||0);d.finance.spent=Number(q.spent||0);if(q.amount)d.finance.items.push({date:iso(selectedDate),category:q.category,amount:Number(q.amount),description:q.description});save();render()}
}
function history(root){
 const keys=Object.keys(state.days).sort().reverse();
 root.innerHTML=section(tr("History"),`<div class="table-wrap"><table><thead><tr><th>${tr("Date")}</th><th>${tr("Sleep")}</th><th>${tr("StudyTime")}</th><th>${tr("Walking")}</th><th>${tr("Pain")}</th><th>${tr("Savings")}</th></tr></thead><tbody>${keys.map(k=>{const x=state.days[k],h=x.health||{},a=x.activity||{},f=x.finance||{};return `<tr><td><button class="secondary" data-date="${k}">${k}</button></td><td>${x.sleep?.duration||"—"}</td><td>${studyMinutes(x)}</td><td>${a.walk||0}</td><td>${h.shoulder||0}/${h.neck||0}/${h.back||0}</td><td>${(Number(f.income||0)-Number(f.spent||0)).toLocaleString()} EGP</td></tr>`}).join("")||`<tr><td colspan="6" class="empty">${tr("NoHistory")}</td></tr>`}</tbody></table></div>`);
 document.querySelectorAll("[data-date]").forEach(b=>b.onclick=()=>{selectedDate=new Date(b.dataset.date+"T12:00:00");currentView="today";render()})
}
function analytics(root){
 const keys=Object.keys(state.days).sort().slice(-30), vals=keys.map(k=>state.days[k]);
 const avg=(arr)=>arr.length?Math.round(arr.reduce((a,b)=>a+b,0)/arr.length*10)/10:0;
 const sleep=avg(vals.map(x=>Number(x.sleep?.duration||0))), study=avg(vals.map(studyMinutes)), walk=avg(vals.map(x=>Number(x.activity?.walk||0)));
 const shoulder=avg(vals.map(x=>Number(x.health?.shoulder||0)));
 root.innerHTML=section(tr("Analytics"),`<div class="grid cards">
 ${metric(tr("Sleep"),sleep,tr("Average")+" h")}${metric(tr("StudyTime"),study,tr("Average")+" min")}
 ${metric(tr("Walking"),walk,tr("Average")+" min")}${metric(tr("Shoulder"),shoulder,tr("Average"))}
 </div><div class="card"><h3>${tr("DailyInsight")}</h3><p class="muted">Your dashboard becomes more useful as you record more days. Trends are calculated from your last 30 saved days.</p>
 <div class="table-wrap"><table><thead><tr><th>${tr("Date")}</th><th>${tr("Sleep")}</th><th>${tr("StudyTime")}</th><th>${tr("Walking")}</th><th>${tr("Shoulder")}</th></tr></thead><tbody>${keys.slice().reverse().map(k=>{const x=state.days[k];return `<tr><td>${k}</td><td>${x.sleep?.duration||0}</td><td>${studyMinutes(x)}</td><td>${x.activity?.walk||0}</td><td>${x.health?.shoulder||0}</td></tr>`}).join("")}</tbody></table></div></div>`);
}
document.querySelectorAll(".nav").forEach(b=>b.onclick=()=>{currentView=b.dataset.view;render()});
document.querySelector("#prev").onclick=()=>{selectedDate.setDate(selectedDate.getDate()-1);render()}
document.querySelector("#next").onclick=()=>{selectedDate.setDate(selectedDate.getDate()+1);render()}
document.querySelector("#jump").onclick=()=>{selectedDate=new Date();render()}
document.querySelector("#lang").onclick=()=>{state.settings.lang=state.settings.lang==="en"?"ar":"en";save();render()}
document.querySelector("#export").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="mohammed-life-system-backup.json";a.click();toast(tr("Exported"))}
document.querySelector("#import").onchange=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);localStorage.setItem(KEY,JSON.stringify(x));location.reload()}catch{alert("Invalid backup file")}};r.readAsText(file)}
render();
