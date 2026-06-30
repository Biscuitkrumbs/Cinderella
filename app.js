let bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
let editingIndex = null;

document.addEventListener("DOMContentLoaded", () => {
  addBookingBtn.onclick = () => openBooking();
  cancelBookingBtn.onclick = () => bookingDialog.close();
  bookingForm.onsubmit = saveBooking;

  feedbackBtn.onclick = () => feedbackDialog.showModal();
  cancelFeedbackBtn.onclick = () => feedbackDialog.close();
  feedbackForm.onsubmit = saveFeedback;

  cancelIssueBtn.onclick = () => issueDialog.close();
  issueForm.onsubmit = saveIssue;

  render();
});

function openBooking(index = null) {
  editingIndex = index;

  if (index !== null) {
    const b = bookings[index];
    propertyInput.value = b.property;
    guestInput.value = b.guest;
    checkInInput.value = b.checkIn;
    checkOutInput.value = b.checkOut;
  } else {
    bookingForm.reset();
  }

  bookingDialog.showModal();
}

function saveBooking(e) {
  e.preventDefault();

  const booking = {
    property: propertyInput.value.trim(),
    guest: guestInput.value.trim(),
    checkIn: checkInInput.value,
    checkOut: checkOutInput.value,
    status: "pending"
  };

  if (editingIndex !== null) {
    bookings[editingIndex] = booking;
  } else {
    bookings.push(booking);
  }

  saveLocal();
  bookingDialog.close();
  render();
  sendToSheet("saveBooking", booking);
}

function deleteBooking(index) {
  if (!confirm("Delete this stay?")) return;
  bookings.splice(index, 1);
  saveLocal();
  render();
}

function openIssue(index) {
  issueBookingIndex.value = index;
  issueForm.reset();
  issueDialog.showModal();
}

function saveIssue(e) {
  e.preventDefault();

  const b = bookings[issueBookingIndex.value];

  const issue = {
    date: new Date().toISOString(),
    property: b.property,
    guest: b.guest,
    type: issueTypeInput.value,
    notes: issueNotesInput.value.trim(),
    status: "open"
  };

  issueDialog.close();
  sendToSheet("saveIssue", issue);
  alert("Issue saved");
}

function saveFeedback(e) {
  e.preventDefault();

  const feedback = {
    date: new Date().toISOString(),
    comment: feedbackInput.value.trim()
  };

  feedbackDialog.close();
  feedbackForm.reset();
  sendToSheet("saveFeedback", feedback);
}

function saveLocal() {
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function render() {
  renderPlanner();
  renderToday();
}

function renderPlanner() {
  planner.innerHTML = "";

  const days = getWeek();
  const properties = [...new Set(bookings.map(b => b.property))];

  const grid = document.createElement("div");
  grid.className = "planner-grid";

  grid.appendChild(cell(""));
  days.forEach(d => grid.appendChild(cell(formatDay(d), "heading")));

  properties.forEach(property => {
    grid.appendChild(cell(property, "property"));

    days.forEach(day => {
      const dayCell = cell("", "day-cell");

      bookings.forEach((b, index) => {
        if (b.property !== property) return;
        if (!isStartDay(day, b.checkIn)) return;

        const nights = stayLength(b);
        const bar = document.createElement("div");
        bar.className = "booking";
        bar.style.width = `${nights * 96}px`;
        bar.innerHTML = `<strong>${b.guest}</strong>`;
        bar.onclick = () => openBooking(index);
        bar.oncontextmenu = e => {
          e.preventDefault();
          openIssue(index);
        };

        dayCell.appendChild(bar);
      });

      grid.appendChild(dayCell);
    });
  });

  planner.appendChild(grid);
}

function renderToday() {
  const today = iso(new Date());
  const todays = bookings.filter(b => b.checkOut === today);

  todaySummary.textContent = `${todays.length} cleans today`;
  cleanCount.textContent = `${todays.length} cleans`;
  progressText.textContent = `0 of ${todays.length}`;
  progressPercent.textContent = "0%";
  upNext.textContent = todays[0]?.property || "All done";

  todayList.innerHTML = "";

  todays.forEach(b => {
    const index = bookings.indexOf(b);
    const div = document.createElement("div");
    div.className = "clean-item";
    div.innerHTML = `
      <strong>${b.property}</strong>
      <p>${b.guest}</p>
      <p>Checkout 10:00am</p>
      <button class="primary" onclick="openIssue(${index})">Report issue</button>
      <button onclick="openBooking(${index})">Edit</button>
      <button onclick="deleteBooking(${index})">Delete</button>
    `;
    todayList.appendChild(div);
  });
}

async function sendToSheet(action, data) {
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action, data })
    });
  } catch {
    console.log("Saved locally only", action, data);
  }
}

function getWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function cell(text, cls = "") {
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = text;
  return div;
}

function formatDay(d) {
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric" });
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function isStartDay(day, checkIn) {
  return iso(day) === checkIn;
}

function stayLength(b) {
  return Math.max(1, Math.round((new Date(b.checkOut) - new Date(b.checkIn)) / 86400000));
}
