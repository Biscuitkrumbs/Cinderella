const colours = [
  '#7a4de8','#2f80ed','#77c442','#ff8a3d','#ef5b93','#f7c600','#66c7d4','#84a85f','#f59bd6','#10a7a7'
];
const initialProperties = [
  {id:'p1',name:'Barrier Reef Retreat',colour:colours[0],address:'',access:'Purple keyring',king:1,queen:2,single:0,notes:''},
  {id:'p2',name:'SeaBreeze',colour:colours[1],address:'',access:'Blue keyring',king:0,queen:2,single:2,notes:''},
  {id:'p3',name:'Solas Sands',colour:colours[2],address:'',access:'Green keyring',king:1,queen:1,single:2,notes:''},
  {id:'p4',name:'Paradise Palms',colour:colours[3],address:'',access:'Orange keyring',king:1,queen:2,single:0,notes:''},
  {id:'p5',name:'Moorings',colour:colours[4],address:'',access:'Pink keyring',king:0,queen:2,single:1,notes:''},
  {id:'p6',name:'Loka 8',colour:colours[5],address:'',access:'Yellow keyring',king:0,queen:1,single:2,notes:''},
  {id:'p7',name:'Loka 12',colour:colours[6],address:'',access:'Light blue keyring',king:1,queen:1,single:0,notes:''},
  {id:'p8',name:'Seaside',colour:colours[7],address:'',access:'Teal keyring',king:0,queen:2,single:0,notes:''},
  {id:'p9',name:'The Loft',colour:'#8dad66',address:'',access:'Olive keyring',king:1,queen:0,single:0,notes:''},
  {id:'p10',name:'Paradise Lights',colour:'#ef6aa7',address:'',access:'Pink keyring',king:0,queen:2,single:2,notes:''}
];
const initialStays = [
  {id:'s1',propertyId:'p1',guest:'Emma & Nick',arrival:'2025-07-16',departure:'2025-07-20',status:'booked'},
  {id:'s2',propertyId:'p1',guest:'Jason & Mel',arrival:'2025-07-24',departure:'2025-07-27',status:'booked'},
  {id:'s3',propertyId:'p1',guest:'TBC',arrival:'2025-08-01',departure:'2025-08-05',status:'booked'},
  {id:'s4',propertyId:'p2',guest:'Jake',arrival:'2025-07-19',departure:'2025-07-22',status:'booked'},
  {id:'s5',propertyId:'p2',guest:'Lisa & Tom',arrival:'2025-07-25',departure:'2025-07-28',status:'booked'},
  {id:'s6',propertyId:'p2',guest:'Ryan Family',arrival:'2025-07-31',departure:'2025-08-04',status:'booked'},
  {id:'s7',propertyId:'p3',guest:'Steve',arrival:'2025-07-15',departure:'2025-07-20',status:'booked'},
  {id:'s8',propertyId:'p3',guest:'The Millers',arrival:'2025-07-24',departure:'2025-07-28',status:'booked'},
  {id:'s9',propertyId:'p4',guest:'David',arrival:'2025-07-16',departure:'2025-07-20',status:'booked'},
  {id:'s10',propertyId:'p4',guest:'Sophie & Mark',arrival:'2025-07-24',departure:'2025-07-28',status:'booked'},
  {id:'s11',propertyId:'p5',guest:'Sarah',arrival:'2025-07-16',departure:'2025-07-21',status:'booked'},
  {id:'s12',propertyId:'p5',guest:'TBC',arrival:'2025-07-27',departure:'2025-08-02',status:'booked'},
  {id:'s13',propertyId:'p6',guest:'Ben & Jess',arrival:'2025-07-20',departure:'2025-07-24',status:'booked'},
  {id:'s14',propertyId:'p7',guest:'Olivia',arrival:'2025-07-21',departure:'2025-07-25',status:'booked'},
  {id:'s15',propertyId:'p8',guest:'Aaron',arrival:'2025-07-16',departure:'2025-07-20',status:'booked'},
  {id:'s16',propertyId:'p9',guest:'Chris & Pat',arrival:'2025-07-17',departure:'2025-07-23',status:'booked'},
  {id:'s17',propertyId:'p10',guest:'Hannah',arrival:'2025-07-17',departure:'2025-07-23',status:'booked'}
];
let state = loadState();
let timelineStart = new Date('2025-07-16');
const daysCount = 35;
const px = n => `${n}px`;
function loadState(){
  const saved = localStorage.getItem('cinderellaV4');
  if(saved) return JSON.parse(saved);
  return {properties:initialProperties,stays:initialStays,cleans:[]};
}
function saveState(){ localStorage.setItem('cinderellaV4', JSON.stringify(state)); }
function id(prefix){ return prefix + Math.random().toString(36).slice(2,9); }
function iso(d){ return new Date(d).toISOString().slice(0,10); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function diffDays(a,b){ const x=new Date(a),y=new Date(b); x.setHours(0,0,0,0); y.setHours(0,0,0,0); return Math.round((y-x)/86400000); }
function prop(id){ return state.properties.find(p=>p.id===id); }
function transparent(hex,alpha){
  const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function render(){
  renderTitle(); renderTimeline(); fillStayPropertySelect();
}
function renderTitle(){
  const d = timelineStart.toLocaleDateString('en-AU',{month:'long',year:'numeric'}).toUpperCase();
  monthTitle.textContent = d;
}
function renderTimeline(){
  timeline.innerHTML='';
  const rows = state.properties.length;
  const grid = document.createElement('div');
  grid.className='timeline-grid';
  grid.style.setProperty('--rows', rows);
  const corner = document.createElement('div'); corner.className='corner'; grid.appendChild(corner);
  for(let i=0;i<daysCount;i++){
    const d=addDays(timelineStart,i);
    const cell=document.createElement('div'); cell.className='date-cell';
    if(iso(d)===iso(new Date())) cell.classList.add('today');
    cell.style.gridColumn = i+2; cell.style.gridRow = 1;
    cell.innerHTML = `<span class="dow">${d.toLocaleDateString('en-AU',{weekday:'short'}).toUpperCase()}</span><span class="num">${d.getDate()}</span>${iso(d)===iso(new Date())?'<span class="today-pill">TODAY</span>':''}`;
    grid.appendChild(cell);
  }
  state.properties.forEach((p,r)=>{
    const row = r+2;
    const pc=document.createElement('div'); pc.className='prop-cell'; pc.style.gridColumn=1; pc.style.gridRow=row; pc.style.background=`linear-gradient(90deg, ${transparent(p.colour,.30)}, ${transparent(p.colour,.12)})`;
    pc.innerHTML=`<span class="prop-dot" style="background:${p.colour}"></span><span>${p.name}</span>`;
    pc.onclick=()=>openProperty(p.id);
    grid.appendChild(pc);
    for(let i=0;i<daysCount;i++){ const gc=document.createElement('div'); gc.className='grid-cell'; gc.style.gridColumn=i+2; gc.style.gridRow=row; grid.appendChild(gc); }
  });
  const todayOffset = diffDays(timelineStart,new Date());
  if(todayOffset>=0 && todayOffset<daysCount){ const line=document.createElement('div'); line.className='today-line'; line.style.left = `calc(var(--prop) + ${todayOffset} * var(--cell) + var(--cell) / 2)`; timeline.appendChild(line); }
  state.stays.forEach(s=>{
    const p=prop(s.propertyId); if(!p) return;
    const r = state.properties.findIndex(x=>x.id===p.id)+2;
    const start=diffDays(timelineStart,s.arrival); const end=diffDays(timelineStart,s.departure);
    if(end<0 || start>daysCount) return;
    const visibleStart=Math.max(0,start); const visibleEnd=Math.min(daysCount,end); const span=Math.max(2,visibleEnd-visibleStart + 1);
    const stay=document.createElement('div'); stay.className='stay'; if(s.status==='complete') stay.classList.add('complete'); if(s.status==='issue') stay.classList.add('issue');
    stay.style.gridRow=r; stay.style.gridColumn=`${visibleStart+2} / span ${span}`; stay.style.color=p.colour; stay.style.background=transparent(p.colour,.14); stay.innerHTML=`<span>${s.guest}</span>`;
    stay.onclick=()=>openStay(s.id);
    grid.appendChild(stay);
    const dot=document.createElement('div'); dot.className='clean-dot'; dot.title='Complete clean'; dot.style.gridRow=r; dot.style.gridColumn=Math.min(daysCount,Math.max(1,end))+1; dot.onclick=()=>openClean(s.id); grid.appendChild(dot);
  });
  timeline.appendChild(grid);
}
function openProperty(propertyId){
  const p = prop(propertyId) || {id:'',name:'',colour:colours[0],address:'',access:'',king:0,queen:0,single:0,notes:''};
  propertyId.value = p.id; propertyName.value=p.name; propertyAddress.value=p.address||''; propertyAccess.value=p.access||''; kingBeds.value=p.king||0; queenBeds.value=p.queen||0; singleBeds.value=p.single||0; propertyNotes.value=p.notes||'';
  propertyFormTitle.textContent=p.id?'Edit Property':'Add Property'; renderColourChoices(p.colour); propertyDialog.showModal();
}
function renderColourChoices(selected){
  colourChoices.innerHTML='';
  colours.forEach(c=>{ const b=document.createElement('button'); b.type='button'; b.className='colour-choice'+(c===selected?' selected':''); b.style.background=c; b.onclick=()=>{ document.querySelectorAll('.colour-choice').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); b.dataset.selected='true'; selectedColour=c; }; b.dataset.colour=c; colourChoices.appendChild(b); });
  window.selectedColour=selected;
}
propertyForm.onsubmit=e=>{
  e.preventDefault();
  const data={id:propertyId.value||id('p'),name:propertyName.value.trim(),colour:window.selectedColour||colours[0],address:propertyAddress.value.trim(),access:propertyAccess.value.trim(),king:+kingBeds.value||0,queen:+queenBeds.value||0,single:+singleBeds.value||0,notes:propertyNotes.value.trim()};
  const i=state.properties.findIndex(p=>p.id===data.id); if(i>=0) state.properties[i]=data; else state.properties.push(data);
  saveState(); propertyDialog.close(); render();
};
function fillStayPropertySelect(){
  stayProperty.innerHTML=state.properties.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
}
function openStay(stayId){
  const s = state.stays.find(x=>x.id===stayId) || {id:'',propertyId:state.properties[0]?.id,guest:'',arrival:iso(new Date()),departure:iso(addDays(new Date(),2)),status:'booked'};
  stayId.value=s.id; stayProperty.value=s.propertyId; guestName.value=s.guest; arrivalDate.value=s.arrival; departureDate.value=s.departure; stayStatus.value=s.status||'booked'; stayFormTitle.textContent=s.id?'Edit Stay':'Add Stay'; deleteStayBtn.style.display=s.id?'inline-block':'none'; stayDialog.showModal();
}
stayForm.onsubmit=e=>{
  e.preventDefault();
  const data={id:stayId.value||id('s'),propertyId:stayProperty.value,guest:guestName.value.trim(),arrival:arrivalDate.value,departure:departureDate.value,status:stayStatus.value};
  const i=state.stays.findIndex(s=>s.id===data.id); if(i>=0) state.stays[i]=data; else state.stays.push(data);
  saveState(); stayDialog.close(); render();
};
deleteStayBtn.onclick=()=>{ if(!stayId.value || !confirm('Delete this stay?')) return; state.stays=state.stays.filter(s=>s.id!==stayId.value); saveState(); stayDialog.close(); render(); };
function openClean(stayIdVal){
  const s=state.stays.find(x=>x.id===stayIdVal); const p=prop(s.propertyId); if(!s||!p)return;
  cleanStayId.value=s.id; cleanSummary.textContent=`${p.name} · ${s.guest} · checkout ${s.departure}`; cleanKing.value=p.king||0; cleanQueen.value=p.queen||0; cleanSingle.value=p.single||0; invoiceNotes.value=''; document.querySelectorAll('#cleanForm input[type=checkbox]').forEach(c=>c.checked=false); cleanDialog.showModal();
}
cleanForm.onsubmit=e=>{
  e.preventDefault();
  const extras=[...document.querySelectorAll('#cleanForm input[type=checkbox]:checked')].map(c=>c.value);
  state.cleans.push({id:id('c'),stayId:cleanStayId.value,date:iso(new Date()),king:+cleanKing.value||0,queen:+cleanQueen.value||0,single:+cleanSingle.value||0,extras,notes:invoiceNotes.value.trim()});
  const s=state.stays.find(x=>x.id===cleanStayId.value); if(s) s.status='complete';
  saveState(); cleanDialog.close(); render();
};
function openDrawerForStay(s){
  const p=prop(s.propertyId); drawerContent.innerHTML=`<h2>${s.guest}</h2><div class="info-row"><span>Property</span><b style="color:${p.colour}">${p.name}</b></div><div class="info-row"><span>Arrival</span><b>${s.arrival} PM</b></div><div class="info-row"><span>Departure</span><b>${s.departure} AM</b></div><div class="drawer-actions"><button class="primary-btn" onclick="openStay('${s.id}')">Edit Stay</button><button class="success-btn" onclick="openClean('${s.id}')">Complete Clean</button></div>`;
  drawer.classList.add('open');
}
addPropertyBtn.onclick=()=>openProperty(''); addStayBtn.onclick=()=>openStay(''); cancelPropertyBtn.onclick=()=>propertyDialog.close(); cancelStayBtn.onclick=()=>stayDialog.close(); cancelCleanBtn.onclick=()=>cleanDialog.close(); closeDrawerBtn.onclick=()=>drawer.classList.remove('open'); drawer.onclick=e=>{ if(e.target===drawer) drawer.classList.remove('open'); };
prevBtn.onclick=()=>{timelineStart=addDays(timelineStart,-14); render();}; nextBtn.onclick=()=>{timelineStart=addDays(timelineStart,14); render();}; todayBtn.onclick=()=>{timelineStart=addDays(new Date(),-2); render();};
render();
