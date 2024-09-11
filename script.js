const apiKey = '82005d27a116c2880c8f0fcb866998a0';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

const weatherTemperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('description');
const locationName = document.getElementById('location');
const weatherIcon = document.getElementById('weather-icon');
const cityErrorMessage = document.getElementById('error-message');
const locationErrorMessage = document.getElementById('location-error-message');
const loader = document.getElementById('loader');
const weatherDetails = document.querySelector('.weather-details');

let isFetching = false; // Prevent multiple API calls
let locationAccessShown = false; // Flag to track if location access message has been shown

// Utility functions
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Clear weather data
function clearWeatherData() {
    weatherTemperature.textContent = '';
    weatherDescription.textContent = '';
    locationName.textContent = '';
    weatherIcon.src = '';
    weatherIcon.style.display = 'none';
    document.getElementById('humidity').textContent = '';
    document.getElementById('wind-speed').textContent = '';
    document.getElementById('pressure').textContent = '';
    document.getElementById('feels-like').textContent = '';
}

// Update weather display in the UI
function updateWeatherDisplay(data) {
    const temperatureInCelsius = data.main && data.main.temp ? kelvinToCelsius(data.main.temp) : 'N/A';
    weatherTemperature.textContent = `${temperatureInCelsius}°C`;
    weatherDescription.textContent = data.weather[0].description;
    locationName.textContent = `${data.name}, ${data.sys.country}`;

    const iconCode = data.weather[0].icon;
    weatherIcon.src = `./images/${iconCode}.png`;
    weatherIcon.style.display = 'block';

    // Update additional details
    document.getElementById('humidity').textContent = `${data.main.humidity}`;
    document.getElementById('wind-speed').textContent = `${(data.wind.speed * 3.6).toFixed(2)}`;
    document.getElementById('pressure').textContent = `${data.main.pressure}`;
    document.getElementById('feels-like').textContent = `${kelvinToCelsius(data.main.feels_like)}`;

    // Show weather details and hide loader
    weatherDetails.style.display = 'grid';
    loader.style.display = 'none';

    // Change background based on sunrise and sunset
    const currentTime = new Date().getTime() / 1000;
    const { sunrise, sunset } = data.sys;

    if (currentTime >= sunrise && currentTime < sunset) {
        document.body.classList.add('day');
        document.body.classList.remove('night');
    } else {
        document.body.classList.add('night');
        document.body.classList.remove('day');
    }
}

// Fetch weather data from API
async function fetchWeatherData(url) {
    if (isFetching) return; // Prevent multiple API calls
    isFetching = true;

    try {
        loader.style.display = 'block';
        weatherDetails.style.display = 'none';
        cityErrorMessage.style.display = 'none'; // Hide city error message if showing

        const response = await fetch(url);
        if (!response.ok) throw new Error('City not found');

        const data = await response.json();
        cityErrorMessage.style.display = 'none';
        updateWeatherDisplay(data);
    } catch (error) {
        clearWeatherData(); // Clear previous weather data
        cityErrorMessage.textContent = error.message;
        cityErrorMessage.style.display = 'block';
        weatherIcon.style.display = 'none';
        weatherDetails.style.display = 'none';
    } finally {
        isFetching = false;
        loader.style.display = 'none';
    }
}

// Fetch weather data based on coordinates (geolocation)
function retrieveWeatherByCoordinates(lat, lon) {
    const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetchWeatherData(url);
}

// Fetch weather data by city name (search input)
function retrieveWeatherByCity(city) {
    const url = `${apiUrl}?q=${city}&appid=${apiKey}`;
    fetchWeatherData(url);
}

// Handle location success
function onLocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    retrieveWeatherByCoordinates(latitude, longitude);
    locationErrorMessage.style.display = 'none';
    locationAccessShown = true; // Update flag when location is successfully used
}

// Handle location error
function onLocationError() {
    if (!locationAccessShown) { // Only show location access message if not shown before
        locationErrorMessage.textContent = 'Location is not enabled. Please allow location access.';
        locationErrorMessage.style.display = 'block';
    }
    weatherIcon.style.display = 'none';
}

// On page load, get user's location
window.onload = () => {
    loader.style.display = 'none';
    weatherDetails.style.display = 'none';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
    } else {
        locationErrorMessage.textContent = 'Geolocation is not supported by this browser.';
        locationErrorMessage.style.display = 'block';
        weatherIcon.style.display = 'none';
    }
}

// Event listener for search button
document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('location-input').value.trim();
    if (city) {
        loader.style.display = 'block';
        weatherDetails.style.display = 'none';
        cityErrorMessage.style.display = 'none'; // Hide city error message if showing
        locationErrorMessage.style.display = 'none'; // Hide location error message if showing
        retrieveWeatherByCity(city);
    } else {
        alert('Please enter a city name');
    }
});
