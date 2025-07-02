const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let viewMode = "month"; // "month" or "week"
let currentWeekStart = getWeekStart(today);

const calendarHeader = document.getElementById("month-year");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next"); 
const calendarBody = document.getElementById("calendar-body");
const toggleViewButton = document.getElementById("toggle-view");

function loadEvents(){
    const events = localStorage.getItem("calendarEvents");
    return events ? JSON.parse(events) : {};
}
function saveEvents(events) {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
}

function renderCalendar(month, year) {
  calendarBody.innerHTML = "";
  calendarHeader.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const events = loadEvents(); // Load events once per render

  let row = document.createElement("tr");
  
  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    if (row.children.length === 7) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
    
    const cell = document.createElement("td");
    if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      cell.classList.add("today");
    }
    cell.textContent = day;
    const eventKey = `${year}-${month + 1}-${day}`;
    if (events[eventKey]) {
      const eventBox = document.createElement("div");
      eventBox.className = "event-box";
      eventBox.textContent = events[eventKey];
      cell.appendChild(eventBox);
    }
    cell.addEventListener("click", () => {
        const events = loadEvents();
        const eventText = prompt("Enter event for " + eventKey, events[eventKey] || "");
        if (eventText !== null) {
            const existingBox = cell.querySelector('.event-box');
            if (existingBox) {
                cell.removeChild(existingBox);
            }
            if (eventText.trim() === "") {
                if (events[eventKey]) {
                    delete events[eventKey];
                    saveEvents(events);
                    renderCalendar(currentMonth, currentYear);
                }
            } else {
                events[eventKey] = eventText;
                saveEvents(events);
                const eventBox = document.createElement("div");
                eventBox.className = "event-box";
                eventBox.textContent = eventText;
                cell.appendChild(eventBox);
            }
        }
        });
    row.appendChild(cell);
  }

  while (row.children.length < 7) {
    row.appendChild(document.createElement("td"));
  }
  
  calendarBody.appendChild(row);
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0,0,0,0);
  return d;
}

function renderWeek(weekStartDate) {
  calendarBody.innerHTML = "";
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    weekDates.push(d);
  }
  const headerDate = weekDates[0];
  calendarHeader.textContent = `Week of ${months[headerDate.getMonth()]} ${headerDate.getDate()}, ${headerDate.getFullYear()}`;

  const events = loadEvents();

  const row = document.createElement("tr");
  for (let i = 0; i < 7; i++) {
    const d = weekDates[i];
    const cell = document.createElement("td");
    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      cell.classList.add("today");
    }
    cell.textContent = d.getDate();
    const eventKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (events[eventKey]) {
      const eventBox = document.createElement("div");
      eventBox.className = "event-box";
      eventBox.textContent = events[eventKey];
      cell.appendChild(eventBox);
    }
    cell.addEventListener("click", () => {
      const events = loadEvents();
      const eventText = prompt("Enter event for " + eventKey, events[eventKey] || "");
      if (eventText !== null) {
        const existingBox = cell.querySelector('.event-box');
        if (existingBox) {
          cell.removeChild(existingBox);
        }
        if (eventText.trim() === "") {
          if (events[eventKey]) {
            delete events[eventKey];
            saveEvents(events);
            renderWeek(currentWeekStart);
          }
        } else {
          events[eventKey] = eventText;
          saveEvents(events);
          const eventBox = document.createElement("div");
          eventBox.className = "event-box";
          eventBox.textContent = eventText;
          cell.appendChild(eventBox);
        }
      }
    });
    row.appendChild(cell);
  }
  calendarBody.appendChild(row);
}

toggleViewButton.addEventListener("click", () => {
  if (viewMode === "month") {
    viewMode = "week";
    toggleViewButton.textContent = "Month View";
    currentWeekStart = getWeekStart(new Date(currentYear, currentMonth, today.getDate()));
    renderWeek(currentWeekStart);
  } else {
    viewMode = "month";
    toggleViewButton.textContent = "Week View";
    renderCalendar(currentMonth, currentYear);
  }
});

prevButton.addEventListener("click", () => {
  if (viewMode === "month") {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    renderCalendar(currentMonth, currentYear);
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeek(currentWeekStart);
  }
});
nextButton.addEventListener("click", () => {
  if (viewMode === "month") {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    renderCalendar(currentMonth, currentYear);
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeek(currentWeekStart);
  }
});

// Initial render
renderCalendar(currentMonth, currentYear);