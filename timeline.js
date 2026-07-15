// ======================================================
// CINDERELLA TIMELINE
// Draws the visual booking timeline.
// This file displays data. app.js owns editing and saving.
// ======================================================

const CHECK_IN_HOUR = 18;
const CHECK_OUT_HOUR = 6;
const DAYS_TO_SHOW = 60;
const DAYS_BEFORE_TODAY = 3;

const DESKTOP_DAY_WIDTH = 48;
const MOBILE_DAY_WIDTH = 44;

const DESKTOP_PROPERTY_COLUMN_WIDTH = 180;
const MOBILE_PROPERTY_COLUMN_WIDTH = 90;


function getTimelineDimensions() {
  const isMobile = window.matchMedia("(max-width: 720px)").matches;

  return {
    dayWidth: isMobile ? MOBILE_DAY_WIDTH : DESKTOP_DAY_WIDTH,
    propertyColumnWidth: isMobile
      ? MOBILE_PROPERTY_COLUMN_WIDTH
      : DESKTOP_PROPERTY_COLUMN_WIDTH
  };
}

// ======================================================
// MAIN TIMELINE RENDERER
// ======================================================

function renderTimelineCalendar() {
  const calendar = document.getElementById("timelineCalendar");
  if (!calendar) return;

  const { dayWidth, propertyColumnWidth } = getTimelineDimensions();
  const startDate = addDays(new Date(), -DAYS_BEFORE_TODAY);
  const days = createTimelineDays(startDate, DAYS_TO_SHOW);
  const activeProperties = state.properties.filter(property => !property.archived);

  if (activeProperties.length === 0) {
    calendar.innerHTML = `<p class="empty-state timeline-empty">Add a property to start using the timeline.</p>`;
    return;
  }

  calendar.innerHTML = `
    <div
      class="timeline-grid"
      style="grid-template-columns: ${propertyColumnWidth}px repeat(${DAYS_TO_SHOW}, ${dayWidth}px);"
    >
      ${renderTimelineMonths(days)}
      ${renderTimelineDays(days)}
      ${renderTimelineBody(activeProperties, days, startDate, dayWidth)}
    </div>
  `;
}

// ======================================================
// DATE CREATION
// ======================================================

function createTimelineDays(startDate, daysToShow) {
  const todayKey = toDateKey(new Date());

  return Array.from({ length: daysToShow }, (_, index) => {
    const date = addDays(startDate, index);
    const previousDate = index === 0 ? null : addDays(startDate, index - 1);

    const isNewMonth = index === 0 || date.getMonth() !== previousDate.getMonth();

    return {
      key: toDateKey(date),
      label: date.getDate(),
      dayName: date.toLocaleDateString("en-AU", { weekday: "short" }),
      monthName: date.toLocaleDateString("en-AU", { month: "short", year: "numeric" }),
      isNewMonth,
      isToday: toDateKey(date) === todayKey
    };
  });
}

// ======================================================
// TIMELINE SECTIONS
// ======================================================

function renderTimelineMonths(days) {
  const monthGroups = [];

  days.forEach(day => {
    const lastGroup = monthGroups[monthGroups.length - 1];

    if (!lastGroup || lastGroup.monthName !== day.monthName) {
      monthGroups.push({ monthName: day.monthName, count: 1 });
    } else {
      lastGroup.count++;
    }
  });

  return `
    <div class="timeline-month-corner"></div>
    ${monthGroups.map(group => `
      <div class="timeline-month-cell" style="grid-column: span ${group.count};">
        ${group.monthName.toUpperCase()}
      </div>
    `).join("")}
  `;
}

function renderTimelineDays(days) {
  return `
    <div class="timeline-corner"></div>
    ${days.map(day => `
      <div class="timeline-day-header ${day.isToday ? "today-column" : ""}">
        <div>${day.dayName}</div>
        <strong>${day.label}</strong>
      </div>
    `).join("")}
  `;
}

function renderTimelineBody(properties, days, startDate, dayWidth) {
  return properties
    .map(property => renderPropertyRow(property, days, startDate, dayWidth))
    .join("");
}

// ======================================================
// PROPERTY ROW RENDERING
// ======================================================

function renderPropertyRow(property, days, startDate, dayWidth) {
  const propertyStays = state.stays.filter(stay =>
    !stay.archived && stay.propertyId === property.id
  );

  return `
    <div class="timeline-property" style="background:${property.colour}">
      ${escapeHtml(property.name)}
    </div>

    <div
      class="timeline-row-track"
      style="
        grid-column: span ${DAYS_TO_SHOW};
        grid-template-columns: repeat(${DAYS_TO_SHOW}, ${dayWidth}px);
      "
    >
      ${days.map(day => `
        <div class="timeline-cell ${day.isToday ? "today-column" : ""}"></div>
      `).join("")}

      ${propertyStays
        .map(stay => renderStay(stay, property, startDate, dayWidth))
        .join("")}
    </div>
  `;
}

// ======================================================
// STAY RENDERING
// ======================================================

function renderStay(stay, property, startDate, dayWidth) {
  const clean = getCleanForStay(stay.id);

  const startOffset = daysBetween(toDateKey(startDate), stay.arrivalDate);
  const endOffset = daysBetween(toDateKey(startDate), stay.departureDate);

  if (endOffset < 0 || startOffset >= DAYS_TO_SHOW) return "";

  const startPx =
    startOffset * dayWidth + hourOffset(CHECK_IN_HOUR, dayWidth);

  const endPx =
    endOffset * dayWidth + hourOffset(CHECK_OUT_HOUR, dayWidth);
  const widthPx = endPx - startPx;

  if (widthPx <= 0) return "";

  const cleanClass = clean && clean.status === "Completed" ? "clean-complete" : "clean-pending";
  const cleanTitle = clean && clean.status === "Completed" ? "Clean completed" : "Open cleaning job";

  return `
    <div class="timeline-stay">
      <div
        class="timeline-booking-bar"
        onclick="openEditStay('${stay.id}')"
        style="left: ${startPx}px; width: ${widthPx}px; background: ${property.colour};"
        title="Edit stay"
      >
        ${escapeHtml(stay.guestName)}
      </div>

      <button
        type="button"
        class="clean-dot ${cleanClass}"
        onclick="event.stopPropagation(); handleCleanDotClick('${clean ? clean.id : ""}')"
        style="left: ${endPx - 12}px;"
        title="${cleanTitle}"
      ></button>
    </div>
  `;
}

// ======================================================
// CLEAN HELPERS
// ======================================================

function handleCleanDotClick(cleanId) {
  if (!cleanId) return;
  openCleaningJob(cleanId);
}

// ======================================================
// DATE HELPERS
// ======================================================

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.round((endDate - startDate) / 86400000);
}

function hourOffset(hour, dayWidth) {
  return (hour / 24) * dayWidth;
}
