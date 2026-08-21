const KEY="mls-v2";
const now=new Date();
let current=new Date();
let page="dashboard";
let state=load();
let timer=null;

function load(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY)||"{}");
    return Object.assign({
      settings:{lang:"ar",dark:false,sound:true,city:"دمياط الجديدة",country:"Egypt",method:5},
      days:{},tasks:[],events:[],habits:[],courses:[],assignments:[],exams:[],grades:[],notes:[],
      finance:{income:0,spent:0,items:[],target:0},body:{},hygiene:{},university:{semester:"",gpaTarget:0},
      pomodoro:{sessions:0,minutes:0},inbox:[]
    },x);
  }catch(e){return {}}
}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function key(d=current){const x=new Date(d);x.setHours(12,0,0,0);return x.toISOString().slice(0,10)}
function today(){return key(new Date())}
function day(){
  const k=key();
  if(!state.days[k])state.days[k]={sleep:{},prayer:{},activity:{water:0,walk:0,reading:0,screen:0},mood:5,energy:5,goals:["","",""],habits:{},journal:"",tasks:[]};
  return state.days[k];
}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function n(x){return Number(x||0)}
function toast(m){const e=document.getElementById("toast");e.textContent=m;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1400)}
function beep(){if(!state.settings.sound)return;try{const a=new AudioContext(),o=a.createOscillator(),g=a.createGain();o.frequency.value=660;g.gain.value=.04;o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.12)}catch(e){}}
function tr(ar,en){return state.settings.lang==="ar"?ar:en}
function saveRender(msg=tr("تم الحفظ","Saved")){save();beep();toast(msg);render()}

const nav=[
["dashboard","🏠",["الرئيسية","Dashboard"]],
["planner","🗓️",["المخطط","Planner"]],
["tasks","✅",["المهام","Tasks"]],
["university","🎓",["الجامعة","University"]],
["health","🩺",["الصحة والجسم","Health"]],
["hygiene","🧼",["النظافة الشخصية","Hygiene"]],
["habits","🔥",["العادات","Habits"]],
["finance","💰",["المال","Finance"]],
["focus","⏱️",["التركيز","Focus"]],
["analytics","📊",["التحليلات","Analytics"]],
["notes","📝",["الملاحظات","Notes"]],
["settings","⚙️",["الإعدادات","Settings"]]
];
function renderNav(){
 document.getElementById("nav").innerHTML=nav.map(x=>`<button class="nav-btn ${page===x[0]?"active":""}" data-page="${x[0]}"><span>${x[1]}</span>${tr(x[2][0],x[2][1])}</button>`).join("");
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{page=b.dataset.page;closeSide();render()});
}
function closeSide(){document.getElementById("sidebar").classList.remove("open")}
function section(title,body){return `<section class="section"><div class="section-title"><h2>${title}</h2></div>${body}</section>`}
function input(label,id,value="",type="text",extra=""){return `<label class="field">${label}<input id="${id}" type="${type}" value="${esc(value)}" ${extra}></label>`}
function select(label,id,value,opts){return `<label class="field">${label}<select id="${id}">${opts.map(o=>`<option value="${esc(o[0])}" ${String(value)===String(o[0])?"selected":""}>${esc(o[1])}</option>`).join("")}</select></label>`}
function button(label,id){return `<button class="primary" id="${id}">${label}</button>`}
function dayScore(d){
 const checks=[n(d.sleep?.duration)>=7,n(d.activity?.water)>=1.5,n(d.activity?.walk)>=20,n(d.activity?.reading)>=15,n(d.activity?.screen)<=6,Object.values(d.prayer||{}).filter(Boolean).length>=4,Object.values(d.habits||{}).filter(Boolean).length>=3,(d.tasks||[]).filter(x=>x.done).length>0];
 return Math.round(checks.filter(Boolean).length/checks.length*100)
}

function renderDashboard(){
 const d=day(),s=dayScore(d);
 const tasks=state.tasks.filter(t=>t.date===key()).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
 const upcoming=[...state.events].filter(e=>e.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
 document.getElementById("content").innerHTML=`
 <div class="card hero"><div><div class="eyebrow">☀️ ${tr("يوم جديد، فرصة جديدة","A new day, a new chance")}</div><h2>${s}%</h2><p>${tr("نسبة إنجاز اليوم","Today's balance")} · ${tasks.filter(x=>x.done).length}/${tasks.length} ${tr("مهام مكتملة","tasks done")}</p></div><div class="hero-ring" style="--score:${s}"><b>${s}%</b></div></div>
 <div class="grid grid-4" style="margin-top:15px">
 ${stat("😴",tr("النوم","Sleep"),d.sleep.duration||"—",tr("ساعة","hours"))}
 ${stat("💧",tr("المياه","Water"),d.activity.water||0,"L")}
 ${stat("🚶",tr("المشي","Walking"),d.activity.walk||0,tr("دقيقة","min"))}
 ${stat("📚",tr("المذاكرة","Study"),studyMinutesToday(),tr("دقيقة","min"))}
 </div>
 ${section(tr("خط زمني اليوم","Today's timeline"),`<div class="card">${timeline(tasks)}</div>`)}
 <div class="grid grid-2">
 ${section(tr("الصلاة","Prayer"),`<div class="card"><div class="check-grid">${["Fajr","Dhuhr","Asr","Maghrib","Isha"].map(p=>`<label class="check"><input type="checkbox" data-prayer="${p}" ${d.prayer[p]?"checked":""}>${p}</label>`).join("")}</div><p class="muted" id="prayerInfo">${tr("المدينة","City")}: ${esc(state.settings.city)} — <span id="prayerStatus">...</span></p></div>`)}
 ${section(tr("القادم","Coming up"),`<div class="card">${upcoming.length?upcoming.map(e=>`<div class="time-card" style="margin-bottom:8px"><b>${esc(e.title)}</b><small>${esc(e.date)} ${esc(e.time||"")}</small></div>`).join(""):`<div class="empty">${tr("لا توجد مواعيد قريبة","No upcoming events")}</div>`}</div>`)}
 </div>
 ${section(tr("أهداف اليوم","Today's goals"),`<div class="card"><div class="form-grid">${d.goals.map((g,i)=>input("#"+(i+1),"goal"+i,g)).join("")}</div>${button(tr("حفظ الأهداف","Save goals"),"saveGoals")}</div>`)}
 `;
 document.querySelectorAll("[data-prayer]").forEach(e=>e.onchange=()=>{d.prayer[e.dataset.prayer]=e.checked;saveRender()});
 document.getElementById("saveGoals").onclick=()=>{d.goals=d.goals.map((_,i)=>document.getElementById("goal"+i).value);saveRender()};
 fetchPrayer();
}
function stat(e,t,v,u){return `<div class="stat"><span class="emoji">${e}</span><small>${t}</small><strong>${esc(v)}</strong><small>${u}</small></div>`}
function timeline(tasks){
 if(!tasks.length)return `<div class="empty">${tr("لا توجد مهام مجدولة اليوم. استخدم + لإضافة مهمة.","No tasks scheduled today. Use + to add one.")}</div>`;
 return `<div class="timeline">${tasks.map(t=>`<div class="timeline-item"><div class="time">${esc(t.time||"--:--")}</div><div class="time-card"><b>${esc(t.title)}</b><small>${esc(t.category||tr("شخصي","Personal"))} · ${priorityBadge(t.priority)}</small></div></div>`).join("")}</div>`
}
function priorityBadge(p){return `<span class="badge ${p==="1"?"p1":p==="2"?"p2":"p3"}">${p==="1"?tr("عاجل","Urgent"):p==="2"?tr("مهم","Important"):tr("عادي","Normal")}</span>`}
function studyMinutesToday(){return state.days[today()]?.studyMinutes||0}

function renderTasks(){
 const list=[...state.tasks].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 document.getElementById("content").innerHTML=section(tr("إدارة المهام","Task management"),`<div class="card"><div class="form-grid">
 ${input(tr("المهمة","Task"),"taskTitle")} ${input(tr("التاريخ","Date"),"taskDate",today(),"date")} ${input(tr("الوقت","Time"),"taskTime","","time")}
 ${select(tr("الأولوية","Priority"),"taskPriority","2",[["1",tr("عاجل","Urgent")],["2",tr("مهم","Important")],["3",tr("عادي","Normal")]])}
 ${input(tr("التصنيف","Category"),"taskCat","شخصي")}
 </div>${button(tr("إضافة المهمة","Add task"),"addTask")}</div>
 <div class="card" style="margin-top:12px"><div class="table-wrap"><table class="table"><thead><tr><th>✓</th><th>${tr("المهمة","Task")}</th><th>${tr("التاريخ","Date")}</th><th>${tr("الوقت","Time")}</th><th>${tr("الأولوية","Priority")}</th><th></th></tr></thead><tbody>${list.length?list.map((t,i)=>`<tr><td><input type="checkbox" data-taskdone="${t.id}" ${t.done?"checked":""}></td><td>${esc(t.title)}</td><td>${t.date}</td><td>${t.time||""}</td><td>${priorityBadge(t.priority)}</td><td><button class="danger" data-deltask="${t.id}">حذف</button></td></tr>`).join(""):`<tr><td colspan="6" class="empty">${tr("لا توجد مهام","No tasks")}</td></tr>`}</tbody></table></div></div>`);
 document.getElementById("addTask").onclick=()=>{const t={id:crypto.randomUUID(),title:document.getElementById("taskTitle").value,date:document.getElementById("taskDate").value,time:document.getElementById("taskTime").value,priority:document.getElementById("taskPriority").value,category:document.getElementById("taskCat").value,done:false};if(!t.title)return toast(tr("اكتب اسم المهمة","Enter a task"));state.tasks.push(t);saveRender()};
 document.querySelectorAll("[data-taskdone]").forEach(e=>e.onchange=()=>{const t=state.tasks.find(x=>x.id===e.dataset.taskdone);t.done=e.checked;saveRender()});
 document.querySelectorAll("[data-deltask]").forEach(e=>e.onclick=()=>{state.tasks=state.tasks.filter(x=>x.id!==e.dataset.deltask);saveRender()});
}

function renderPlanner(){
 const d=new Date(current.getFullYear(),current.getMonth(),1), first=d.getDay(), days=new Date(current.getFullYear(),current.getMonth()+1,0).getDate();
 const cells=[];for(let i=0;i<first;i++)cells.push(`<div class="cal-day muted"></div>`);
 for(let i=1;i<=days;i++){const k=key(new Date(current.getFullYear(),current.getMonth(),i));const count=state.tasks.filter(t=>t.date===k).length+state.events.filter(e=>e.date===k).length;cells.push(`<div class="cal-day ${k===today()?"today":""}" data-date="${k}"><b>${i}</b>${count?'<span class="dot"></span>'.repeat(Math.min(4,count)):""}</div>`)}
 document.getElementById("content").innerHTML=section(`${tr("تقويم","Calendar")} — ${current.toLocaleDateString(state.settings.lang==="ar"?"ar-EG":"en-US",{month:"long",year:"numeric"})}`,`<div class="card"><div class="calendar">${["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"].map(x=>`<div class="cal-head">${state.settings.lang==="ar"?x:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"].indexOf(x)]}</div>`).join("")}${cells.join("")}</div></div>
 ${section(tr("مواعيد مستقبلية","Future schedule"),`<div class="card"><div class="form-grid">${input(tr("العنوان","Title"),"eventTitle")}${input(tr("التاريخ","Date"),"eventDate",today(),"date")}${input(tr("الوقت","Time"),"eventTime","","time")}${input(tr("المكان","Location"),"eventLocation")}</div>${button(tr("إضافة موعد","Add event"),"addEvent")}</div>
 <div class="card" style="margin-top:10px">${state.events.filter(e=>e.date>=today()).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).map(e=>`<div class="time-card" style="margin-bottom:8px"><b>${esc(e.title)}</b><small>${e.date} ${e.time||""} · ${esc(e.location||"")}</small></div>`).join("")||`<div class="empty">${tr("لا توجد مواعيد","No events")}</div>`}</div>`)}`);
 document.getElementById("addEvent").onclick=()=>{const e={id:crypto.randomUUID(),title:document.getElementById("eventTitle").value,date:document.getElementById("eventDate").value,time:document.getElementById("eventTime").value,location:document.getElementById("eventLocation").value};if(!e.title)return;state.events.push(e);saveRender()};
}

function renderUniversity(){
 const courses=state.courses;
 document.getElementById("content").innerHTML=`
 ${section("🎓 "+tr("الجامعة","University"),`<div class="card"><div class="form-grid">
 ${input(tr("الفصل الدراسي","Semester"),"semester",state.university.semester)} ${input(tr("الهدف التراكمي GPA","GPA target"),"gpaTarget",state.university.gpaTarget,"number","step='0.01'")} ${input(tr("بداية الترم","Semester start"),"semesterStart","","date")} ${input(tr("نهاية الترم","Semester end"),"Semester end","","date")}
 </div>${button(tr("حفظ إعدادات الجامعة","Save university settings"),"saveUni")}</div>`)}
 ${section(tr("المواد والجدول الأسبوعي","Courses & timetable"),`<div class="card"><div class="form-grid">
 ${input(tr("اسم المادة","Course"),"courseName")} ${input(tr("الدكتور","Instructor"),"courseTeacher")} ${input(tr("المكان","Room"),"courseRoom")}
 ${select(tr("اليوم","Day"),"courseDay","0",[["0","السبت"],["1","الأحد"],["2","الاثنين"],["3","الثلاثاء"],["4","الأربعاء"],["5","الخميس"],["6","الجمعة"]])}
 ${input(tr("من","Start"),"courseStart","","time")} ${input(tr("إلى","End"),"courseEnd","","time")}
 </div>${button(tr("إضافة مادة","Add course"),"addCourse")}</div>
 <div class="card" style="margin-top:10px"><div class="table-wrap"><table class="table"><thead><tr><th>${tr("المادة","Course")}</th><th>${tr("الدكتور","Instructor")}</th><th>${tr("اليوم","Day")}</th><th>${tr("الوقت","Time")}</th><th>${tr("المكان","Room")}</th><th></th></tr></thead><tbody>${courses.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.teacher)}</td><td>${["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"][c.day]}</td><td>${c.start}–${c.end}</td><td>${esc(c.room)}</td><td><button class="danger" data-delcourse="${c.id}">حذف</button></td></tr>`).join("")||`<tr><td colspan="6" class="empty">${tr("أضف مواد الترم الحالي هنا","Add your current-term courses here")}</td></tr>`}</tbody></table></div></div>`)}
 ${section("📝 "+tr("الواجبات والمشاريع","Assignments & projects"),universityAssignmentForm())}
 ${section("🧪 "+tr("الامتحانات","Exams"),universityExamForm())}
 ${section("📈 "+tr("الدرجات و GPA","Grades & GPA"),gradesForm())}
 `;
 document.getElementById("saveUni").onclick=()=>{state.university.semester=document.getElementById("semester").value;state.university.gpaTarget=n(document.getElementById("gpaTarget").value);saveRender()};
 document.getElementById("addCourse").onclick=()=>{const c={id:crypto.randomUUID(),name:document.getElementById("courseName").value,teacher:document.getElementById("courseTeacher").value,room:document.getElementById("courseRoom").value,day:document.getElementById("courseDay").value,start:document.getElementById("courseStart").value,end:document.getElementById("courseEnd").value};if(!c.name)return;state.courses.push(c);saveRender()};
 document.querySelectorAll("[data-delcourse]").forEach(b=>b.onclick=()=>{state.courses=state.courses.filter(x=>x.id!==b.dataset.delcourse);saveRender()});
 document.getElementById("addAssignment").onclick=()=>{state.assignments.push({id:crypto.randomUUID(),course:document.getElementById("aCourse").value,title:document.getElementById("aTitle").value,due:document.getElementById("aDue").value,weight:n(document.getElementById("aWeight").value),status:"todo"});saveRender()};
 document.getElementById("addExam").onclick=()=>{state.exams.push({id:crypto.randomUUID(),course:document.getElementById("eCourse").value,title:document.getElementById("eTitle").value,date:document.getElementById("eDate").value});saveRender()};
 document.getElementById("addGrade").onclick=()=>{state.grades.push({id:crypto.randomUUID(),course:document.getElementById("gCourse").value,name:document.getElementById("gName").value,score:n(document.getElementById("gScore").value),max:n(document.getElementById("gMax").value)||100,weight:n(document.getElementById("gWeight").value)||1});saveRender()};
}
function universityAssignmentForm(){return `<div class="card"><div class="form-grid">${input("المادة","aCourse")}${input("الواجب/المشروع","aTitle")}${input("الموعد النهائي","aDue","","date")}${input("الوزن %","aWeight","","number")}</div>${button("إضافة واجب","addAssignment")}<div class="table-wrap" style="margin-top:10px"><table class="table"><thead><tr><th>المادة</th><th>المهمة</th><th>الموعد</th><th>الوزن</th></tr></thead><tbody>${state.assignments.map(a=>`<tr><td>${esc(a.course)}</td><td>${esc(a.title)}</td><td>${a.due}</td><td>${a.weight}%</td></tr>`).join("")||`<tr><td colspan="4" class="empty">لا توجد واجبات</td></tr>`}</tbody></table></div></div>`}
function universityExamForm(){return `<div class="card"><div class="form-grid">${input("المادة","eCourse")}${input("اسم الامتحان","eTitle")}${input("التاريخ","eDate","","date")}</div>${button("إضافة امتحان","addExam")}<div class="grid grid-3" style="margin-top:10px">${state.exams.map(e=>`<div class="stat">📅<b>${esc(e.title)}</b><small>${esc(e.course)} · ${e.date}</small></div>`).join("")||`<div class="empty">لا توجد امتحانات</div>`}</div></div>`}
function gradesForm(){const total=state.grades.reduce((a,g)=>a+n(g.weight),0)||1,avg=state.grades.reduce((a,g)=>a+(n(g.score)/n(g.max||100))*n(g.weight),0)/total*100;return `<div class="card"><div class="form-grid">${input("المادة","gCourse")}${input("الاختبار","gName")}${input("الدرجة","gScore","","number")}${input("من","gMax",100,"number")}${input("الوزن","gWeight",1,"number")}</div>${button("إضافة درجة","addGrade")}<div class="stat" style="margin-top:10px"><small>المتوسط الحالي</small><strong>${avg.toFixed(1)}%</strong></div><div class="table-wrap"><table class="table"><thead><tr><th>المادة</th><th>الاختبار</th><th>الدرجة</th><th>الوزن</th></tr></thead><tbody>${state.grades.map(g=>`<tr><td>${esc(g.course)}</td><td>${esc(g.name)}</td><td>${g.score}/${g.max}</td><td>${g.weight}</td></tr>`).join("")}</tbody></table></div></div>`}

const bodyParts=["الرأس","العينان","الأذنان","الأنف","الفك","الرقبة","الكتف الأيمن","الكتف الأيسر","الذراع الأيمن","الذراع الأيسر","المرفق الأيمن","المرفق الأيسر","الرسغ الأيمن","الرسغ الأيسر","اليد اليمنى","اليد اليسرى","الصدر","أعلى الظهر","أسفل الظهر","البطن","الحوض","الفخذ الأيمن","الفخذ الأيسر","الركبة اليمنى","الركبة اليسرى","الساق اليمنى","الساق اليسرى","الكاحل الأيمن","الكاحل الأيسر","القدم اليمنى","القدم اليسرى"];
function renderHealth(){
 document.getElementById("content").innerHTML=section("🩺 "+tr("الصحة والجسم","Health & body"),`<div class="card"><p class="muted">${tr("سجل شدة أي عرض من 0 إلى 10 مع ملاحظة اختيارية. هذا سجل متابعة وليس تشخيصًا طبيًا.","Record symptoms from 0 to 10 with optional notes. Tracking only, not medical diagnosis.")}</p><div class="health-grid">${bodyParts.map((p,i)=>`<div class="body-part"><b>${p}</b><small>0–10</small><input class="pain" type="range" min="0" max="10" value="${n(state.body[p]?.pain)}" data-body="${esc(p)}"><output>${n(state.body[p]?.pain)}</output></div>`).join("")}</div></div>`);
 document.querySelectorAll("[data-body]").forEach(e=>e.oninput=()=>{state.body[e.dataset.body]={pain:n(e.value),date:today()};e.nextElementSibling.value=e.value;save()});
}

const hygieneItems=["الاستحمام","غسل الأسنان صباحًا","غسل الأسنان مساءً","الخيط الطبي","غسل الوجه","العناية بالبشرة","الشعر","الأظافر","العطر/مزيل العرق","تغيير الملابس","ترتيب الغرفة","ترتيب المكتب"];
function renderHygiene(){
 const d=state.days[today()]?.hygiene||{};
 document.getElementById("content").innerHTML=section("🧼 "+tr("النظافة الشخصية","Personal hygiene"),`<div class="card"><div class="check-grid">${hygieneItems.map((x,i)=>`<label class="check"><input type="checkbox" data-hyg="${i}" ${d[i]?"checked":""}>${x}</label>`).join("")}</div><div style="margin-top:12px"><div class="progress"><i id="hygProgress" style="width:${Object.values(d).filter(Boolean).length/hygieneItems.length*100}%"></i></div></div></div>`);
 if(!state.days[today()])day();
 state.days[today()].hygiene=d;
 document.querySelectorAll("[data-hyg]").forEach(e=>e.onchange=()=>{state.days[today()].hygiene[e.dataset.hyg]=e.checked;save();document.getElementById("hygProgress").style.width=Object.values(state.days[today()].hygiene).filter(Boolean).length/hygieneItems.length*100+"%";beep()});
}

function renderHabits(){
 document.getElementById("content").innerHTML=section("🔥 "+tr("العادات","Habits"),`<div class="card"><div class="form-grid">${input("اسم العادة","habitName")}${select("التكرار","habitFreq","daily",[["daily","يومي"],["weekly","أسبوعي"]])}</div>${button("إضافة عادة","addHabit")}</div>
 <div class="grid grid-3" style="margin-top:12px">${state.habits.map(h=>{const done=!!state.days[today()]?.habits?.[h.id];return `<div class="card"><b>${esc(h.name)}</b><small class="muted">${h.freq}</small><label class="check" style="margin-top:10px"><input type="checkbox" data-habit="${h.id}" ${done?"checked":""}>${done?"مكتملة":"تسجيل اليوم"}</label></div>`}).join("")||`<div class="empty">أضف أول عادة لك.</div>`}</div>`);
 if(!state.days[today()])day();
 document.getElementById("addHabit").onclick=()=>{const name=document.getElementById("habitName").value;if(!name)return;state.habits.push({id:crypto.randomUUID(),name,freq:document.getElementById("habitFreq").value});saveRender()};
 document.querySelectorAll("[data-habit]").forEach(e=>e.onchange=()=>{state.days[today()].habits[e.dataset.habit]=e.checked;saveRender()});
}

function renderFinance(){
 const f=state.finance, net=n(f.income)-n(f.spent), pct=f.target?Math.min(100,Math.round(net/f.target*100)):0;
 document.getElementById("content").innerHTML=section("💰 "+tr("المال","Finance"),`<div class="card"><div class="form-grid">${input("الدخل","income",f.income,"number")}${input("المصروف","spent",f.spent,"number")}${input("هدف الادخار","target",f.target,"number")}</div><div class="progress" style="margin:12px 0"><i style="width:${pct}%"></i></div><div class="row"><b>${pct}%</b><span class="muted">المدخر: ${net.toLocaleString()} · المتبقي: ${Math.max(0,f.target-net).toLocaleString()}</span></div>${button("حفظ","saveFinance")}</div>
 ${section("➕ إضافة مصروف",`<div class="card"><div class="form-grid">${input("التصنيف","expCat")}${input("المبلغ","expAmount","","number")}${input("الوصف","expDesc")}</div>${button("إضافة","addExpense")}</div>`)}
 <div class="card"><div class="table-wrap"><table class="table"><thead><tr><th>التاريخ</th><th>التصنيف</th><th>الوصف</th><th>المبلغ</th></tr></thead><tbody>${(f.items||[]).map(x=>`<tr><td>${x.date}</td><td>${esc(x.cat)}</td><td>${esc(x.desc)}</td><td>${n(x.amount).toLocaleString()}</td></tr>`).join("")||`<tr><td colspan="4" class="empty">لا توجد مصروفات</td></tr>`}</tbody></table></div></div>`);
 document.getElementById("saveFinance").onclick=()=>{f.income=n(document.getElementById("income").value);f.spent=n(document.getElementById("spent").value);f.target=n(document.getElementById("target").value);saveRender()};
 document.getElementById("addExpense").onclick=()=>{const amount=n(document.getElementById("expAmount").value);if(!amount)return;f.spent+=amount;f.items.push({date:today(),cat:document.getElementById("expCat").value,desc:document.getElementById("expDesc").value,amount});saveRender()};
}

function renderFocus(){
 document.getElementById("content").innerHTML=section("⏱️ "+tr("التركيز","Focus"),`<div class="card" style="text-align:center"><div id="timer" style="font-size:72px;font-weight:900">25:00</div><p class="muted">${tr("Pomodoro — جلسة تركيز 25 دقيقة","Pomodoro — 25 minute focus session")}</p>${button("▶️ ابدأ","startTimer")} <button class="soft-btn" id="resetTimer">إعادة</button></div>
 <div class="grid grid-3" style="margin-top:12px">${stat("⏱️","الجلسات",state.pomodoro.sessions,"sessions")}${stat("⌛","الدقائق",state.pomodoro.minutes,"min")}${stat("🎯","الهدف","25","min")}</div>`);
 document.getElementById("startTimer").onclick=startTimer;document.getElementById("resetTimer").onclick=()=>{clearInterval(timer);document.getElementById("timer").textContent="25:00"};
}
function startTimer(){clearInterval(timer);let sec=25*60;const el=document.getElementById("timer");timer=setInterval(()=>{sec--;el.textContent=`${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;if(sec<=0){clearInterval(timer);state.pomodoro.sessions++;state.pomodoro.minutes+=25;save();beep();toast("🎉 أحسنت! انتهت جلسة التركيز");}},1000)}

function renderAnalytics(){
 const ds=Object.values(state.days), avgSleep=ds.length?ds.reduce((a,d)=>a+n(d.sleep?.duration),0)/ds.length:0, avgWater=ds.length?ds.reduce((a,d)=>a+n(d.activity?.water),0)/ds.length:0;
 document.getElementById("content").innerHTML=`<div class="grid grid-3">${stat("📅",tr("أيام مسجلة","Recorded days"),ds.length,"days")}${stat("😴",tr("متوسط النوم","Avg sleep"),avgSleep.toFixed(1),"h")}${stat("💧",tr("متوسط المياه","Avg water"),avgWater.toFixed(1),"L")}</div>${section("📌 "+tr("مصفوفة الأولويات","Priority matrix"),`<div class="card"><div class="matrix"><div class="quadrant q1"><h3>🔥 ${tr("عاجل ومهم","Urgent & important")}</h3><p class="muted">${tr("نفّذ الآن","Do now")}</p></div><div class="quadrant q2"><h3>⭐ ${tr("مهم وغير عاجل","Important, not urgent")}</h3><p class="muted">${tr("خطط له","Schedule")}</p></div><div class="quadrant q3"><h3>⚡ ${tr("عاجل وغير مهم","Urgent, not important")}</h3><p class="muted">${tr("فوّض/اختصر","Delegate")}</p></div><div class="quadrant q4"><h3>🧹 ${tr("غير مهم وغير عاجل","Neither")}</h3><p class="muted">${tr("احذفه","Eliminate")}</p></div></div></div>`)}
 ${section(tr("تقدم آخر 7 أيام","Last 7 days"),`<div class="card">${[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const x=state.days[key(d)];const s=x?dayScore(x):0;return `<div style="display:flex;align-items:center;gap:10px;margin:8px 0"><span style="width:85px">${d.toLocaleDateString("ar-EG",{weekday:"short"})}</span><div class="progress" style="flex:1"><i style="width:${s}%"></i></div><b>${s}%</b></div>`}).join("")}</div>`)}
 `;
}

function renderNotes(){
 document.getElementById("content").innerHTML=section("📝 "+tr("الملاحظات","Notes"),`<div class="card"><div class="form-grid">${input("العنوان","noteTitle")}</div><label class="field" style="margin-top:10px">المحتوى<textarea id="noteBody"></textarea></label>${button("حفظ الملاحظة","addNote")}</div><div class="grid grid-2" style="margin-top:12px">${state.notes.map(x=>`<div class="card"><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p><small class="muted">${x.date}</small></div>`).join("")||`<div class="empty">لا توجد ملاحظات</div>`}</div>`);
 document.getElementById("addNote").onclick=()=>{const title=document.getElementById("noteTitle").value,body=document.getElementById("noteBody").value;if(!title&&!body)return;state.notes.push({id:crypto.randomUUID(),title,body,date:today()});saveRender()};
}

function renderSettings(){
 const s=state.settings;
 document.getElementById("content").innerHTML=section("⚙️ "+tr("الإعدادات","Settings"),`<div class="card"><div class="form-grid">
 ${select(tr("اللغة","Language"),"setLang",s.lang,[["ar","العربية"],["en","English"]])}
 ${input(tr("المدينة","City"),"setCity",s.city)}
 ${input(tr("الدولة","Country"),"setCountry",s.country)}
 ${select(tr("طريقة حساب الصلاة","Prayer method"),"setMethod",s.method,[["5","Egyptian General Authority of Survey"],["3","Muslim World League"],["4","Umm Al-Qura"]])}
 </div><label class="check" style="margin-top:10px"><input type="checkbox" id="setDark" ${s.dark?"checked":""}>🌙 ${tr("الوضع الليلي","Dark mode")}</label><label class="check" style="margin-top:10px"><input type="checkbox" id="setSound" ${s.sound?"checked":""}>🔊 ${tr("أصوات التفاعل","Interaction sounds")}</label>${button(tr("حفظ الإعدادات","Save settings"),"saveSettings")}</div>
 ${section("📍 "+tr("اختيار المدينة","City picker"),`<div class="card"><p class="muted">${tr("اختر مدينة من القائمة أو اسمح للموقع بتحديدها تلقائيًا.","Choose a city or let your location determine it.")}</p><div class="form-grid"><select id="citySelect">${["دمياط الجديدة","دمياط","المنصورة","القاهرة","الإسكندرية","طنطا","بورسعيد","الجيزة","المنوفية","الإسماعيلية"].map(c=>`<option ${c===s.city?"selected":""}>${c}</option>`).join("")}</select><button class="primary" id="useLocation">📍 استخدام موقعي</button></div></div>`)}
 `);
 document.getElementById("saveSettings").onclick=()=>{s.lang=document.getElementById("setLang").value;s.city=document.getElementById("setCity").value;s.country=document.getElementById("setCountry").value;s.method=n(document.getElementById("setMethod").value);s.dark=document.getElementById("setDark").checked;s.sound=document.getElementById("setSound").checked;applyTheme();saveRender()};
 document.getElementById("citySelect").onchange=e=>{s.city=e.target.value;save();toast("📍 "+s.city);};
 document.getElementById("useLocation").onclick=()=>{if(!navigator.geolocation)return toast("المتصفح لا يدعم الموقع");navigator.geolocation.getCurrentPosition(async pos=>{try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=ar`);const j=await r.json();s.city=j.address.city||j.address.town||j.address.village||s.city;save();toast("📍 "+s.city);render()}catch(e){toast("تعذر تحديد المدينة")}},()=>toast("اسمح للموقع من إعدادات المتصفح"))}
}
function applyTheme(){document.body.classList.toggle("dark",!!state.settings.dark)}
async function fetchPrayer(){
 const info=document.getElementById("prayerStatus");if(!info)return;
 try{const d=key();const r=await fetch(`https://api.aladhan.com/v1/timingsByCity/${d}?city=${encodeURIComponent(state.settings.city)}&country=${encodeURIComponent(state.settings.country)}&method=${state.settings.method}`);const j=await r.json();if(j.code===200){const t=j.data.timings;info.textContent=`الفجر ${t.Fajr} · الظهر ${t.Dhuhr} · العصر ${t.Asr} · المغرب ${t.Maghrib} · العشاء ${t.Isha}`}}catch(e){info.textContent=tr("تعذر جلب المواقيت الآن","Prayer times unavailable")}}
function renderHygieneDayData(){}

function render(){
 applyTheme();renderNav();
 const titles={dashboard:["نظامك الشخصي","لوحة اليوم","كل ما يهمك في مكان واحد."],planner:["التخطيط","المخطط","شوف وقتك قبل ما يضيع."],tasks:["الإنتاجية","المهام","رتّب، نفّذ، وأنجز."],university:["الدراسة","الجامعة","المحاضرات والواجبات والامتحانات والدرجات."],health:["العناية","الصحة والجسم","تابع جسمك بالكامل بدل ما تتابع جزء واحد."],hygiene:["العناية اليومية","النظافة الشخصية","روتينك اليومي في مكان واحد."],habits:["التطوير","العادات","ابنِ الاستمرارية يومًا بعد يوم."],finance:["الاستقلال","المال","اعرف فلوسك رايحة فين وهدفك فين."],focus:["الإنتاجية","التركيز","جلسات تركيز بدون تعقيد."],analytics:["الصورة الكبيرة","التحليلات","شوف تقدمك بدل ما تعتمد على الإحساس."],notes:["ذاكرتك الثانية","الملاحظات","أفكارك وملاحظاتك المهمة."],settings:["النظام","الإعدادات","تحكم في الشكل والصوت واللغة والموقع."]};
 const h=titles[page]||titles.dashboard;document.getElementById("pageEyebrow").textContent=tr(h[0],h[0]);document.getElementById("pageTitle").textContent=tr(h[1],h[1]);document.getElementById("pageSubtitle").textContent=tr(h[2],h[2]);
 document.getElementById("topDate").textContent=new Date().toLocaleDateString(state.settings.lang==="ar"?"ar-EG":"en-US",{weekday:"short",month:"short",day:"numeric"});
 ({dashboard:renderDashboard,planner:renderPlanner,tasks:renderTasks,university:renderUniversity,health:renderHealth,hygiene:renderHygiene,habits:renderHabits,finance:renderFinance,focus:renderFocus,analytics:renderAnalytics,notes:renderNotes,settings:renderSettings}[page]||renderDashboard)();
}
document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("quickBtn").onclick=()=>{document.getElementById("drawer").classList.add("open");document.getElementById("quickForm").innerHTML=""};
document.getElementById("closeDrawer").onclick=()=>document.getElementById("drawer").classList.remove("open");
document.getElementById("prevDay").onclick=()=>{current.setDate(current.getDate()-1);render()};
document.getElementById("nextDay").onclick=()=>{current.setDate(current.getDate()+1);render()};
document.getElementById("todayBtn").onclick=()=>{current=new Date();render()};
document.getElementById("themeBtn").onclick=()=>{state.settings.dark=!state.settings.dark;save();applyTheme();render()};
document.getElementById("soundBtn").onclick=()=>{state.settings.sound=!state.settings.sound;save();render()};
document.getElementById("langBtn").onclick=()=>{state.settings.lang=state.settings.lang==="ar"?"en":"ar";document.documentElement.dir=state.settings.lang==="ar"?"rtl":"ltr";document.documentElement.lang=state.settings.lang;save();render()};
document.getElementById("exportBtn").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download=`mohammed-life-${today()}.json`;a.click()};
document.getElementById("importInput").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{state=JSON.parse(r.result);save();render();toast("تم استيراد البيانات")}catch(x){toast("ملف غير صالح")}};r.readAsText(f)};
document.querySelectorAll("[data-quick]").forEach(b=>b.onclick=()=>{const type=b.dataset.quick;document.getElementById("quickForm").innerHTML=`<div class="card" style="margin-top:12px">${input("العنوان","qTitle")}${input("التاريخ","qDate",today(),"date")}${input("الوقت","qTime","","time")}${button("حفظ","qSave")}</div>`;document.getElementById("qSave").onclick=()=>{const title=document.getElementById("qTitle").value;if(!title)return;const date=document.getElementById("qDate").value;const time=document.getElementById("qTime").value;if(type==="task")state.tasks.push({id:crypto.randomUUID(),title,date,time,priority:"2",category:"سريع",done:false});else if(type==="event")state.events.push({id:crypto.randomUUID(),title,date,time});else if(type==="expense"){state.finance.spent+=n(title);state.finance.items.push({date,cat:"سريع",desc:"مصروف سريع",amount:n(title)})}else if(type==="habit")state.habits.push({id:crypto.randomUUID(),name:title,freq:"daily"});else if(type==="study"){state.days[date]=state.days[date]||day();state.days[date].studyMinutes=n(title)}else state.body[title]={pain:5,date};save();document.getElementById("drawer").classList.remove("open");toast("تمت الإضافة");render()}});

document.documentElement.dir=state.settings.lang==="ar"?"rtl":"ltr";
document.documentElement.lang=state.settings.lang;
render();
