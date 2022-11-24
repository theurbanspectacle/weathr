const apiKey = "80c015ec0e33ae10f3ea34a6f8a58570"; 
let currentFiveDay = [];
let currentWeather = {};
let currentCity = '';
//format dates for UI
function readableDate(date) {
    return new Date(date).toLocaleDateString();
}

// Taking weather area DIV from HTML and injecting bootstrap syntax

function renderWeather() {
    
    const parent = document.querySelector('#weather-area');
    
    if (!currentCity) {
        parent.innerHTML = '';
        return;
    }

    const forecast = currentFiveDay.map(item => {
        return `<div class="card forecast-item">
            <div class="card-body">
                <strong>${readableDate(item.date)}</strong>
                <p>Condition: ${item.condition.main}</p>
                <p>Temp: ${item.temp}&#176; F</p>
                <p>Wind: ${item.wind} MPH</p>
                <p>Humidity: ${item.humidity}%</p>
            </div>
        </div>`;
    })

    parent.innerHTML = `
        <div class="card">
            <div class="card-body current-weather">
                <h2>${currentCity} (${readableDate(currentWeather.date)})</h2>
                <p class="lead">Condition: ${currentWeather.condition.main}</p>
                <p class="lead">Temp: ${currentWeather.temp}&#176; F</p>
                <p class="lead">Wind: ${currentWeather.wind} MPH</p>
                <p class="lead">Humidity: ${currentWeather.humidity}%</p>
            </div>
        </div>
        <h2>5 day forecast</h2>
        <div class="forecast">${forecast.join('')}</div>

    `;
}

// API calls and waiting for both of them to finish
function triggerSearch(city) {
    currentFiveDay = [];
    currentCity = '';
    currentWeather = {};

    const apiCalls = [
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`).then((response) => response.json()).then(data => {
            data.list.forEach(item => {
                if (item.dt_txt.includes('12:00')) {
                    currentFiveDay.push({
                        date: item.dt_txt,
                        temp: item.main.temp,
                        wind: item.wind.speed,
                        humidity: item.main.humidity,
                        condition: item.weather[0],
                    })
                }
            });
        }),
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`).then((response) => response.json()).then(data => {
            currentCity = data.name;
            currentWeather = {
                date: new Date().toISOString(),
                temp: data.main.temp,
                wind: data.wind.speed,
                humidity: data.main.humidity,
                condition: data.weather[0],
            };
        }).catch(() => {
            alert('Invalid city');
        }),
    ];

    Promise.allSettled(apiCalls).then(() => {
        renderWeather();
    })

}
// Taking DIV and injecting list of past cities
function renderPastSearches() {
    const currentStorage = JSON.parse(localStorage.getItem("weather-city-search") || "[]");
    let html = "";
    currentStorage.forEach(element => {
        html += `<button type="button" class="btn btn-secondary" onclick="triggerSearch('${element}')" >${element}</button>`; 
    });
    const parent = document.querySelector("#past-searches");
    parent.innerHTML = html;
}
// Callback for search button from HTML

function search() {
   const value = document.querySelector("#city-search-input").value; 
    if (value) { 
       const currentStorage = JSON.parse(localStorage.getItem("weather-city-search") || "[]");
       if (!currentStorage.includes(value)) {
        currentStorage.unshift(value);
        localStorage.setItem("weather-city-search", JSON.stringify(currentStorage));
       }
       triggerSearch(value); 
       renderPastSearches();
    }
}

// Take input and add event listener for enter
document.querySelector('#city-search-input').addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        search();
    }
})
// renders past searches on page load
renderPastSearches();