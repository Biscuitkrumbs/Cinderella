const $ = (sel) => document.querySelector(sel);
const state = {
  weekOffset: 0,
  properties: [],
  bookings: [],
  notes: [],
  selectedNoteType: "Note"
};
const colours = ["#7457e8", "#15a267", "#2276d2", "#f28b20", "#ef4865", "#23a6ad"];

function isoDate(d){ return d.toISOString().slice(0,10); }
function parseDate(s){ const [y,m,d]=String(s).split('-').map(Number); return new Date(y,m-1,d); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function startOfWeek(d){ const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
function daysBetween(a,b){ return Math.round((parseDate(b)-parseDate(a))/86400000); }
function bookingNights(b){ return Math.max(1, daysBetween(b.checkIn,b.checkOut)); }
function todayIso(){ return isoDate(new Date()); }
function uid(prefix){ return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`; }

function defaultData(){
  const mon = startOfWeek(new Date());
  const d = (n)=>isoDate(addDays(mon,n));
  state.properties = [
    {id:"p1", name:"Ocean View", colour:colours[1], notes:""},
    {id:"p2", name:"Riverfront", colour:colours[0], notes:""},
    {id:"p3", name:"White House", colour:colours[3], notes:""},
    {id:"p4", name:"Beachside", colour:colours[4], notes:""},
    {id:"p5", name:"Mountain Retreat", colour:colours[2], notes:""},
    {id:"p6", name:"Sunset Villa", colour:colours[1], notes:""},
    {id:"p7", name:"Lakeside", colour:colours[0], notes:""},
    {id:"p8", name:"Pine Cottage", colour:colours[3], notes:""}
  ];
  state.bookings = [
    {id:"b1", propertyId:"p1", guest:"Emma & Nick", checkIn:d(0), checkOut:d(2), status:"active", notes:""},
    {id:"b2", propertyId:"p1", guest:"Jake & Sarah", checkIn:d(3), checkOut:d(6), status:"active", notes:""},
    {id:"b3", propertyId:"p2", guest:"Michael", checkIn:d(1), checkOut:d(3), status:"active", notes:""},
    {id:"b4", propertyId:"p2", guest:"Olivia", checkIn:d(5), checkOut:d(6), status:"active", notes:""},
    {id:"b5", propertyId:"p3", guest:"Daniel & Claire", checkIn:d(2), checkOut:d(4), status:"active", notes:""},
    {id:"b6", propertyId:"p4", guest:"Sophie", checkIn:d(4), checkOut:d(6), status:"active", notes:""},
    {id:"b7", propertyId:"p5", guest:"Chris & Pat", checkIn:d(1), checkOut:d(7), status:"active", notes:""},
    {id:"b8", propertyId:"p6", guest:"Aaron & Jess", checkIn:d(1), checkOut:d(3), status:"active", notes:""}
  ];
}

async function api(action, payload={}){
  if(!SCRIPT_URL || SCRIPT_URL.includes("PASTE")) throw new Error("Missing Apps Script URL in config.js");
  const res = await fetch(SCRIPT_URL, {method:"POST", body:JSON.stringify({action, ...payload})});
  return await res.json();
}
async function loadData(){
  try{
    const data = await api("getData");
    if(data.ok){
      state.properties = data.properties || [];
      state.bookings = data.bookings || [];
      state.notes = data.notes || [];
    }
    if(!state.properties.length && !state.bookings.length){ defaultData(); await saveAll(false); }
  }catch(e){
    const cached = localStorage.getItem("cindyPlannerData");
    if(cached){ Object.assign(state, JSON.parse(cached)); }
    else defaultData();
    toast("Offline/demo data loaded");
  }
  render();
}
async function saveAll(show=true){
  localStorage.setItem("cindyPlannerData", JSON.stringify({properties:state.properties, bookings:state.bookings, notes:state.notes}));
  try{ await api("saveData", {properties:state.properties, bookings:state.bookings, notes:state.notes}); if(show) toast("Saved"); }
  catch(e){ if(show) toast("Saved on this phone. Check Apps Script setup."); }
}

function render(){ renderHeader(); renderPlanner(); renderToday(); }
function renderHeader(){
  const name = APP_SETTINGS?.cleanerName || "Cindy";
  $("#greeting").textContent = `Good morning ${name} 👋`;
  const todays = dueToday(); const done = todays.filter(b=>b.status==="done").length;
  $("#todaySummary").textContent = `You have ${todays.length} clean${todays.length===1?"":"s"} today`;
  $("#progressText").textContent = `${done} of ${todays.length}`;
  const pct = todays.length ? Math.round(done/todays.length*100) : 100;
  $("#progressRing").style.background = `conic-gradient(var(--purple) ${pct*3.6}deg,#edeaf7 0deg)`;
  $("#progressRing span").textContent = `${pct}%`;
  const next = todays.find(b=>b.status!=="done");
  $("#nextProperty").textContent = next ? propertyName(next.propertyId) : "All clear";
  $("#nextGuest").textContent = next ? `${next.guest} · checkout ${APP_SETTINGS.checkoutTime}` : "Nice work";
}
function weekDays(){ const start=addDays(startOfWeek(new Date()), state.weekOffset*7); return Array.from({length:7},(_,i)=>addDays(start,i)); }
function renderPlanner(){
  const grid=$("#plannerGrid"); grid.innerHTML=""; const days=weekDays();
  $("#weekLabel").textContent = `${days[0].toLocaleDateString('en-AU',{day:'numeric',month:'short'})} – ${days[6].toLocaleDateString('en-AU',{day:'numeric',month:'short'})}`;
  grid.appendChild(cell("", "cell day-head"));
  days.forEach(day=>{
    const load = cleanCountForDate(isoDate(day));
    const c = cell(`<span class="dow">${day.toLocaleDateString('en-AU',{weekday:'short'})}</span><span class="date">${day.getDate()}</span><span class="load">${load} clean${load===1?'':'s'}</span>`, `cell day-head ${load>=4?'full':load>=2?'busy':''}`);
    grid.appendChild(c);
  });
  state.properties.forEach((p,idx)=>{
    const pc=cell(`<span class="home-dot" style="color:${p.colour};background:${p.colour}18">⌂</span><span>${p.name}</span>`, "cell property-cell"); grid.appendChild(pc);
    days.forEach(day=>{
      const c=cell("", "cell"); c.dataset.propertyId=p.id; c.dataset.date=isoDate(day); grid.appendChild(c);
    });
  });
  requestAnimationFrame(()=>placeBookings(grid, days));
}
function placeBookings(grid, days){
  const weekStart=isoDate(days[0]), weekEnd=isoDate(addDays(days[6],1));
  const rows = [...grid.children];
  state.bookings.filter(b=>b.checkOut>weekStart && b.checkIn<weekEnd).forEach(b=>{
    const propIndex = state.properties.findIndex(p=>p.id===b.propertyId); if(propIndex<0) return;
    const start = Math.max(0, daysBetween(weekStart,b.checkIn));
    const end = Math.min(7, daysBetween(weekStart,b.checkOut));
    const rowStart = 8 + propIndex*8;
    const startCell = rows[rowStart + start]; if(!startCell) return;
    const el=document.createElement("button");
    const due = b.checkOut === todayIso() && b.status !== "done";
    el.className=`booking ${b.status==='done'?'done':due?'due':'future'}`;
    el.style.width = `calc(${(end-start)*100}% + ${(end-start-1)}px)`;
    el.style.color = due ? "var(--red)" : (b.status==='done'?"var(--green)":propertyColour(b.propertyId));
    el.innerHTML=`<small>${bookingNights(b)} night${bookingNights(b)===1?'':'s'}</small><strong>${b.guest}</strong>`;
    el.addEventListener("click",()=>openBooking(b));
    startCell.appendChild(el);
  });
}
function cell(html, cls){ const d=document.createElement("div"); d.className=cls; d.innerHTML=html; return d; }
function propertyName(id){ return state.properties.find(p=>p.id===id)?.name || "Unknown"; }
function propertyColour(id){ return state.properties.find(p=>p.id===id)?.colour || colours[0]; }
function cleanCountForDate(date){ return state.bookings.filter(b=>b.checkOut===date).length; }
function dueToday(){ return state.bookings.filter(b=>b.checkOut===todayIso()).sort((a,b)=>propertyName(a.propertyId).localeCompare(propertyName(b.propertyId))); }
function renderToday(){
  const list=$("#todayList"); list.innerHTML=""; const todays=dueToday(); const done=todays.filter(b=>b.status==="done").length;
  $("#todayCount").textContent = `${todays.length} clean${todays.length===1?'':'s'}`;
  if(!todays.length){ list.innerHTML=`<div class="today-item"><div class="home-dot">✓</div><div><strong>No checkouts today</strong><small>Enjoy the gap.</small></div></div>`; return; }
  todays.forEach(b=>{
    const item=document.createElement("div"); item.className="today-item";
    const st=b.status==="done"?"done":b.status==="started"?"started":"";
    item.innerHTML=`<div class="home-dot" style="color:${propertyColour(b.propertyId)};background:${propertyColour(b.propertyId)}18">⌂</div><div><strong>${propertyName(b.propertyId)}</strong><small>${b.guest} · Checkout ${APP_SETTINGS.checkoutTime}</small></div><button class="status ${st}">${b.status==='done'?'Done':b.status==='started'?'Started':'Start'}</button>`;
    item.querySelector("button").onclick=()=>toggleStatus(b);
    item.onclick=(e)=>{ if(e.target.tagName!=="BUTTON") openBooking(b); };
    list.appendChild(item);
  });
  $("#startNextBtn").textContent = done===todays.length ? "✨ Day complete" : "▶ Start next clean";
}
function toggleStatus(b){
  if(b.status==="done") b.status="active"; else if(b.status==="started") b.status="done"; else b.status="started";
  saveAll(false); render(); if(b.status==="done") toast(`✓ ${propertyName(b.propertyId)} complete`);
}
function openBooking(b=null){
  $("#bookingTitle").textContent = b ? "Edit stay" : "Add stay";
  $("#bookingId").value = b?.id || "";
  $("#propertyName").value = b ? propertyName(b.propertyId) : "";
  $("#guestName").value = b?.guest || "";
  $("#checkIn").value = b?.checkIn || todayIso();
  $("#checkOut").value = b?.checkOut || isoDate(addDays(new Date(),1));
  $("#bookingNotes").value = b?.notes || "";
  $("#deleteBookingBtn").style.display = b ? "inline-block" : "none";
  $("#bookingDialog").showModal();
}
function saveBooking(){
  const id=$("#bookingId").value; const propName=$("#propertyName").value.trim();
  let prop=state.properties.find(p=>p.name.toLowerCase()===propName.toLowerCase());
  if(!prop){ prop={id:uid("p"), name:propName, colour:colours[state.properties.length%colours.length], notes:""}; state.properties.push(prop); }
  const data={id:id||uid("b"), propertyId:prop.id, guest:$("#guestName").value.trim(), checkIn:$("#checkIn").value, checkOut:$("#checkOut").value, status:id ? (state.bookings.find(b=>b.id===id)?.status || "active") : "active", notes:$("#bookingNotes").value.trim()};
  if(data.checkOut<=data.checkIn){ toast("Checkout must be after checkin"); return; }
  const idx=state.bookings.findIndex(b=>b.id===data.id); if(idx>=0) state.bookings[idx]=data; else state.bookings.push(data);
  $("#bookingDialog").close(); saveAll(); render();
}
function deleteBooking(){ const id=$("#bookingId").value; state.bookings=state.bookings.filter(b=>b.id!==id); $("#bookingDialog").close(); saveAll(); render(); }
function openNote(type){ state.selectedNoteType=type; $("#noteTitle").textContent=type; $("#noteProperty").value=""; $("#noteText").value=""; $("#noteDialog").showModal(); }
function saveNote(){ state.notes.push({id:uid("n"), type:state.selectedNoteType, property:$("#noteProperty").value.trim(), text:$("#noteText").value.trim(), createdAt:new Date().toISOString()}); $("#noteDialog").close(); saveAll(); toast("Note saved"); }
function toast(msg){ const t=$("#toast"); t.textContent=msg; t.hidden=false; clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>t.hidden=true,2600); }

$("#addBtn").onclick=()=>openBooking();
$("#refreshBtn").onclick=()=>loadData();
$("#prevWeek").onclick=()=>{state.weekOffset--; renderPlanner();};
$("#nextWeek").onclick=()=>{state.weekOffset++; renderPlanner();};
$("#todayWeek").onclick=()=>{state.weekOffset=0; renderPlanner();};
$("#bookingForm").onsubmit=(e)=>{e.preventDefault(); saveBooking();};
$("#cancelBookingBtn").onclick=()=>$("#bookingDialog").close();
$("#deleteBookingBtn").onclick=deleteBooking;
$("#startNextBtn").onclick=()=>{ const b=dueToday().find(x=>x.status!=="done"); if(b){ b.status="started"; saveAll(false); render(); toast(`Started ${propertyName(b.propertyId)}`); } };
$("#feedbackBtn").onclick=()=>openNote("Feedback");
document.querySelectorAll(".note-btn").forEach(btn=>btn.onclick=()=>openNote(btn.dataset.note));
$("#noteForm").onsubmit=(e)=>{e.preventDefault(); saveNote();};
$("#cancelNoteBtn").onclick=()=>$("#noteDialog").close();

loadData();
