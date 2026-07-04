const STORAGE_KEY = "cinderella_mvp_data";

const propertyDialog = document.getElementById("propertyDialog");
const propertyForm = document.getElementById("propertyForm");

const newPropertyBtn = document.getElementById("newPropertyBtn");
const cancelPropertyBtn = document.getElementById("cancelPropertyBtn");

let state = {
  properties: [],
  stays: [],
  cleans: []
};

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    state = JSON.parse(saved);
    return;
  }

  state.properties = [];
  state.stays = [];
  state.cleans = [];
  saveData();
}

function getProperty(propertyId) {
  return state.properties.find(property => property.id === propertyId);
}

function render() {
  renderProperties();
  renderStays();
  renderCleans();
  renderTimeline();
}

function bindButtons() {

  newPropertyBtn.addEventListener("click", openNewProperty);

  cancelPropertyBtn.addEventListener("click", () => {
    propertyDialog.close();
  });

}

function openNewProperty() {
  propertyForm.reset();
  document.getElementById("propertyId").value = "";
  document.getElementById("propertyFormTitle").textContent = "Add Property";
  propertyDialog.showModal();
}

function saveProperty(event) {
  event.preventDefault();

  const propertyId = document.getElementById("propertyId").value;

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
    kingBeds: Number(document.getElementById("kingBeds").value || 0),
    queenBeds: Number(document.getElementById("queenBeds").value || 0),
    singleBeds: Number(document.getElementById("singleBeds").value || 0),
    cleaningNotes: document.getElementById("cleaningNotes").value.trim(),
    archived: false
  };

  
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

  const confirmed = confirm(`Delete "${property.name}"?\n\nThis will remove it from your active properties.`);

  if (!confirmed) return;

  property.archived = true;

  saveData();
  render();
}

function renderProperties() {
  const list = document.getElementById("propertiesList");

  const activeProperties = state.properties.filter(property => !property.archived);

  if (activeProperties.length === 0) {
    list.innerHTML = "<p>No properties yet.</p>";
    return;
  }

  list.innerHTML = activeProperties.map(property => `
    <div class="item">
      <strong>${property.name}</strong>
      <div>${property.address || "No address saved"}</div>
      <div>Owner: ${property.ownerName || "Not set"}</div>
      <div>Beds: ${property.kingBeds}K / ${property.queenBeds}Q / ${property.singleBeds}S</div>
      <button onclick="openEditProperty('${property.id}')">Edit</button>
      <button onclick="deleteProperty('${property.id}')">Delete</button>
    </div>
  `).join("");
}
function openEditProperty(propertyId) {
  const property = getProperty(propertyId);

  if (!property) return;

  document.getElementById("propertyId").value = property.id;
  document.getElementById("propertyName").value = property.name;
  document.getElementById("propertyColour").value = property.colour;
  document.getElementById("propertyAddress").value = property.address;
  document.getElementById("ownerName").value = property.ownerName;
  document.getElementById("ownerEmail").value = property.ownerEmail;
  document.getElementById("ownerPhone").value = property.ownerPhone;
  document.getElementById("accessNotes").value = property.accessNotes;
  document.getElementById("keyNotes").value = property.keyNotes;
  document.getElementById("kingBeds").value = property.kingBeds;
  document.getElementById("queenBeds").value = property.queenBeds;
  document.getElementById("singleBeds").value = property.singleBeds;
  document.getElementById("cleaningNotes").value = property.cleaningNotes;

  document.getElementById("propertyFormTitle").textContent = "Edit Property";

  propertyDialog.showModal();
}
document.addEventListener("DOMContentLoaded", () => {

    loadData();

    bindButtons();

    propertyForm.addEventListener("submit", saveProperty);

    render();

});