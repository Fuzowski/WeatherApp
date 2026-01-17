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
  });

function renderHourlyForecast(list) {
  const hourlyForecast = document.getElementById("hourlyForecast");
  for (let i = 0; i < list.length; i++) {
    hourlyForecast.innerHTML += renderHourItem(list[i]);
  }
}

function renderHourItem(hourSlot) {
  return `
        <div class="hourItem flex">
            <div>${hourSlot.dt_txt}</div>
            <div>${hourSlot.main.temp}</div>
        </div>
    `;
}
fetch(baseUrl)
.then((res)=> res.json())
.then((data)=> {
  console.log(data);
  renderDailyForecast(data.list.slice(0,8));
});

function renderDailyForecast(list) {
  const dailyForecast = document.getElementById("dailyForecast");
  for(let i = 0; i < list.length; i++) {
    dailyForecast.innerHTML += renderDailyForecast(list[i]);
  }
}

function createDailyForecastCard(daySlot) {
  return `
        <div calss= "dailyForecast flex">
          <div>${daySlot.date}</div>
          <div> Avg Temp: ${daySlot.main.temp}°F</div>
        </div>

  `;
}