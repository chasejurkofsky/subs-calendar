console.log("Connected");

const dateText = document.getElementById("date");
const calendarGrid = document.querySelector(".calendar-grid");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let currentDate = new Date();

// repeating paydays
const paydays = [
  {
    name: "Daycare Payday",
    start: new Date(2026, 3, 14), // April 14, 2026
    img_src: "images/daycare.png"
  },
  {
    name: "McDonalds Payday",
    start: new Date(2026, 3, 16), // April 16, 2026
    img_src: "images/mcdonalds.png"
  }
];

function getPaydaysForMonth(month, year) {
  const results = [];

  paydays.forEach((payday) => {
    let current = new Date(
      payday.start.getFullYear(),
      payday.start.getMonth(),
      payday.start.getDate()
    );

    while (
      current.getFullYear() < year ||
      (current.getFullYear() === year && current.getMonth() < month)
    ) {
      current.setDate(current.getDate() + 14);
    }

    while (
      current.getFullYear() === year &&
      current.getMonth() === month
    ) {
      results.push({
        name: payday.name,
        day: current.getDate(),
        img_src: payday.img_src
      });

      current = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate()
      );
      current.setDate(current.getDate() + 14);
    }
  });

  return results;
}

async function createCalendar(month, year) {
  const response = await fetch("subscriptions.json");
  const data = await response.json();
  const subscriptions = data.subscriptions;

  const monthlyPaydays = getPaydaysForMonth(month, year);

  calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysThisMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const emptyBox = document.createElement("div");
    emptyBox.className = "cal-box empty";
    calendarGrid.appendChild(emptyBox);
  }

  for (let day = 1; day <= daysThisMonth; day++) {
    const calBox = document.createElement("div");
    calBox.className = "cal-box";

    const subsForDay = subscriptions.filter((sub) => sub.day === day);
    const paydaysForDay = monthlyPaydays.filter((p) => p.day === day);

    if (subsForDay.length && paydaysForDay.length) {
      calBox.classList.add("has-both");
    } else if (subsForDay.length) {
      calBox.classList.add("has-subscriptions");
    } else if (paydaysForDay.length) {
      calBox.classList.add("has-payday");
    }

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    calBox.appendChild(dayNumber);

    if (subsForDay.length) {
      const total = subsForDay.reduce((sum, sub) => sum + sub.price, 0);
      const totalText = document.createElement("div");
      totalText.className = "day-total";
      totalText.textContent = `$${total.toFixed(2)}`;
      calBox.appendChild(totalText);
    }

    const iconWrap = document.createElement("div");
    iconWrap.className = "center-icons";

    subsForDay.forEach((sub) => {
      const wrap = document.createElement("div");
      wrap.className = "sub-icon-wrap";

      const icon = document.createElement("img");
      icon.src = sub.img_src;
      icon.className = "sub-icon";
      icon.alt = sub.name;

      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerHTML = `
        <strong>${sub.name}</strong><br>
        $${sub.price.toFixed(2)}
      `;

      wrap.appendChild(icon);
      wrap.appendChild(tooltip);
      iconWrap.appendChild(wrap);
    });

    paydaysForDay.forEach((payday) => {
      const wrap = document.createElement("div");
      wrap.className = "sub-icon-wrap";

      const icon = document.createElement("img");
      icon.src = payday.img_src;
      icon.className = "sub-icon payday-icon";
      icon.alt = payday.name;

      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerHTML = `<strong>${payday.name}</strong>`;

      wrap.appendChild(icon);
      wrap.appendChild(tooltip);
      iconWrap.appendChild(wrap);
    });

    calBox.appendChild(iconWrap);
    calendarGrid.appendChild(calBox);
  }
}

function updateCalendar() {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  dateText.innerHTML = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  createCalendar(month, year);
}

prevMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  updateCalendar();
});

nextMonthBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  updateCalendar();
});

updateCalendar();