const colours = [
  '#7b4ad9','#2f80ed','#72bf44','#ff8a3d','#ef5b93','#f4c20d','#67c7d4','#14a0a0','#8aae66','#ff80b5'
];
const seedProperties = [
  ['p1','Barrier Reef Retreat','#7b4ad9',3,'',''],['p2','SeaBreeze','#2f80ed',3,'',''],['p3','Solas Sands','#72bf44',2.5,'',''],['p4','Paradise Palms','#ff8a3d',3,'',''],['p5','Moorings','#ef5b93',2,'',''],['p6','Loka 8','#f4c20d',2.5,'',''],['p7','Loka 12','#67c7d4',2.5,'',''],['p8','Seaside','#14a0a0',2.5,'',''],['p9','The Loft','#8aae66',2.5,'',''],['p10','Paradise Lights','#ff80b5',2.5,'','']
].map(([id,name,colour,hours,address,access])=>({id,name,colour,hours,address,access}));
const seedBookings = [
  ['b1','p1','Emma & Nick',-2,3],['b2','p1','Jason & Mel',7,10],['b3','p1','TBC',15,19],['b4','p2','Jake',1,5],['b5','p2','Lisa & Tom',8,11],['b6','p2','Ryan Family',14,18],['b7','p3','Steve',-3,2],['b8','p3','The Millers',7,11],['b9','p3','TBC',13,17],['b10','p4','David',-2,3],['b11','p4','Sophie & Mark',7,11],['b12','p5','Sarah',-2,3],['b13','p5','TBC',9,16],['b14','p6','Ben & Jess',2,6],['b15','p6','TBC',9,14],['b16','p7','Olivia',3,7],['b17','p7','TBC',10,17],['b18','p8','Aaron',-2,3],['b19','p8','TBC',10,17],['b20','p9','Chris & Pat',-1,5],['b21','p9','TBC',8,16],['b22','p10','Hannah',0,5],['b23','p10','TBC',9,16]
].map(([id,propertyId,guest,start,end])=>({id,propertyId,guest,checkIn:addDaysISO(start),checkOut:addDaysISO(end),status:'pending'}));
let state = {
  start: addDays(startOfDay(new Date()), -7),
  selectedColour: colours[0],
  selectedBookingId: null,
  properties: JSON.parse(localStorage.getItem('cindyProperties') || 'null') || seedProperties,
  bookings: JSON.parse(localStorage.getItem('cindyBookings') || 'null') || seedBookings,
  completions: JSON.parse(localStorage.getItem('cindyCompletions') || '[]')
};

document.addEventListener('DOMContentLoaded', init);
function init(){
  addPropertyBtn.onclick=()=>openProperty(); cancelPropertyBtn.onclick=()=>propertyDialog.close(); propertyForm.onsubmit=saveProperty;
  addBookingBtn.onclick=()=>openBooking(); cancelBookingBtn.onclick=()=>bookingDialog.close(); bookingForm.onsubmit=saveBooking; deleteBookingBtn.onclick=deleteBooking;
  closeDetailBtn.onclick=()=>detailDialog.close(); editStayBtn.onclick=()=>{detailDialog.close();openBooking(state.selectedBookingId)}; completeStayBtn.onclick=()=>openComplete(state.selectedBookingId); issueStayBtn.onclick=()=>alert('Issue capture is next: this will save issue type, notes and photos later.');
  cancelCompleteBtn.onclick=()=>completeDialog.close(); completeForm.onsubmit=saveCompletion;
  prevBtn.onclick=()=>shift(-14); nextBtn.onclick=()=>shift(14); todayBtn.onclick=()=>{state.start=addDays(startOfDay(new Date()),-7);render();};
  showPropertiesBtn.onclick=()=>openPropertyList(); showTodayBtn.onclick=()=>scrollToday();
  document.querySelectorAll('.counter button').forEach(btn=>btn.onclick=()=>stepBed(btn.dataset.bed, Number(btn.dataset.step)));
  buildColourChoices(); render(); setTimeout(scrollToday,250);
}
function persist(){localStorage.setItem('cindyProperties',JSON.stringify(state.properties));localStorage.setItem('cindyBookings',JSON.stringify(state.bookings));localStorage.setItem('cindyCompletions',JSON.stringify(state.completions));}
function shift(days){state.start=addDays(state.start,days);render();}
function render(){renderHeader();renderTimeline();}
function renderHeader(){monthTitle.textContent=state.start.toLocaleDateString('en-AU',{month:'long',year:'numeric'}).toUpperCase();}
function renderTimeline(){
  timeline.innerHTML=''; const days=Array.from({length:56},(_,i)=>addDays(state.start,i)); const grid=document.createElement('div'); grid.className='grid';
  grid.appendChild(div('corner',''));
  days.forEach(d=>{const h=div('day-head'+(iso(d)===iso(new Date())?' today':''), `${d.toLocaleDateString('en-AU',{weekday:'short'}).toUpperCase()}<strong>${d.getDate()}</strong>${d.getDate()===1?'<small>'+d.toLocaleDateString('en-AU',{month:'short'}).toUpperCase()+'</small>':''}`); grid.appendChild(h);});
  state.properties.forEach(p=>{const pc=div('prop-cell',`<span class="colour-dot" style="background:${p.colour}"></span><span>${p.name}</span>`); pc.style.background=`linear-gradient(90deg, ${hexAlpha(p.colour,.28)}, ${hexAlpha(p.colour,.12)})`; pc.onclick=()=>openProperty(p.id); grid.appendChild(pc); days.forEach(()=>grid.appendChild(div('day-cell','')));});
  timeline.appendChild(grid);
  const todayOff=offsetDays(state.start,startOfDay(new Date())); if(todayOff>=0&&todayOff<56){const line=div('today-line',''); line.style.left=`calc(var(--left) + ${todayOff} * var(--cell) + var(--cell) / 2)`; timeline.appendChild(line);}
  state.bookings.forEach(b=>placeStay(b));
}
function placeStay(b){
  const p=propertyById(b.propertyId); if(!p)return; const row=state.properties.findIndex(x=>x.id===p.id); const start=offsetDays(state.start,new Date(b.checkIn)); const end=offsetDays(state.start,new Date(b.checkOut)); if(end<0||start>55)return; const visibleStart=Math.max(0,start); const visibleEnd=Math.min(56,end); const nights=Math.max(1,visibleEnd-visibleStart);
  const stay=div('stay',`<span class="name">${b.guest}</span>`); stay.style.color=p.colour; stay.style.left=`calc(var(--left) + ${visibleStart} * var(--cell) + calc(var(--cell) / 2))`; stay.style.top=`calc(52px + ${row} * var(--row) + 15px)`; stay.style.width=`calc(${nights} * var(--cell))`; stay.onclick=()=>openDetail(b.id); timeline.appendChild(stay);
  const checkout=offsetDays(state.start,new Date(b.checkOut)); if(checkout>=0&&checkout<56){const dot=div('clean-dot',''); dot.style.left=`calc(var(--left) + ${checkout} * var(--cell) + calc(var(--cell) / 2) - 11px)`; dot.style.top=`calc(52px + ${row} * var(--row) + 26px)`; timeline.appendChild(dot);} 
}
function openProperty(id=null){const p=id?propertyById(id):null; propertyDialogTitle.textContent=p?'Edit Property':'Add Property'; propertyId.value=p?.id||''; propertyName.value=p?.name||''; propertyHours.value=p?.hours||2.5; propertyAddress.value=p?.address||''; propertyAccess.value=p?.access||''; state.selectedColour=p?.colour||colours[state.properties.length%colours.length]; buildColourChoices(); propertyDialog.showModal();}
function saveProperty(e){e.preventDefault(); const id=propertyId.value||uid('p'); const data={id,name:propertyName.value.trim(),colour:state.selectedColour,hours:Number(propertyHours.value||0),address:propertyAddress.value.trim(),access:propertyAccess.value.trim()}; const i=state.properties.findIndex(p=>p.id===id); if(i>=0)state.properties[i]=data; else state.properties.push(data); persist(); propertyDialog.close(); render();}
function buildColourChoices(){colourChoices.innerHTML=''; colours.forEach(c=>{const b=document.createElement('button'); b.type='button'; b.className='colour-choice'+(c===state.selectedColour?' selected':''); b.style.background=c; b.onclick=()=>{state.selectedColour=c;buildColourChoices();}; colourChoices.appendChild(b);});}
function openBooking(id=null){const b=id?bookingById(id):null; bookingDialogTitle.textContent=b?'Edit Stay':'Add Stay'; bookingId.value=b?.id||''; bookingGuest.value=b?.guest||''; bookingCheckIn.value=b?.checkIn||iso(new Date()); bookingCheckOut.value=b?.checkOut||iso(addDays(new Date(),2)); renderPropertySelect(b?.propertyId); deleteBookingBtn.style.visibility=b?'visible':'hidden'; bookingDialog.showModal();}
function renderPropertySelect(selected){bookingProperty.innerHTML=''; state.properties.forEach(p=>{const o=document.createElement('option'); o.value=p.id; o.textContent=p.name; if(p.id===selected)o.selected=true; bookingProperty.appendChild(o);});}
function saveBooking(e){e.preventDefault(); const id=bookingId.value||uid('b'); const data={id,propertyId:bookingProperty.value,guest:bookingGuest.value.trim(),checkIn:bookingCheckIn.value,checkOut:bookingCheckOut.value,status:'pending'}; const i=state.bookings.findIndex(b=>b.id===id); if(i>=0)state.bookings[i]=data; else state.bookings.push(data); persist(); bookingDialog.close(); render();}
function deleteBooking(){const id=bookingId.value;if(!id)return;if(confirm('Delete this stay?')){state.bookings=state.bookings.filter(b=>b.id!==id);persist();bookingDialog.close();render();}}
function openDetail(id){state.selectedBookingId=id; const b=bookingById(id),p=propertyById(b.propertyId); detailTitle.textContent=b.guest; detailProperty.innerHTML=`<span class="colour-dot" style="display:inline-block;background:${p.colour}"></span> ${p.name}`; detailCheckIn.textContent=formatDate(b.checkIn)+' (PM)'; detailCheckOut.textContent=formatDate(b.checkOut)+' (AM)'; detailNights.textContent=stayLength(b); detailDialog.showModal();}
function openComplete(id){const b=bookingById(id),p=propertyById(b.propertyId); completeSub.textContent=`${p.name} • ${b.guest}`; completeForm.dataset.bookingId=id; bedKing.value=0; bedQueen.value=0; bedSingle.value=0; completeNotes.value=''; detailDialog.close(); completeDialog.showModal();}
function saveCompletion(e){e.preventDefault(); const b=bookingById(completeForm.dataset.bookingId); state.completions.push({id:uid('c'),bookingId:b.id,propertyId:b.propertyId,guest:b.guest,date:iso(new Date()),king:Number(bedKing.value),queen:Number(bedQueen.value),single:Number(bedSingle.value),notes:completeNotes.value.trim()}); b.status='complete'; persist(); completeDialog.close(); render(); alert('Saved for invoice notes');}
function stepBed(bed,step){const el={king:bedKing,queen:bedQueen,single:bedSingle}[bed]; el.value=Math.max(0,Number(el.value||0)+step);}
function openPropertyList(){alert('Property list is now stored. Tap any property name on the left to edit colour, address, access notes and default clean time.');}
function scrollToday(){const todayOff=offsetDays(state.start,startOfDay(new Date())); document.querySelector('.timeline-wrap').scrollLeft=Math.max(0, todayOff*58-260);}
function propertyById(id){return state.properties.find(p=>p.id===id)} function bookingById(id){return state.bookings.find(b=>b.id===id)}
function div(cls,html){const e=document.createElement('div'); e.className=cls; e.innerHTML=html; return e;} function uid(p){return p+Math.random().toString(36).slice(2,9)}
function startOfDay(d){const x=new Date(d); x.setHours(0,0,0,0); return x;} function addDays(d,n){const x=new Date(d); x.setDate(x.getDate()+n); return x;} function addDaysISO(n){return iso(addDays(new Date(),n));}
function iso(d){return startOfDay(new Date(d)).toISOString().slice(0,10)} function offsetDays(a,b){return Math.round((startOfDay(b)-startOfDay(a))/86400000)}
function stayLength(b){return Math.max(1,offsetDays(new Date(b.checkIn),new Date(b.checkOut)))} function formatDate(s){return new Date(s+'T00:00:00').toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'})}
function hexAlpha(hex,a){const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `rgba(${r},${g},${b},${a})`;}
