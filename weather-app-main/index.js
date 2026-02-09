const select = document.getElementById("selection");
const API_KEY = "c13a15d0f9c61d66257040dc14e1bbc6";
function searchButton() {
  let value = document.getElementById("Search").value;

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?
q=${value}
&
units=${select.value}
&
appid=${API_KEY}
`;
  getApiHandler(baseUrl);
}

function getApiHandler(baseUrl) {
  
  fetch(baseUrl)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      // hourly forecast shows first 24 hours (8 x 3-hour blocks)
      renderHourlyForecast(data.list.slice(0, 7));

      // daily forecast uses full list so we can extract unique days
      renderDailyForecast(data.list);

      renderTodaysWeather(data.list[0]);

      renderMainWidget(data.list[0], value);
    });
}


select.addEventListener("change", (event) => {
  let value = document.getElementById("Search").value;

  const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?
q=${value}
&
units=${event.target.value}
&
appid=${API_KEY}
`;
  getApiHandler(baseUrl);
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
// setInterval(()=>{
// let classN = document.body.className;
// if(classN==='light'){
//     document.body.className = 'dark'
// }else{
//     document.body.className = 'light'
// }
// },2000)

function renderMainWidget(hourSlot, cityName) {
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
        
          <div class="mainWidgetCity">${cityName}</div>
          <div class="mainWidgetDay">${dayName}</div>
        </div>

      <div class="flex"> 
      
      <div class="mainWidgetDesc"><img src= "https://openweathermap.org/img/wn/${icon}.png"></div> 
      <div class="mainWidgetTemp">${temp}°F</div>
      </div>
    </div>
  
  `;
}

function renderHourlyForecast(list) {
  const hourlyForecast = document.getElementById("hourlyForecast");
  hourlyForecast.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    hourlyForecast.innerHTML += renderHourItem(list[i]);
  }
}

function renderHourItem(hourSlot) {
  const splitDateTime = hourSlot.dt_txt.split(" ");
  const splitTime = splitDateTime[1].split(":");
  let hour = splitTime[0];

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
      <div>${Math.round(hourSlot.main.temp)}°F</div>
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
      <div>Feels like</div : <div>${feelsLike}</div> 
      </div>
      <div>
      <div> Humidity:</div> <div> ${humidity}</div> 
      </div>
      <div>
      <div> Wind:</div> <div>${wind}</div> 
      </div>
      
  `;
}

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
        <div>${daySlot.main.temp_min}°F</div>
        <div>${daySlot.main.temp_max}°F</div>
      </div>
    </div>
  `;
}

// new homework. figure out how to fix units.change units from F c or K depending on which metric unit is selected.
