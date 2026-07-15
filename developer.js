console.log("developer.js loaded");

// Change to false before sending to Cindy if you want the test buttons hidden.
const DEVELOPER_MODE = true;

document.addEventListener("DOMContentLoaded", () => {
  const tools = document.getElementById("developerTools");
  if (!tools) return;

  if (!DEVELOPER_MODE) {
    tools.style.display = "none";
    return;
  }

  document.getElementById("demoPropertiesBtn")?.addEventListener("click", generateDemoProperties);
  document.getElementById("demoStaysBtn")?.addEventListener("click", generateDemoStays);
  document.getElementById("clearDemoBtn")?.addEventListener("click", clearDemoData);
});

function generateDemoProperties() {
  if (!confirm("Generate demo properties? This will replace existing properties.")) return;

  state.properties = [];
  state.stays = [];
  state.cleans = [];

  const propertyNames = [
    "Barrier Reef Retreat", "SeaBreeze", "Solas Sands", "Paradise Palms", "Moorings",
    "Loka 8", "Loka 12", "Seaside", "The Loft", "Paradise Lights", "Driftwood", "Ocean View"
  ];

  const colours = [
    "#B8A1E3", "#8FB8E8", "#A8CFA8", "#D9B38C", "#D8A5B8", "#D8C27A",
    "#8FCFD1", "#B8C9A0", "#B6B08A", "#E0A7C8", "#7FC8B8", "#9AA6E8"
  ];

  propertyNames.forEach((name, index) => {
    state.properties.push({
      id: newId("property"),
      name,
      colour: colours[index],
      address: "",
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      accessNotes: "",
      keyNotes: "",
      kingBeds: 1,
      queenBeds: 1,
      singleBeds: 2,
      cleaningNotes: "",
      archived: false
    });
  });

  saveData();
  render();
  alert(`${state.properties.length} demo properties created.`);
}

function generateDemoStays() {
  if (state.properties.filter(property => !property.archived).length === 0) {
    alert("Generate properties first.");
    return;
  }

  if (!confirm("Generate demo stays and cleans? This will replace existing stays and cleans.")) return;

  state.stays = [];
  state.cleans = [];

  const guestNames = [
    "Smith Family", "Brown Family", "Wilson Family", "Taylor Family", "Jones Family",
    "Williams Family", "Miller Family", "Johnson Family", "Anderson Family", "White Family"
  ];

  state.properties.filter(property => !property.archived).forEach(property => {
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 2);

    for (let i = 0; i < 8; i++) {
      const gapDays = Math.floor(Math.random() * 3);
      const stayLength = 2 + Math.floor(Math.random() * 5);

      const arrival = new Date(currentDate);
      arrival.setDate(arrival.getDate() + gapDays);

      const departure = new Date(arrival);
      departure.setDate(departure.getDate() + stayLength);

      const stay = {
        id: newId("stay"),
        propertyId: property.id,
        guestName: guestNames[Math.floor(Math.random() * guestNames.length)],
        arrivalDate: arrival.toISOString().slice(0, 10),
        departureDate: departure.toISOString().slice(0, 10),
        notes: "",
        archived: false
      };

      state.stays.push(stay);
      createOrUpdateCleanForStay(stay);
      currentDate = new Date(departure);
    }
  });

  saveData();
  render();
  alert(`${state.stays.length} demo stays created.`);
}

function clearDemoData() {
  if (!confirm("Clear all data?")) return;

  state.properties = [];
  state.stays = [];
  state.cleans = [];

  saveData();
  render();
  alert("Data cleared.");
}
