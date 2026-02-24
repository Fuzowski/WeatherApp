const select = document.getElementById("selection");
 const selectWeekday =
    document.getElementById("selectWday");
    
// API key stays global
const API_KEY = "c13a15d0f9c61d66257040dc14e1bbc6";


function groupedByWeekday(list) {
return Object.groupBy(
    list,
    (slot) => {
      const dateObject = new Date(slot.dt * 1000);

      return dateObject.toLocaleDateString("en-US", {
        weekday: "long",
      });
    }
  );
}

/* ===============================
   UNIT HELPERS
================================ */

function getTempUnitSymbol() {
  if (select.value === "imperial") return "°F";
  if (select.value === "metric") return "°C";
  return "K";
}

function getWindUnitLabel() {
  if (select.value === "imperial") return " mph";
  return " m/s";
}


/* ===============================
   SEARCH + API HANDLER
================================ */

function searchButton() {
  let value = document.getElementById("Search").value;

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${value}&units=${select.value}&appid=${API_KEY}`;

  getApiHandler(baseUrl, value);
}

function getApiHandler(baseUrl, cityName) {
  fetch(baseUrl)
    .then((res) => res.json())
    .then((data) => {
      
      let group = groupedByWeekday(data.list) 
      renderHourlyForecast(Object.values(group)[0])
      selectWeekday.addEventListener("change",(event)=>{
       const selectedDay = event.target.value 
       const slotsPerDay = group[selectedDay]
        console.log("change", selectedDay, slotsPerDay) 
        renderHourlyForecast(slotsPerDay)
        
              // HW: read only list for specific day on another line 
        //invoke renderHOurlyforecast witha the proper list
      });


    /* HW Practice Object: an object is a collection of related properties and or methods.
  Can reresent real world objects ex: people, products, places (objects cant have same name)
  Object = {key:value,
  function()}

  const Blake = {
  firstname: "Everett", 
  lastname: "Horton",
  age: 30,
  isEmployed: false,
  sayHello: () => {console.log("Hello how are you?")}, this will be a functioin expression
    [] these are used for multi word properties EX "likes pizza": true
     multiword property names must be quoted
  Blake.sayHello
  
  if you need one of these properties take the object we are refering to
  console.log(Blake.firstmame); in the terminal this would read "Everett"
  using the. method can only give single strings with no spaces. can use [] instrad
  }*/

      renderDailyForecast(group);
      renderTodaysWeather(data.list[0]);
      renderMainWidget(
        data.list[0],
        data.city.name,
        data.city.country
      );
      renderWeekdayList(Object.keys(group));
    });
}

select.addEventListener("change", (event) => {
  let value = document.getElementById("Search").value;

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${value}&units=${event.target.value}&appid=${API_KEY}`;

  getApiHandler(baseUrl, value);
});

document
  .getElementById("searchButton")
  .addEventListener("click", searchButton);


/* ===============================
   DATA HELPERS
================================ */

function getFeelsLike(hourSlot) {
  return Math.round(hourSlot.main.feels_like) + getTempUnitSymbol();
}

function getHumidity(hourSlot) {
  return hourSlot.main.humidity + "%";
}

function getWindSpeed(hourSlot) {
  return (
    Math.round(hourSlot.wind.speed) + getWindUnitLabel()
  );
}

function getPrecip(hourSlot) {
  const rainMm = hourSlot.rain?.["3h"] ?? 0;
  const snowMm = hourSlot.snow?.["3h"] ?? 0;

  const totalMm = rainMm + snowMm;

  if (select.value === "imperial") {
    return (totalMm / 25.4).toFixed(2) + " in";
  }

  return totalMm.toFixed(1) + " mm";
}


/* ===============================
   MAIN WIDGET
================================ */

function renderMainWidget(hourSlot, cityName, countryCode) {
  const mainWidget = document.getElementById("mainWidget");

  const dateObject = new Date(hourSlot.dt * 1000);

  const dayName = dateObject.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const temp = Math.round(hourSlot.main.temp);
  const description = hourSlot.weather[0].description;
  const icon = hourSlot.weather[0].icon;

  mainWidget.innerHTML = `
    <div class="mainWidgetCard flex">
      <div class="mainWidgetTop">
        <div class="mainWidgetCity">${cityName}, ${countryCode}</div>
        <div class="mainWidgetDay">${dayName}</div>
      </div>

      <div class="flex">
        <img class="mainWidgetIcon"
          src="https://openweathermap.org/img/wn/${icon}@2x.png"
          alt="${description}">
        <div class="mainWidgetTemp">${temp}${getTempUnitSymbol()}</div>
      </div>
    </div>
  `;
}


/* ===============================
   HOURLY FORECAST
================================ */

function renderHourlyForecast(list) {
  const hourlyForecast =
    document.getElementById("hourlyForecast");

  hourlyForecast.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    hourlyForecast.innerHTML += renderHourItem(list[i]);
  }
}

function renderHourItem(hourSlot) {
  const date = new Date(hourSlot.dt * 1000);
  let hour = date.getHours();

  if (hour > 12) {
    hour -= 12;
    hour += "PM";
  } else if (hour === 12) {
    hour += "PM";
  } else if (hour === 0) {
    hour = "12AM";
  } else {
    hour += "AM";
  }

  return `
    <div class="hourItem flex">
      <div class="flex">
        <img src="https://openweathermap.org/img/wn/${hourSlot.weather[0].icon}.png">
        <div>${hour}</div>
      </div>
      <div>${Math.round(hourSlot.main.temp)}${getTempUnitSymbol()}</div>
    </div>
  `;
}


/* ===============================
   TODAY STATS WIDGET
================================ */

function renderTodaysWeather(hourSlot) {
  const Widget = document.getElementById("widget");

  Widget.innerHTML = `
    <div>
      <div>Feels like</div>
      <div>${getFeelsLike(hourSlot)}</div>
    </div>

    <div>
      <div>Humidity</div>
      <div>${getHumidity(hourSlot)}</div>
    </div>

    <div>
      <div>Wind</div>
      <div>${getWindSpeed(hourSlot)}</div>
    </div>

    <div>
      <div>Precipitation</div>
      <div>${getPrecip(hourSlot)}</div>
    </div>
  `;
}


/* ===============================
   DAILY FORECAST (GROUPED)
================================ */

function renderDailyForecast(groupedByWeekday) {
  const dailyForecast =
    document.getElementById("dailyForecast");

  dailyForecast.innerHTML = "";

  // GROUP ALL 40 SLOTS BY WEEKDAY
   

  console.log("groupedByWeekday:", groupedByWeekday);

  const weekdayEntries =
    Object.entries(groupedByWeekday);

  const MAX_DAYS = 7;

  for (
    let i = 0;
    i < weekdayEntries.length && i < MAX_DAYS;
    i++
  ) {
    const [weekdayName, dayGroup] =
      weekdayEntries[i];

    const middayIndex = 4;
    const safeIndex =
      dayGroup[middayIndex]
        ? middayIndex
        : Math.floor(dayGroup.length / 2);

    const repSlot = dayGroup[safeIndex];

    // compute real daily min/max
    const temps = dayGroup.map(
      (slot) => slot.main.temp
    );

    repSlot.main.temp_min = Math.min(...temps);
    repSlot.main.temp_max = Math.max(...temps);

    dailyForecast.innerHTML +=
      createDailyForecastCard(repSlot);
  }
}


/* ===============================
   DAILY CARD TEMPLATE
================================ */

function createDailyForecastCard(daySlot) {
  const dateObject = new Date(daySlot.dt * 1000);

  const language =
    dateObject.toLocaleDateString("en-US", {
      weekday: "short",
    });

  return `
    <div class="dailyForecast">
      <div>${language}</div>
      <img src="https://openweathermap.org/img/wn/${daySlot.weather[0].icon}.png">
      <div class="flex">
        <div>${Math.round(daySlot.main.temp_min)}${getTempUnitSymbol()}</div>
        <div>${Math.round(daySlot.main.temp_max)}${getTempUnitSymbol()}</div>
      </div>
    </div>
  `;
}


/* ===============================
   WEEKDAY DROPDOWN
================================ */

function renderWeekdayList(weekdays) {
 
 

  selectWeekday.innerHTML = "";

  for (let i = 0; i < weekdays.length; i++) {
   

    const weekday = weekdays[i] 
      
      

    
      selectWeekday.innerHTML +=
        `<option value= "${weekday}">${weekday}</option>`;
         
 
    
  }}


  