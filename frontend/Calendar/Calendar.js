const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

const calendarHeader = document.getElementById("month-year");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next"); 
const calendarBody = document.getElementById("calendar-body");

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

prevButton.addEventListener("click", () => {
  if (currentMonth === 0) {
    currentMonth = 11;
    currentYear--;
  } else {
    currentMonth--;
  }
  renderCalendar(currentMonth, currentYear);
});
nextButton.addEventListener("click", () => {
  if (currentMonth === 11) {
    currentMonth = 0;
    currentYear++;
  } else {
    currentMonth++;
  }
  renderCalendar(currentMonth, currentYear);
});

renderCalendar(currentMonth, currentYear);