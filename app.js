const properties = [
  { name:'Barrier Reef Retreat', color:'#7b4ce2' },
  { name:'SeaBreeze', color:'#2f80ed' },
  { name:'Solas Sands', color:'#6cbc2f' },
  { name:'Paradise Palms', color:'#ff8a35' },
  { name:'Moorings', color:'#ec5d95' },
  { name:'Loka 8', color:'#f3c300' },
  { name:'Loka 12', color:'#64c7d8' },
  { name:'Seaside', color:'#22a6a7' },
  { name:'The Loft', color:'#7da63b' },
  { name:'Paradise Lights', color:'#f062a4' }
];
const stays = [
  { property:'Barrier Reef Retreat', guest:'Emma & Nick', in:'2025-07-16', out:'2025-07-20' },
  { property:'Barrier Reef Retreat', guest:'Jason & Mel', in:'2025-07-24', out:'2025-07-27' },
  { property:'Barrier Reef Retreat', guest:'TBC', in:'2025-08-01', out:'2025-08-05' },
  { property:'SeaBreeze', guest:'Jake', in:'2025-07-18', out:'2025-07-22' },
  { property:'SeaBreeze', guest:'Lisa & Tom', in:'2025-07-25', out:'2025-07-28' },
  { property:'SeaBreeze', guest:'Ryan Family', in:'2025-07-31', out:'2025-08-03' },
  { property:'Solas Sands', guest:'Steve', in:'2025-07-15', out:'2025-07-20' },
  { property:'Solas Sands', guest:'The Millers', in:'2025-07-24', out:'2025-07-28' },
  { property:'Paradise Palms', guest:'David', in:'2025-07-16', out:'2025-07-20' },
  { property:'Paradise Palms', guest:'Sophie & Mark', in:'2025-07-24', out:'2025-07-28' },
  { property:'Moorings', guest:'Sarah', in:'2025-07-16', out:'2025-07-21' },
  { property:'Moorings', guest:'TBC', in:'2025-07-27', out:'2025-08-03' },
  { property:'Loka 8', guest:'Ben & Jess', in:'2025-07-19', out:'2025-07-23' },
  { property:'Loka 12', guest:'Olivia', in:'2025-07-20', out:'2025-07-24' },
  { property:'Seaside', guest:'Aaron', in:'2025-07-16', out:'2025-07-20' },
  { property:'The Loft', guest:'Chris & Pat', in:'2025-07-17', out:'2025-07-22' },
  { property:'Paradise Lights', guest:'Hannah', in:'2025-07-17', out:'2025-07-22' }
];
const CELL = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell-w')) || 64;
const startDate = new Date('2025-07-14T00:00:00');
const days = Array.from({length:42},(_,i)=>addDays(startDate,i));
const propertyColumn = document.getElementById('propertyColumn');
const timeline = document.getElementById('timeline');
const timelineWrap = document.getElementById('timelineWrap');
const monthTitle = document.getElementById('monthTitle');
function init(){render(); setTimeout(()=>timelineWrap.scrollLeft = CELL * 1.7, 50);}
function render(){
  monthTitle.textContent = 'JULY 2025';
  propertyColumn.innerHTML=''; timeline.innerHTML='';
  days.forEach((d,i)=>{
    const h=document.createElement('div'); h.className='day-header'+(iso(d)==='2025-07-17'?' today':''); h.style.left=`${i*CELL}px`; h.innerHTML=`<span class="dow">${d.toLocaleDateString('en-AU',{weekday:'short'})}</span><span class="num">${d.getDate()}</span>`; timeline.appendChild(h);
  });
  properties.forEach((p,row)=>{
    const pr=document.createElement('div'); pr.className='property-row'; pr.style.background=soft(p.color); pr.textContent=p.name; propertyColumn.appendChild(pr);
    const gr=document.createElement('div'); gr.className='grid-row'; gr.style.top=`${row*rowHeight()+62}px`; timeline.appendChild(gr);
    stays.filter(s=>s.property===p.name).forEach(s=>addStay(s,p,row));
  });
  timeline.style.height = `${62 + properties.length*rowHeight()}px`;
}
function addStay(s,p,row){
  const inOff = diffDays(startDate, new Date(s.in+'T00:00:00'));
  const outOff = diffDays(startDate, new Date(s.out+'T00:00:00'));
  if(outOff<0 || inOff>days.length) return;
  const left = (inOff + .5) * CELL;
  const width = Math.max(CELL, (outOff - inOff - 1) * CELL);
  const bar=document.createElement('div');
  bar.className='booking'; bar.style.color=p.color; bar.style.left=`${left}px`; bar.style.top=`${62 + row*rowHeight() + 18}px`; bar.style.width=`${width}px`; bar.innerHTML=`<span>${s.guest}</span>`;
  timeline.appendChild(bar);
  const dot=document.createElement('div'); dot.className='checkout'; dot.style.left=`${outOff*CELL - 10}px`; dot.style.top=`${62 + row*rowHeight() + 29}px`; timeline.appendChild(dot);
}
function rowHeight(){return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--row-h')) || 78}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function iso(d){return d.toISOString().slice(0,10)}
function diffDays(a,b){return Math.round((b-a)/86400000)}
function soft(hex){
  const c=hex.replace('#',''); const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);
  return `linear-gradient(90deg, rgba(${r},${g},${b},.24), rgba(${r},${g},${b},.11))`;
}
document.getElementById('todayBtn').onclick=()=>timelineWrap.scrollLeft=CELL*2;
document.getElementById('backBtn').onclick=()=>timelineWrap.scrollBy({left:-CELL*7,behavior:'smooth'});
document.getElementById('forwardBtn').onclick=()=>timelineWrap.scrollBy({left:CELL*7,behavior:'smooth'});
init();
