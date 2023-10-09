const searchButton = document.querySelector('.search_btn');
const weatherCardsDiv = document.querySelector('.weather_cards');
const currentWeather = document.querySelector('.current_weather');
const cityInput = document.querySelector('.input');
const searchHistoryContainer = document.querySelector('.search_history_container'); // Added this line
const API_KEY = "5f125cc3c4a753f2b1176b743f50edbf";

const saveToLocalStorage = (city) => {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
  }
};

const displaySearchHistory = () => {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  // Clear previous search history
  searchHistoryContainer.innerHTML = '';
  // Create buttons for each city in the search history
  cities.forEach((city) => {
    const button = document.createElement("button");
    button.textContent = city;
    button.classList.add("search_history_button");
    // Add a click event listener to fetch weather data for the clicked city
    button.addEventListener("click", () => {
      cityInput.value = city;
      cityCoordinates();
    });
    searchHistoryContainer.appendChild(button);
  });
};

const createWeatherCard = (cityName, weatherItem, index) => {
  // Convert Kelvin to Fahrenheit
  const temperatureFahrenheit = ((weatherItem.main.temp - 273.15) * 9 / 5 + 32).toFixed(1);

  // Convert m/s to mph for wind speed
  const windSpeedMph = (weatherItem.wind.speed * 2.23694).toFixed(2);

  const date = new Date(weatherItem.dt_txt); // Parse the date from dt_txt

  if (index === 0) { // Sends weather data to today's forecast
    return `<section class="details">
        <h2>${cityName}  -  ${date.toDateString()}</h2>
        <h4>Temperature: ${temperatureFahrenheit}°F</h4>
        <h4>Wind: ${windSpeedMph} MPH</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </section>
    <section class="icon">
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
        <h4>${weatherItem.weather[0].description}</h4>
    </section>`;
  } else { // Sends data for 5-day forecast
    return `<li class="card">
        <h2>${date.toDateString()}</h2>
        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
        <h4>Temperature: ${temperatureFahrenheit}°F</h4>
        <h4>Wind: ${windSpeedMph} MPH</h4>
        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
    </li>`;
  }
}

const getWeatherDetails = (cityName, lat, lon) => {
  const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  fetch(WEATHER_API_URL)
    .then(res => res.json())
    .then(data => {
      console.log(data);

      // Gets only one forecast per day instead of every 3 hours.
      const uniqueForecastDays = [];
      const fiveDayForecast = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      // Clears all previous weather data.
      cityInput.value = "";
      weatherCardsDiv.innerHTML = "";
      currentWeather.innerHTML = "";

      console.log(fiveDayForecast);
      fiveDayForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeather.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        } else {
          weatherCardsDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
        }
      });
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates.");
    });
}

const cityCoordinates = () => {
  const cityName = cityInput.value.trim();
  if (!cityName) return;
  const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      if (!data.length) return alert(`No coordinates found for ${cityName}`);
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
      saveToLocalStorage(name); // Save searched city to local storage
      displaySearchHistory(); // Display updated search history
    })
    .catch(() => {
      alert("An error occurred while fetching the coordinates.");
    });
};

searchButton.addEventListener("click", cityCoordinates);
window.onload = displaySearchHistory; // Display search history when the page loads