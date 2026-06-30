const state = {
  currentMonday: getMonday(new Date()),
  bookings: [],
};

const sampleBookings = [
  { property: "Ocean View", guest: "Emma & Nick", checkIn: "2026-07-13", checkOut: "2026-07-15", status: "pending" },
  { property: "Ocean View", guest: "Jake & Sarah", checkIn: "2026-07-16", checkOut: "2026-07-19", status: "pending" },
  { property: "Riverfront", guest: "Michael", checkIn: "2026-07-14", checkOut: "2026-07-17", status: "pending" },
  { property: "White House", guest: "Daniel & Claire", checkIn: "2026-07-15", checkOut: "2026-07-16", status: "pending" },
  { property: "Beachside", guest: "Sophie", checkIn: "2026-07-17", checkOut: "2026-07-19", status: "pending" },
  { property: "Mountain Retreat", guest: "Chris & Pat", checkIn: "2026-07-13", checkOut: "2026-07-20", status: "pending" },
  { property: "Sunset Villa", guest: "Aaron & Jess", checkIn: "2026-07-14", checkOut: "2026-07-16", status: "pending" },
  { property: "Lakeside", guest: "Sarah", checkIn: "2026-07-16", checkOut: "2026-07-17", status: "pending" },
  { property: "Pine Cottage", guest: "Steve & Anna", checkIn: "2026-07-14", checkOut: "2026-07-15", status: "pending" },
  { property: "Harbour House", guest: "Alex", checkIn: "2026-07-13", checkOut: "2026-07-14", status: "pending" }
];

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindButtons();
  loadBookings();
}

function bindButtons() {
  document.getElementById("addBookingBtn").onclick = () => bookingDialog.showModal();
  document.getElementById("cancelBookingBtn").onclick = () => bookingDialog.close();

  document.getElementById("prevWeekBtn").onclick = () => changeWeek(-7);
  document.getElementById("nextWeekBtn").onclick = () => changeWeek(7);
  document.getElementById("todayBtn").onclick = () => {
    state.currentMonday = getMonday(new Date());
    render();
  };

  document.getElementById("bookingForm").onsubmit = saveBooking;

  document.getElementById("feedbackBtn").onclick = () => feedbackDialog.showModal();
  document.getElementById("cancelFeedbackBtn").onclick = () => feedbackDialog.close();
  document.getElementById("feedbackForm").onsubmit = sendFeedback;
}

function changeWeek(days) {
  state.currentMonday.setDate(state.currentMonday.getDate() + days);
  render();
}

async function loadBookings() {
  try {
    if (!SCRIPT_URL) throw new Error("No script URL");

    const res = await fetch(`${SCRIPT_URL}?action=getBookings`);
    const data = await res.json();

    state.bookings = data.bookings?.length ? data.bookings : sampleBookings;
  } catch {
    state.bookings = sampleBookings;
  }

  render();
}

async function saveBooking(event) {
  event.preventDefault();

  const booking = {
    property: propertyInput.value.trim(),
    guest: guestInput.value.trim(),
    checkIn: checkInInput.value,
    checkOut: checkOutInput.value,
    status: "pending"
  };

  state.bookings.push(booking);
  bookingDialog.close();
  bookingForm.reset();
  render();

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addBooking",
        booking
      })
    });
  } catch {
    console.log("Saved locally only");
  }
}

async function sendFeedback(event) {
  event.preventDefault();

  const text = feedbackInput.value.trim();
  feedbackDialog.close();
  feedbackForm.reset();

  if (!text) return;

  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "feedback",
        text
      })
    });
  } catch {
    alert("Feedback saved locally only for now.");
  }
}

function render() {
  renderPlanner();
  renderToday();
}

function renderPlanner() {
  const planner = document.getElementById("planner");
  planner.innerHTML = "";

  const weekDays = getWeekDays(state.currentMonday);
  const properties = [...new Set(state.bookings.map(b => b.property))];

  const grid = document.createElement("div");
  grid.className = "planner-grid";

  grid.appendChild(cell("", "heading"));

  weekDays.forEach(day => {
    const c = cell(formatDay(day), "heading");
    grid.appendChild(c);
  });

  properties.forEach(property => {
    grid.appendChild(cell(property, "property"));

    weekDays.forEach(day => {
      const dayCell = cell("", "day-cell");
      const bookings = state.bookings.filter(b =>
        b.property === property &&
        isDateInStay(day, b.checkIn, b.checkOut)
      );

      bookings.forEach(b => {
        if (sameDate(day, new Date(b.checkIn))) {
          const bar = document.createElement("div");
          bar.className = "booking";
          bar.innerHTML = `<strong>${stayLength(b)} nights</strong><br>${b.guest}`;
          bar.style.width = `${stayLength(b) * 96}px`;
          dayCell.appendChild(bar);
        }
      });

      grid.appendChild(dayCell);
    });
  });

  planner.appendChild(grid);
}

function renderToday() {
  const today = toISO(new Date());
  const cleans = state.bookings.filter(b => b.checkOut === today);
  const done = cleans.filter(b => b.status === "done").length;

  todaySummary.textContent = `You have ${cleans.length} cleans today`;
  progressText.textContent = `${done} of ${cleans.length}`;
  progressPercent.textContent = cleans.length ? `${Math.round((done / cleans.length) * 100)}%` : "0%";
  cleanCount.textContent = `${cleans.length} cleans`;

  const next = cleans.find(b => b.status !== "done");
  upNext.textContent = next ? next.property : "All done";

  todayList.innerHTML = "";

  cleans.forEach((b, index) => {
    const item = document.createElement("div");
    item.className = "clean-item";
    item.innerHTML = `
      <strong>${b.property}</strong>
      <p>${b.guest}</p>
      <p>Checkout 10:00am</p>
      <button class="primary" onclick="completeClean(${index})">
        ${b.status === "done" ? "Completed" : "Complete clean"}
      </button>
    `;
    todayList.appendChild(item);
  });
}

function completeClean(todayIndex) {
  const today = toISO(new Date());
  const cleans = state.bookings.filter(b => b.checkOut === today);
  const target = cleans[todayIndex];
  target.status = "done";
  render();
}

function cell(text, className) {
  const div = document.createElement("div");
  div.className = className;
  div.textContent = text;
  return div;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDay(date) {
  return date.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric"
  });
}

function toISO(date) {
  return date.toISOString().slice(0, 10);
}

function isDateInStay(day, checkIn, checkOut) {
  const d = toISO(day);
  return d >= checkIn && d < checkOut;
}

function sameDate(a, b) {
  return toISO(a) === toISO(b);
}

function stayLength(b) {
  const start = new Date(b.checkIn);
  const end = new Date(b.checkOut);
  return Math.max(1, Math.round((end - start) / 86400000));
}
