const select = document.getElementById("selection");
// Api key stays global so that all functions can use it.
const API_KEY = "c13a15d0f9c61d66257040dc14e1bbc6";

// helper returns temperature unit symbol based on dtopdown value
function getTempUnitSymbol() {
  if (select.value === "imperial") return "°F";
  if (select.value === "metric") return "°C";
  return "K"; //standard
}

function getWindUnitLabel() {
  if (select.value === "imperial") return " mph";
  return "m/s";
}

function searchButton() {
  let value = document.getElementById("Search").value;

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?
q=${value}
&
units=${select.value}
&
appid=${API_KEY}
`;
  getApiHandler(baseUrl, value);
}

function getApiHandler(baseUrl, cityName) {
  fetch(baseUrl)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      // hourly forecast shows first 24 hours (8 x 3-hour blocks)
      renderHourlyForecast(data.list.slice(0, 7));

      // daily forecast uses full list so we can extract unique days
      renderDailyForecast(data.list);
      // today stats widget (feels like, humidity, wind)
      renderTodaysWeather(data.list[0]);
      // main widget (big temp / city / date)
      renderMainWidget(data.list[0], data.city.name, data.city.country);
      //
      renderWeekdayList(data.list);
    });
}
/* Re-fetches with new units whenever dropdown changes
    Uses current Search input value (so the same city updates instantly) */
select.addEventListener("change", (event) => {
  let value = document.getElementById("Search").value;

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?
q=${value}
&
units=${event.target.value}
&
appid=${API_KEY}
`;
  getApiHandler(baseUrl, value);
});

const btn = document.getElementById("searchButton");
btn.addEventListener("click", searchButton);

function getFeelsLike(hourSlot) {
  return Math.round(hourSlot.main.feels_like) + "°F";
}

function getHumidity(hourSlot) {
  return hourSlot.main.humidity + "%";
}

function getWindSpeed(hourSlot) {
  return Math.round(hourSlot.wind.speed) + "mph";
}

function getPrecip(hourSlot) {
  // Rain or snow volume over the last 3 hours
  const rainMm = hourSlot.rain?.["3h"] ?? 0;
  const snowMm = hourSlot.snow?.["3h"] ?? 0;

  const totalMm = rainMm + snowMm;

  // Imperial shows inches, mertic/standard shows mm

  if (select.value === "imperial") {
    return (totalMm / 25.4).toFixed(2) + " in";
  }

  return totalMm.toFixed(1) + " mm";
}


function renderMainWidget(hourSlot, cityName, countryCode) {
  const mainWidget = document.getElementById("mainWidget");

  // Date + time from the forecast item
  const dateObject = new Date(hourSlot.dt_txt);
  const dayName = dateObject.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Main Display values
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
      
        <img class="mainWidgetIcon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
 
      <div class="mainWidgetTemp">${temp}${getTempUnitSymbol()}</div>
      </div>
    </div>
  
  `;
}

// hourly forecast
function renderHourlyForecast(list) {
  const hourlyForecast = document.getElementById("hourlyForecast");
  hourlyForecast.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    hourlyForecast.innerHTML += renderHourItem(list[i]);
  }
}

function renderHourItem(hourSlot) {
  const date = new Date (hourSlot.dt * 1000)
  //const splitDateTime = hourSlot.dt_txt.split(" ");
  //const splitTime = splitDateTime[1].split(":");
  let hour = date.getHours() //splitTime[0];

  if (hour > 12) {
    hour -= 12;
    hour += "PM";
  } else if (hour == 12) {
    hour += "PM";
  } else if (hour == 0) {
    hour = "12AM";
  } else {
    hour += "AM";
  }

  return `
    <div class="hourItem flex">
    <div class='flex'> <img src= "https://openweathermap.org/img/wn/${hourSlot.weather[0].icon}.png">
      <div>${hour}</div> </div>
      <div>${Math.round(hourSlot.main.temp)}${getTempUnitSymbol()}</div>
      </div>
  `;
}

function renderTodaysWeather(hourSlot) {
  const Widget = document.getElementById("widget");

  const feelsLike = getFeelsLike(hourSlot);
  const humidity = getHumidity(hourSlot);
  const wind = getWindSpeed(hourSlot);

  Widget.innerHTML = `
      
      <div> 
      
      <div>Feels like</div : 
      
      <div>${feelsLike}</div> 
      
      </div>
     
      <div>
      
      <div> Humidity:</div> 
      
      <div> ${humidity}</div> 
      
      </div>
      
      <div>
      
      <div> Wind:</div> 
      
      <div>${wind}</div> 
      
      </div>
      
      <div>
      
      <div>Precipitation</div>
      
      <div>${getPrecip(hourSlot)}</div>
      
      </div>

      
  `;
}
// daily forecast
function renderDailyForecast(list) {
  const dailyForecast = document.getElementById("dailyForecast");
  dailyForecast.innerHTML = "";

  const renderedDays = new Set(); // this will track weekdays already rendered
  const MAX_DAYS = 7;

  for (let i = 0; i < list.length; i++) {
    const daySlot = list[i];

    // convert date-time string into Date object
    const dateObject = new Date(daySlot.dt_txt);

    // get weekday number (0–6)
    const weekdayNumber = dateObject.getDay();

    // stop once max number of days is reached
    if (renderedDays.size === MAX_DAYS) {
      break;
    }

    // only render the day if it hasn't been shown yet
    if (!renderedDays.has(weekdayNumber)) {
      renderedDays.add(weekdayNumber);
      dailyForecast.innerHTML += createDailyForecastCard(daySlot);
    }
  }
}

function createDailyForecastCard(daySlot) {
  const dateObject = new Date(daySlot.dt_txt);

  let language = dateObject.toLocaleDateString("us-US", {
    weekday: "short",
  });

  return `
    <div class="dailyForecast">
      <div>${language}</div>
      <img src= "https://openweathermap.org/img/wn/${daySlot.weather[0].icon}.png">
      <div class="flex">
        <div>${daySlot.main.temp_min}${getTempUnitSymbol()}</div>
        <div>${daySlot.main.temp_max}${getTempUnitSymbol()}</div>
      </div>
    </div>
  `;
}

function renderWeekdayList(list) {
  const renderedDays = new Set(); // this will track weekdays already rendered
  const selectWeekday = document.getElementById ("selectWday");
  

  for (let i = 0; i < list.length; i++) {
    const daySlot = list[i];

    // convert date-time string into Date object
    const dateObject = new Date(daySlot.dt *1000);

    // get weekday number (0–6)
    const weekday = dateObject.toLocaleDateString("us-US",{
      weekday: "long"
    });
    console.log(weekday)
    
    // only render the day if it hasn't been shown yet
    if (!renderedDays.has(weekday)) {
      renderedDays.add(weekday); 
      selectWeekday.innerHTML += `<option>${weekday}</option>`;
    }
  }
  
}
// homework: find out how to group by weekday break 40 slots into sub groups. need to find out how to group forecast by weekday.