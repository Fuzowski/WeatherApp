function searchButton() {
  let value = document.getElementById("Search").value;
  const API_KEY = "c13a15d0f9c61d66257040dc14e1bbc6";

const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?
q=${value}
&
units=imperial
&
appid=${API_KEY}
`;

fetch(baseUrl)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);

    // hourly forecast shows first 24 hours (8 x 3-hour blocks)
    renderHourlyForecast(data.list.slice(0, 7));

    // daily forecast uses full list so we can extract unique days
    renderDailyForecast(data.list);
  });
}

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

  const feelsLike = getFeelsLike(hourSlot);
  const humidity = getHumidity(hourSlot);
  const wind = getWindSpeed(hourSlot);

  return `
    <div class="hourItem flex">
      <div>${hour}</div>
      <div>${Math.round(hourSlot.main.temp)}</div>
      <div>Feels like : ${feelsLike}</div>
      <div>Humidity: ${humidity}</div>
      <div>Wind: ${wind}</div>
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
  //2. this should convert the string into a date object
  const dateObject = new Date(daySlot.dt_txt);

  let language=(dateObject.toLocaleDateString("us-US", {
    weekday:"short"
  })) 

  //3. this should get the weekday number (0-6)
 // const weekdayNumber = dateObject.getDay();

  //4. lets create an array of weekday names
  /* const weekdays = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  //5. Now lets use the weekday number to get the name
  const weekdayName = weekdays[weekdayNumber];
*/
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

// new homework. create functions for feels like, humidity and wind if have time work on fixing css
