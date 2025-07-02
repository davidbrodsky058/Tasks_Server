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

// Fetch Hebrew date and holidays for a given Gregorian date using Hebcal API
async function getHebrewInfo(year, month, day) {
  // Hebcal API expects month 1-12, so month+1
  const url = `https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month + 1}&gd=${day}&g2h=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    // Extract Hebrew day and month (e.g., "1 Tishrei 5785" -> ["1", "Tishrei", "5785"])
    let hebrewDay = "", hebrewMonth = "", hebrewYear = "";
    if (data.hebrew) {
      const parts = data.hebrew.split(" ");
      if (parts.length >= 3) {
        hebrewDay = parts[0];
        hebrewMonth = parts[1];
        hebrewYear = parts[2];
      }
    }
    return {
      hebrewDay,
      hebrewMonth,
      holidays: (data.events || []).filter(e => e !== "Shabbat" && !e.startsWith("Parashat"))
    };
  } catch (e) {
    return { hebrewDay: "", hebrewMonth: "", holidays: [] };
  }
}

function renderCalendar(month, year) {
  calendarBody.innerHTML = "";
  calendarHeader.textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const events = loadEvents();

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

    // Add only Hebrew date (day + Jewish month) and holidays asynchronously
    (async () => {
      const info = await getHebrewInfo(year, month, day);
      if (info.hebrewDay && info.hebrewMonth) {
        const hebrewSpan = document.createElement("div");
        hebrewSpan.className = "hebrew-date";
        hebrewSpan.textContent = `${info.hebrewDay} ${info.hebrewMonth}`;
        cell.appendChild(hebrewSpan);
      }
      if (info.holidays && info.holidays.length > 0) {
        info.holidays.forEach(event => {
          const eventDiv = document.createElement("div");
          eventDiv.className = "hebrew-holiday";
          eventDiv.textContent = event;
          cell.appendChild(eventDiv);
        });
      }
    })();

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
          eventBox.className = "event-box added";
          eventBox.textContent = eventText;
          cell.appendChild(eventBox);
          setTimeout(() => eventBox.classList.remove("added"), 800);
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

    // Add only Hebrew date (day + Jewish month) and holidays asynchronously
    (async () => {
      const info = await getHebrewInfo(d.getFullYear(), d.getMonth(), d.getDate());
      if (info.hebrewDay && info.hebrewMonth) {
        const hebrewSpan = document.createElement("div");
        hebrewSpan.className = "hebrew-date";
        hebrewSpan.textContent = `${info.hebrewDay} ${info.hebrewMonth}`;
        cell.appendChild(hebrewSpan);
      }
      if (info.holidays && info.holidays.length > 0) {
        info.holidays.forEach(event => {
          const eventDiv = document.createElement("div");
          eventDiv.className = "hebrew-holiday";
          eventDiv.textContent = event;
          cell.appendChild(eventDiv);
        });
      }
    })();

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
          eventBox.className = "event-box added";
          eventBox.textContent = eventText;
          cell.appendChild(eventBox);
          setTimeout(() => eventBox.classList.remove("added"), 800);
        }
      }
    });
    row.appendChild(cell);
  }
  calendarBody.appendChild(row);
}

function animateCalendarChange(renderFn, ...args) {
  calendarBody.classList.add('calendar-fade-out');
  setTimeout(() => {
    renderFn(...args);
    calendarBody.classList.remove('calendar-fade-out');
    calendarBody.classList.add('calendar-fade-in');
    setTimeout(() => {
      calendarBody.classList.remove('calendar-fade-in');
    }, 300);
  }, 300);
}

toggleViewButton.addEventListener("click", () => {
  if (viewMode === "month") {
    viewMode = "week";
    toggleViewButton.textContent = "Month View";
    currentWeekStart = getWeekStart(new Date(currentYear, currentMonth, today.getDate()));
    animateCalendarChange(renderWeek, currentWeekStart);
  } else {
    viewMode = "month";
    toggleViewButton.textContent = "Week View";
    animateCalendarChange(renderCalendar, currentMonth, currentYear);
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
    animateCalendarChange(renderCalendar, currentMonth, currentYear);
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    animateCalendarChange(renderWeek, currentWeekStart);
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
    animateCalendarChange(renderCalendar, currentMonth, currentYear);
  } else {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    animateCalendarChange(renderWeek, currentWeekStart);
  }
});

// Initial render
renderCalendar(currentMonth, currentYear);