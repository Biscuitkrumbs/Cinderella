// ======================================================
// CINDERELLA
// Application Controller
//
// app.js owns data, forms, dialogs, saving, and editing.
// timeline.js owns drawing the visual timeline.
// ======================================================

const STORAGE_KEY = "cinderella_mvp_data";

const propertyDialog = document.getElementById("propertyDialog");
const propertyForm = document.getElementById("propertyForm");
const newPropertyBtn = document.getElementById("newPropertyBtn");
const cancelPropertyBtn = document.getElementById("cancelPropertyBtn");

const stayDialog = document.getElementById("stayDialog");
const stayForm = document.getElementById("stayForm");
const newStayBtn = document.getElementById("newStayBtn");
const cancelStayBtn = document.getElementById("cancelStayBtn");
const deleteStayBtn = document.getElementById("deleteStayBtn");

const cleanDialog = document.getElementById("cleanDialog");
const cleanForm = document.getElementById("cleanForm");
const cancelCleanBtn = document.getElementById("cancelCleanBtn");
const resetCleanBtn = document.getElementById("resetCleanBtn");

const menuToggleBtn = document.getElementById("menuToggleBtn");
const adminMenu = document.getElementById("adminMenu");

let state = {
  properties: [],
  stays: [],
  cleans: []
};

// ======================================================
// STARTUP
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  bindButtons();

  if (propertyForm) propertyForm.addEventListener("submit", saveProperty);
  if (stayForm) stayForm.addEventListener("submit", saveStay);
  if (cleanForm) cleanForm.addEventListener("submit", saveClean);

  render();
});

function bindButtons() {
  if (menuToggleBtn && adminMenu) {
  menuToggleBtn.addEventListener("click", () => {
    const isHidden = adminMenu.classList.toggle("hidden");

    menuToggleBtn.textContent = isHidden ? "Menu" : "Close Menu";
    menuToggleBtn.setAttribute("aria-expanded", String(!isHidden));
  });
}
  if (newPropertyBtn) newPropertyBtn.addEventListener("click", openNewProperty);
  if (cancelPropertyBtn) cancelPropertyBtn.addEventListener("click", () => propertyDialog.close());

  if (newStayBtn) newStayBtn.addEventListener("click", openNewStay);
  if (cancelStayBtn) cancelStayBtn.addEventListener("click", () => stayDialog.close());
  if (deleteStayBtn) deleteStayBtn.addEventListener("click", deleteCurrentStay);

  if (cancelCleanBtn) cancelCleanBtn.addEventListener("click", () => cleanDialog.close());
  if (resetCleanBtn) resetCleanBtn.addEventListener("click", resetClean);
}

// ======================================================
// DATA STORAGE
// ======================================================

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.properties = Array.isArray(parsed.properties) ? parsed.properties : [];
      state.stays = Array.isArray(parsed.stays) ? parsed.stays : [];
      state.cleans = Array.isArray(parsed.cleans) ? parsed.cleans : [];
      return;
    } catch (error) {
      console.warn("Could not load saved Cinderella data. Starting fresh.", error);
    }
  }

  state = { properties: [], stays: [], cleans: [] };
  saveData();
}

// ======================================================
// DATA LOOKUPS
// ======================================================

function getProperty(propertyId) {
  return state.properties.find(property => property.id === propertyId);
}

function getStay(stayId) {
  return state.stays.find(stay => stay.id === stayId);
}

function getClean(cleanId) {
  return state.cleans.find(clean => clean.id === cleanId);
}

function getCleanForStay(stayId) {
  return state.cleans.find(clean => clean.stayId === stayId);
}

// ======================================================
// MAIN RENDER
// ======================================================

function render() {
  renderProperties();
  renderStays();
  renderCleans();
  renderCleaningSummaryCards();

  if (typeof renderTimelineCalendar === "function") {
    renderTimelineCalendar();
  }
}

// ======================================================
// PROPERTY MANAGER
// ======================================================

function openNewProperty() {
  propertyForm.reset();
  document.getElementById("propertyId").value = "";
  document.getElementById("propertyColour").value = "#8b5cf6";
  document.getElementById("propertyFormTitle").textContent = "Add Property";
  propertyDialog.showModal();
}

function openEditProperty(propertyId) {
  const property = getProperty(propertyId);
  if (!property) return;

  document.getElementById("propertyId").value = property.id;
  document.getElementById("propertyName").value = property.name || "";
  document.getElementById("propertyColour").value = property.colour || "#8b5cf6";
  document.getElementById("propertyAddress").value = property.address || "";
  document.getElementById("ownerName").value = property.ownerName || "";
  document.getElementById("ownerEmail").value = property.ownerEmail || "";
  document.getElementById("ownerPhone").value = property.ownerPhone || "";
  document.getElementById("accessNotes").value = property.accessNotes || "";
  document.getElementById("keyNotes").value = property.keyNotes || "";
  document.getElementById("kingBeds").value = property.kingBeds || 0;
  document.getElementById("queenBeds").value = property.queenBeds || 0;
  document.getElementById("singleBeds").value = property.singleBeds || 0;
  document.getElementById("cleaningNotes").value = property.cleaningNotes || "";

  document.getElementById("propertyFormTitle").textContent = "Edit Property";
  propertyDialog.showModal();
}

function saveProperty(event) {
  event.preventDefault();

  const propertyId = document.getElementById("propertyId").value;
  const existingProperty = propertyId ? getProperty(propertyId) : null;

  const property = {
    id: propertyId || newId("property"),
    name: document.getElementById("propertyName").value.trim(),
    colour: document.getElementById("propertyColour").value,
    address: document.getElementById("propertyAddress").value.trim(),
    ownerName: document.getElementById("ownerName").value.trim(),
    ownerEmail: document.getElementById("ownerEmail").value.trim(),
    ownerPhone: document.getElementById("ownerPhone").value.trim(),
    accessNotes: document.getElementById("accessNotes").value.trim(),
    keyNotes: document.getElementById("keyNotes").value.trim(),
    kingBeds: Number(document.getElementById("kingBeds").value) || 0,
    queenBeds: Number(document.getElementById("queenBeds").value) || 0,
    singleBeds: Number(document.getElementById("singleBeds").value) || 0,
    cleaningNotes: document.getElementById("cleaningNotes").value.trim(),
    archived: existingProperty ? Boolean(existingProperty.archived) : false
  };

  if (!property.name) return;

  if (propertyId) {
    const index = state.properties.findIndex(existing => existing.id === propertyId);
    state.properties[index] = property;
  } else {
    state.properties.push(property);
  }

  saveData();
  propertyDialog.close();
  render();
}

function deleteProperty(propertyId) {
  const property = getProperty(propertyId);
  if (!property) return;

  if (!confirm(`Delete "${property.name}"?\n\nThis will remove it from active properties.`)) return;

  property.archived = true;
  saveData();
  render();
}

function renderProperties() {
  const list = document.getElementById("propertiesList");
  if (!list) return;

  const activeProperties = state.properties.filter(property => !property.archived);

  if (activeProperties.length === 0) {
    list.innerHTML = `<p class="empty-state">No properties yet.</p>`;
    return;
  }

  list.innerHTML = activeProperties.map(property => `
    <div class="item property-item">
      <div class="property-swatch" style="background:${property.colour}"></div>
      <div class="item-main">
        <strong>${escapeHtml(property.name)}</strong>
        <div>${escapeHtml(property.address || "No address yet")}</div>
        <div class="muted">Beds: K${property.kingBeds || 0} Q${property.queenBeds || 0} S${property.singleBeds || 0}</div>
      </div>
      <div class="item-actions">
        <button type="button" onclick="openEditProperty('${property.id}')">Edit</button>
        <button type="button" class="danger" onclick="deleteProperty('${property.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function renderPropertyOptions() {
  const select = document.getElementById("stayPropertyId");
  if (!select) return;

  const activeProperties = state.properties.filter(property => !property.archived);

  select.innerHTML = activeProperties.map(property => `
    <option value="${property.id}">${escapeHtml(property.name)}</option>
  `).join("");
}

// ======================================================
// STAY MANAGER
// ======================================================

function openNewStay() {
  stayForm.reset();
  document.getElementById("stayId").value = "";
  document.getElementById("stayPropertyId").disabled = false;
  document.getElementById("stayFormTitle").textContent = "Add Stay";
  deleteStayBtn.classList.add("secondary-hidden");

  const colourBar = document.getElementById("stayDialogColourBar");
  if (colourBar) colourBar.style.background = "transparent";

  renderPropertyOptions();

  if (state.properties.filter(property => !property.archived).length === 0) {
    alert("Add a property before adding a stay.");
    return;
  }

  stayDialog.showModal();
}

function openEditStay(stayId) {
  const stay = getStay(stayId);
  if (!stay) return;

  const property = getProperty(stay.propertyId);

  renderPropertyOptions();

  document.getElementById("stayId").value = stay.id;
  document.getElementById("stayPropertyId").value = stay.propertyId;
  document.getElementById("guestName").value = stay.guestName || "";
  document.getElementById("arrivalDate").value = stay.arrivalDate || "";
  document.getElementById("departureDate").value = stay.departureDate || "";
  document.getElementById("stayNotes").value = stay.notes || "";
  document.getElementById("stayPropertyId").disabled = true;
  document.getElementById("stayFormTitle").textContent = "Edit Stay";
  deleteStayBtn.classList.remove("secondary-hidden");

  const colourBar = document.getElementById("stayDialogColourBar");
  if (colourBar && property) colourBar.style.background = property.colour;

  stayDialog.showModal();
}

function saveStay(event) {
  event.preventDefault();

  const stayId = document.getElementById("stayId").value;
  const existingStay = stayId ? getStay(stayId) : null;

  const stay = {
    id: stayId || newId("stay"),
    propertyId: document.getElementById("stayPropertyId").value,
    guestName: document.getElementById("guestName").value.trim(),
    arrivalDate: document.getElementById("arrivalDate").value,
    departureDate: document.getElementById("departureDate").value,
    notes: document.getElementById("stayNotes").value.trim(),
    archived: existingStay ? Boolean(existingStay.archived) : false
  };

  if (!stay.propertyId || !stay.guestName || !stay.arrivalDate || !stay.departureDate) return;

  if (stay.departureDate <= stay.arrivalDate) {
    alert("Departure date must be after arrival date.");
    return;
  }

  const hasOverlap = state.stays.some(existing =>
    !existing.archived &&
    existing.propertyId === stay.propertyId &&
    existing.id !== stay.id &&
    stay.arrivalDate < existing.departureDate &&
    stay.departureDate > existing.arrivalDate
  );

  if (hasOverlap) {
    alert("This stay overlaps another booking for the same property.");
    return;
  }

  if (stayId) {
    const index = state.stays.findIndex(existing => existing.id === stayId);
    state.stays[index] = stay;
  } else {
    state.stays.push(stay);
  }

  createOrUpdateCleanForStay(stay);

  saveData();
  stayDialog.close();
  render();
}

function deleteCurrentStay() {
  const stayId = document.getElementById("stayId").value;
  const stay = getStay(stayId);
  if (!stay) return;

  if (!confirm(`Delete stay for ${stay.guestName}?`)) return;

  stay.archived = true;
  const clean = getCleanForStay(stay.id);
  if (clean) clean.archived = true;

  saveData();
  stayDialog.close();
  render();
}

function renderStays() {
  const list = document.getElementById("staysList");
  if (!list) return;

  const activeStays = state.stays.filter(stay => !stay.archived);

  if (activeStays.length === 0) {
    list.innerHTML = `<p class="empty-state">No stays yet.</p>`;
    return;
  }

  list.innerHTML = activeStays
    .slice()
    .sort((a, b) => a.arrivalDate.localeCompare(b.arrivalDate))
    .map(stay => {
      const property = getProperty(stay.propertyId);

      return `
        <div class="item">
          <div class="item-main">
            <strong>${escapeHtml(stay.guestName)}</strong>
            <div>Property: ${escapeHtml(property ? property.name : "Unknown property")}</div>
            <div>${formatDate(stay.arrivalDate)} → ${formatDate(stay.departureDate)}</div>
            <div class="muted">${escapeHtml(stay.notes || "")}</div>
          </div>
          <div class="item-actions">
            <button type="button" onclick="openEditStay('${stay.id}')">Edit</button>
          </div>
        </div>
      `;
    }).join("");
}

// ======================================================
// CLEANING JOBS
// ======================================================

function createOrUpdateCleanForStay(stay) {
  const existingClean = state.cleans.find(clean => clean.stayId === stay.id);
  const property = getProperty(stay.propertyId);

  const clean = {
    id: existingClean ? existingClean.id : newId("clean"),
    propertyId: stay.propertyId,
    stayId: stay.id,
    date: stay.departureDate,
    cleaner: existingClean ? existingClean.cleaner || "" : "",
    status: existingClean ? existingClean.status || "Pending" : "Pending",
    notes: existingClean ? existingClean.notes || "" : "",
    kingBedsChanged: existingClean ? existingClean.kingBedsChanged ?? property?.kingBeds ?? 0 : property?.kingBeds ?? 0,
    queenBedsChanged: existingClean ? existingClean.queenBedsChanged ?? property?.queenBeds ?? 0 : property?.queenBeds ?? 0,
    singleBedsChanged: existingClean ? existingClean.singleBedsChanged ?? property?.singleBeds ?? 0 : property?.singleBeds ?? 0,
    replaceKingBeds: existingClean ? existingClean.replaceKingBeds || 0 : 0,
    replaceQueenBeds: existingClean ? existingClean.replaceQueenBeds || 0 : 0,
    replaceSingleBeds: existingClean ? existingClean.replaceSingleBeds || 0 : 0,
    extras: existingClean ? existingClean.extras || "" : "",
    invoiceNotes: existingClean ? existingClean.invoiceNotes || "" : "",
    archived: existingClean ? Boolean(existingClean.archived) : false
  };

  if (existingClean) {
    const index = state.cleans.findIndex(existing => existing.id === existingClean.id);
    state.cleans[index] = clean;
  } else {
    state.cleans.push(clean);
  }
}

function openCleaningJob(cleanId) {
  const clean = getClean(cleanId);
  if (!clean) return;

  const property = getProperty(clean.propertyId);
  const stay = getStay(clean.stayId);

  document.getElementById("cleanId").value = clean.id;

  const colourBar = document.getElementById("cleanDialogColourBar");
  if (colourBar && property) colourBar.style.background = property.colour;

  document.getElementById("cleanSummary").innerHTML = `
    <strong>${escapeHtml(property ? property.name : "Unknown property")}</strong><br>
    Guest: ${escapeHtml(stay ? stay.guestName : "Unknown guest")}<br>
    Checkout clean: ${formatDate(clean.date)}
  `;

  document.getElementById("cleanKingBeds").value = clean.kingBedsChanged ?? property?.kingBeds ?? 0;
  document.getElementById("cleanQueenBeds").value = clean.queenBedsChanged ?? property?.queenBeds ?? 0;
  document.getElementById("cleanSingleBeds").value = clean.singleBedsChanged ?? property?.singleBeds ?? 0;

  document.getElementById("replaceKingBeds").value = clean.replaceKingBeds || 0;
  document.getElementById("replaceQueenBeds").value = clean.replaceQueenBeds || 0;
  document.getElementById("replaceSingleBeds").value = clean.replaceSingleBeds || 0;

  document.getElementById("cleanExtras").value = clean.extras || "";
  document.getElementById("invoiceNotes").value = clean.invoiceNotes || "";

  cleanDialog.showModal();
}

function saveClean(event) {
  event.preventDefault();

  const cleanId = document.getElementById("cleanId").value;
  const clean = getClean(cleanId);
  if (!clean) return;

  clean.kingBedsChanged = Number(document.getElementById("cleanKingBeds").value) || 0;
  clean.queenBedsChanged = Number(document.getElementById("cleanQueenBeds").value) || 0;
  clean.singleBedsChanged = Number(document.getElementById("cleanSingleBeds").value) || 0;

  clean.replaceKingBeds = Number(document.getElementById("replaceKingBeds").value) || 0;
  clean.replaceQueenBeds = Number(document.getElementById("replaceQueenBeds").value) || 0;
  clean.replaceSingleBeds = Number(document.getElementById("replaceSingleBeds").value) || 0;

  clean.extras = document.getElementById("cleanExtras").value.trim();
  clean.invoiceNotes = document.getElementById("invoiceNotes").value.trim();
  clean.status = "Completed";

  saveData();
  cleanDialog.close();
  showSuccess();

  setTimeout(() => {
    hideSuccess();
    render();
  }, 750);
}

function resetClean() {
  const cleanId = document.getElementById("cleanId").value;
  const clean = getClean(cleanId);
  if (!clean) return;

  clean.status = "Pending";
  saveData();
  cleanDialog.close();
  render();
}

function renderCleans() {
  const list = document.getElementById("cleansList");
  if (!list) return;

  const activeCleans = state.cleans.filter(clean => !clean.archived);

  if (activeCleans.length === 0) {
    list.innerHTML = `<p class="empty-state">No cleans yet.</p>`;
    return;
  }

  list.innerHTML = activeCleans
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(clean => {
      const property = getProperty(clean.propertyId);
      const stay = getStay(clean.stayId);

      return `
        <div class="item clean-list-item ${clean.status === "Completed" ? "completed-clean" : "pending-clean"}">
          <div class="item-main">
            <strong>${escapeHtml(property ? property.name : "Unknown property")}</strong>
            <div>Clean date: ${formatDate(clean.date)}</div>
            <div>Guest: ${escapeHtml(stay ? stay.guestName : "Unknown guest")}</div>
            <div>Status: ${clean.status}</div>
          </div>
          <div class="item-actions">
            <button type="button" onclick="openCleaningJob('${clean.id}')">Open</button>
          </div>
        </div>
      `;
    }).join("");
}

function renderCleaningSummaryCards() {
  const cards = document.getElementById("cleanSummaryCards");
  if (!cards) return;

  const activeCleans = state.cleans.filter(clean => !clean.archived);
  const pending = activeCleans.filter(clean => clean.status !== "Completed").length;
  const completed = activeCleans.filter(clean => clean.status === "Completed").length;
  const replacements = activeCleans.reduce((total, clean) => {
    return total + (clean.replaceKingBeds || 0) + (clean.replaceQueenBeds || 0) + (clean.replaceSingleBeds || 0);
  }, 0);

  cards.innerHTML = `
    <div class="summary-card"><strong>${pending}</strong><span>Pending cleans</span></div>
    <div class="summary-card"><strong>${completed}</strong><span>Completed</span></div>
    <div class="summary-card"><strong>${replacements}</strong><span>Linen replacements</span></div>
  `;
}

// ======================================================
// SUCCESS FEEDBACK
// ======================================================

function showSuccess() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.classList.remove("hidden");
  playSuccessSound();
}

function hideSuccess() {
  const overlay = document.getElementById("successOverlay");
  if (overlay) overlay.classList.add("hidden");
}

function playSuccessSound() {
  try {
    const audio = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = "triangle";
    osc.frequency.value = 880;
    gain.gain.value = 0.08;

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
    osc.stop(audio.currentTime + 0.35);
  } catch (error) {
    console.warn("Success sound could not play.", error);
  }
}

// ======================================================
// HELPERS
// ======================================================

function formatDate(dateKey) {
  if (!dateKey) return "";
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
