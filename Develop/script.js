const searchButton = document.querySelector('.search_btn');
const weatherCardsDiv = document.querySelector('.weather_cards');
const cityInput = document.querySelector('.input');
const API_KEY = "5f125cc3c4a753f2b1176b743f50edbf";

const createWeatherCard = (weatherItem) => {
    // Convert Kelvin to Fahrenheit
    const temperatureFahrenheit = ((weatherItem.main.temp - 273.15) * 9/5 + 32).toFixed(1);

    // Convert m/s to mph for wind speed
    const windSpeedMph = (weatherItem.wind.speed * 2.23694).toFixed(2);

    return `<li class="card">
                <h2>(${weatherItem.dt_txt.split("")[0]})</h2>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temperature: ${temperatureFahrenheit}°F</h4>
                <h4>Wind: ${windSpeedMph} MPH</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
}

const getWeatherDetails = (cityName, lat, lon) => {
     const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then (res => res.json()).then(data => {
        console.log(data);

        // Gets only one forecast per day instead of every 3 hours.
        const uniqueForecastDays = [];
        const fiveDayForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        console.log(fiveDayForecast);
        fiveDayForecast.forEach(weatherItem => {
            weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(weatherItem));
        });
    }).catch(() => {
        alert("An error occured while fetching the coordinates.")
    });
}

const cityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if(!cityName) return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`

    fetch(API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const { name, lat, lon} = data [0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("An error occured while fetching the coordinates.")
    });
};

searchButton.addEventListener("click", cityCoordinates);