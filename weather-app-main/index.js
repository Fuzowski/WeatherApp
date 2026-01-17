function searchButton() {
  document.getElementById("Search").innerHTML = "This button has been clicked";
  alert("Search CLicked");
}

const btn = document.getElementById("searchButton");
btn.addEventListener("click", searchButton);

// setInterval(()=>{
// let classN = document.body.className;
// if(classN==='light'){
//     document.body.className = 'dark'
// }else{
//     document.body.className = 'light'

// }
// },2000)

const API_KEY = "c13a15d0f9c61d66257040dc14e1bbc6";
const baseUrl = `https://api.openweathermap.org/data/2.5/forecast?
lat=44.34
&
units=imperial
&
lon=10.99
&
appid=${API_KEY}
`;

fetch(baseUrl)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    renderHourlyForecast(data.list.slice(0, 8));
     renderDailyForecast(data.list.slice(0,8));
  });

function renderHourlyForecast(list) {
  const hourlyForecast = document.getElementById("hourlyForecast");
  for (let i = 0; i < list.length; i++) {
    hourlyForecast.innerHTML += renderHourItem(list[i]);
  }
}

function renderHourItem(hourSlot) {
  const splitDateTime = hourSlot.dt_txt.split ( " " )
  const splitTime = splitDateTime[1].split(":")
  let hour = splitTime[0]
  if (hour > 12) {
    hour -= 12 
    hour += 'PM'
  } else if (hour == 12) { 
     hour += "PM"

  } else if (hour == 0) {
    hour = "12AM"
    
  } else {
    hour += "AM"
  }

  
  return `
        <div class="hourItem flex">
            <div>${hour}</div>
            <div>${hourSlot.main.temp}</div>
        </div>
    `;
}

function renderDailyForecast(list) {
  const dailyForecast = document.getElementById("dailyForecast");
  dailyForecast.innerHTML = "";

  for(let i = 0; i < list.length; i++) {
    dailyForecast.innerHTML += createDailyForecastCard(list[i]);

  }
}

function createDailyForecastCard(daySlot) { 
  const splitDateTime = daySlot.dt_txt.split ( " " )
 
  return `
        <div class= "dailyForecast">
          <div>${splitDateTime[0]}</div>
          <div class = "flex">
          <div>${(daySlot.main.temp_min)}°F</div>
          <div>${(daySlot.main.temp_max)}°F</div>
          </div>
          
        </div>

  `;

}

// try to find a way to convert date into weekday. this is homework.