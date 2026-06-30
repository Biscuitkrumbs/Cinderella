const DAY_MS=86400000;
let stays=[];
let issues=[];
let timelineStart=startOfDay(addDays(new Date(),-7));
const sampleStays=[
 {property:'Ocean View',guest:'Emma & Nick',checkIn:iso(addDays(new Date(),-2)),checkOut:iso(addDays(new Date(),1)),status:'pending'},
 {property:'Ocean View',guest:'Jake & Sarah',checkIn:iso(addDays(new Date(),3)),checkOut:iso(addDays(new Date(),6)),status:'pending'},
 {property:'Riverfront',guest:'Michael',checkIn:iso(addDays(new Date(),0)),checkOut:iso(addDays(new Date(),4)),status:'pending'},
 {property:'White House',guest:'Daniel & Claire',checkIn:iso(addDays(new Date(),5)),checkOut:iso(addDays(new Date(),7)),status:'pending'},
 {property:'Beachside',guest:'Sophie',checkIn:iso(addDays(new Date(),8)),checkOut:iso(addDays(new Date(),12)),status:'pending'},
 {property:'Mountain Retreat',guest:'Chris & Pat',checkIn:iso(addDays(new Date(),-6)),checkOut:iso(addDays(new Date(),2)),status:'issue'},
 {property:'Sunset Villa',guest:'Aaron & Jess',checkIn:iso(addDays(new Date(),12)),checkOut:iso(addDays(new Date(),16)),status:'pending'},
 {property:'Lakeside',guest:'Sarah',checkIn:iso(addDays(new Date(),17)),checkOut:iso(addDays(new Date(),19)),status:'pending'},
 {property:'Pine Cottage',guest:'Steve & Anna',checkIn:iso(addDays(new Date(),22)),checkOut:iso(addDays(new Date(),25)),status:'pending'}
];

document.addEventListener('DOMContentLoaded',init);
function init(){bind();loadLocal();render();loadRemote();}
function bind(){
 addStayBtn.onclick=()=>openStay(); jumpTodayBtn.onclick=()=>{timelineStart=startOfDay(addDays(new Date(),-7));renderTimeline();setTimeout(()=>timeline.scrollLeft=320,60)};
 closeStayBtn.onclick=()=>stayDialog.close(); stayForm.onsubmit=saveStay; deleteStayBtn.onclick=deleteStay; issueFromStayBtn.onclick=()=>{const i=Number(editIndex.value);stayDialog.close();openIssue(i)};
 closeIssueBtn.onclick=()=>issueDialog.close(); issueForm.onsubmit=saveIssue;
 feedbackBtn.onclick=()=>feedbackDialog.showModal(); closeFeedbackBtn.onclick=()=>feedbackDialog.close(); feedbackForm.onsubmit=saveFeedback;
}
function loadLocal(){stays=JSON.parse(localStorage.getItem('cindy_stays')||'null')||sampleStays;issues=JSON.parse(localStorage.getItem('cindy_issues')||'[]');}
function saveLocal(){localStorage.setItem('cindy_stays',JSON.stringify(stays));localStorage.setItem('cindy_issues',JSON.stringify(issues));}
async function loadRemote(){try{if(!SCRIPT_URL)return;const r=await fetch(`${SCRIPT_URL}?action=getBookings`);const d=await r.json();if(d.bookings&&d.bookings.length){stays=d.bookings.map(normaliseStay);saveLocal();render();}}catch(e){console.log('Using local data',e)}}
function normaliseStay(b){return{property:b.property||b.Property||'',guest:b.guest||b.Guest||'',checkIn:b.checkIn||b.CheckIn||b['Check In']||'',checkOut:b.checkOut||b.CheckOut||b['Check Out']||'',status:b.status||b.Status||'pending'}}
function render(){renderSummary();renderTimeline();renderToday();}
function renderSummary(){const today=iso(new Date());const cleans=stays.filter(s=>s.checkOut===today);const done=cleans.filter(s=>s.status==='done').length;summaryText.textContent=`${stays.length} stays loaded`;todayTitle.textContent=`${cleans.length} cleans`;progressText.textContent=`${done} / ${cleans.length}`;nextClean.textContent=cleans.find(s=>s.status!=='done')?.property||'All clear';cleanCount.textContent=cleans.length;}
function renderTimeline(){
 timeline.innerHTML='';const days=Array.from({length:35},(_,i)=>addDays(timelineStart,i));const homes=[...new Set(stays.map(s=>s.property).filter(Boolean))].sort();const grid=document.createElement('div');grid.className='timeline-grid';
 const corner=document.createElement('div');corner.className='corner';corner.style.gridColumn='1';corner.style.gridRow='1 / span 2';grid.appendChild(corner);
 let monthStart=0;for(let i=0;i<days.length;i++){const next=days[i+1];if(!next||next.getMonth()!==days[i].getMonth()){const m=document.createElement('div');m.className='month-head';m.textContent=days[i].toLocaleDateString('en-AU',{month:'long'});m.style.gridColumn=`${monthStart+2} / ${i+3}`;m.style.gridRow='1';grid.appendChild(m);monthStart=i+1;}}
 days.forEach((d,i)=>{const h=document.createElement('div');h.className='day-head';h.innerHTML=`${d.toLocaleDateString('en-AU',{weekday:'short'})}<br>${d.getDate()}`;h.style.gridColumn=i+2;h.style.gridRow='2';grid.appendChild(h)});
 homes.forEach((home,rowIndex)=>{const row=rowIndex+3;const name=document.createElement('div');name.className='home-name';name.textContent=home;name.style.gridColumn='1';name.style.gridRow=row;grid.appendChild(name);days.forEach((d,i)=>{const c=document.createElement('div');c.className='cell'+(iso(d)===iso(new Date())?' today-col':'');c.style.gridColumn=i+2;c.style.gridRow=row;grid.appendChild(c)});stays.forEach((s,index)=>{if(s.property!==home)return;const start=diffDays(timelineStart,new Date(s.checkIn));const end=diffDays(timelineStart,new Date(s.checkOut));if(end<=0||start>=35)return;const visibleStart=Math.max(0,start);const visibleEnd=Math.min(35,end);const bar=document.createElement('div');bar.className=`stay ${colourFor(s)}`;bar.textContent=s.guest||'Guest';bar.title=`${s.property} - ${s.guest}`;bar.style.gridColumn=`${visibleStart+2} / ${visibleEnd+2}`;bar.style.gridRow=row;bar.onclick=()=>openStay(index);bar.oncontextmenu=e=>{e.preventDefault();openIssue(index)};grid.appendChild(bar)});});
 if(!homes.length){const empty=document.createElement('div');empty.className='home-name';empty.textContent='Tap +';empty.style.gridColumn='1';empty.style.gridRow='3';grid.appendChild(empty)}
 timeline.appendChild(grid);setTimeout(()=>{if(timeline.scrollLeft<10)timeline.scrollLeft=300},40);
}
function renderToday(){const today=iso(new Date());const cleans=stays.filter(s=>s.checkOut===today);todayList.innerHTML='';if(!cleans.length){todayList.innerHTML='<div class="clean-item"><strong>No checkouts today</strong><p>Nice. Check the planner for upcoming stays.</p></div>';return}cleans.forEach(s=>{const i=stays.indexOf(s);const div=document.createElement('div');div.className='clean-item';div.innerHTML=`<strong>${s.property}</strong><p>${s.guest}</p><p>Checkout 10:00am</p><div class="today-actions"><button class="primary" data-done="${i}">${s.status==='done'?'Done ✓':'Complete'}</button><button data-edit="${i}">Edit</button><button data-issue="${i}">Issue</button></div>`;todayList.appendChild(div)});todayList.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>completeStay(Number(b.dataset.done)));todayList.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openStay(Number(b.dataset.edit)));todayList.querySelectorAll('[data-issue]').forEach(b=>b.onclick=()=>openIssue(Number(b.dataset.issue)));}
function openStay(index=null){stayForm.reset();editIndex.value=index??'';deleteStayBtn.classList.toggle('hidden',index===null);issueFromStayBtn.classList.toggle('hidden',index===null);stayDialogTitle.textContent=index===null?'Add Stay':'Edit Stay';if(index!==null){const s=stays[index];propertyInput.value=s.property;guestInput.value=s.guest;checkInInput.value=s.checkIn;checkOutInput.value=s.checkOut;statusInput.value=s.status||'pending'}else{checkInInput.value=iso(new Date());checkOutInput.value=iso(addDays(new Date(),2));statusInput.value='pending'}stayDialog.showModal();}
function saveStay(e){e.preventDefault();const s={property:propertyInput.value.trim(),guest:guestInput.value.trim(),checkIn:checkInInput.value,checkOut:checkOutInput.value,status:statusInput.value};if(!s.property||!s.guest||!s.checkIn||!s.checkOut)return;if(s.checkOut<=s.checkIn){toast('Check out must be after check in');return}const idx=editIndex.value===''?null:Number(editIndex.value);if(idx===null)stays.push(s);else stays[idx]=s;saveLocal();render();stayDialog.close();sendToSheet('saveBooking',s);toast(idx===null?'Stay added':'Stay updated');}
function deleteStay(){const idx=Number(editIndex.value);if(Number.isNaN(idx))return;if(!confirm('Delete this stay?'))return;stays.splice(idx,1);saveLocal();render();stayDialog.close();toast('Stay deleted')}
function completeStay(i){stays[i].status='done';saveLocal();render();sendToSheet('saveBooking',stays[i]);toast('Nice work. Clean complete ✓')}
function openIssue(i){issueForm.reset();issueIndex.value=i;issueDialog.showModal()}
function saveIssue(e){e.preventDefault();const i=Number(issueIndex.value);const s=stays[i];const issue={date:new Date().toISOString(),property:s.property,guest:s.guest,type:issueTypeInput.value,notes:issueNotesInput.value.trim(),status:'open'};issues.push(issue);stays[i].status='issue';saveLocal();render();issueDialog.close();sendToSheet('saveIssue',issue);toast('Issue saved')}
function saveFeedback(e){e.preventDefault();const feedback={date:new Date().toISOString(),comment:feedbackInput.value.trim()};feedbackDialog.close();feedbackForm.reset();sendToSheet('saveFeedback',feedback);toast('Feedback sent')}
async function sendToSheet(action,data){try{if(!SCRIPT_URL)return;await fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify({action,data})})}catch(e){console.log('Sheet sync skipped',action,data)}}
function colourFor(s){const today=iso(new Date());if(s.status==='issue')return'issue';if(s.checkOut===today)return'today';if(s.checkOut<today)return'past';return'future'}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x}function iso(d){return startOfDay(d).toISOString().slice(0,10)}function diffDays(a,b){return Math.round((startOfDay(b)-startOfDay(a))/DAY_MS)}function toast(msg){toast.textContent=msg;toast.classList.remove('hidden');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.add('hidden'),2200)}
