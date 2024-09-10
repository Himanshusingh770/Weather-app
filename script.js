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


// On page load, get user's location
window.onload = () => {
    loader.style.display = 'none';
    weatherDetails.style.display = 'none';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError);
    } else {
        locationErrorMessage.textContent = 'Geolocation is not supported by this browser.';
        locationErrorMessage.style.display = 'block';
        weatherIcon.style.display = 'none';
    }
};

// Function to handle location success
function handleLocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    fetchWeatherByCoordinates(latitude, longitude);

    // Clear any previous error messages
    locationErrorMessage.style.display = 'none';
    weatherDetails.style.display = 'grid';
}

// Function to handle location error
function handleLocationError(error) {
    locationErrorMessage.textContent = 'Location is not enabled. Please allow location access.';
    locationErrorMessage.style.display = 'block';
    weatherIcon.style.display = 'none';
}

// Fetch weather data based on coordinates (geolocation)
function fetchWeatherByCoordinates(lat, lon) {
    const url = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetchWeatherData(url);
}

// Fetch weather data by city name (search input)
function fetchWeatherByCity(city) {
    const url = `${apiUrl}?q=${city}&appid=${apiKey}`;
    fetchWeatherData(url);
}

// Fetch weather data from API
async function fetchWeatherData(url) {
    try {
        loader.style.display = 'block';
        weatherIcon.style.display = 'none';
        weatherTemperature.textContent = '';
        weatherDescription.textContent = '';
        locationName.textContent = '';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();

        cityErrorMessage.style.display = 'none';
        displayWeatherData(data);
    } catch (error) {
        // Display error message below the search button
        cityErrorMessage.textContent = error.message;
        cityErrorMessage.style.display = 'block';
        weatherIcon.style.display = 'none';
        weatherDetails.style.display = 'none';
    }
    finally {
        loader.style.display = 'none';
    }
}

// Display the fetched weather data in the UI
function displayWeatherData(data) {
    console.log(data);
    
    const temperatureInCelsius = data.main && data.main.temp ? kelvinToCelsius(data.main.temp) : 'N/A';
    weatherTemperature.textContent = `${temperatureInCelsius}°C`;

    weatherDescription.textContent = data.weather[0].description;
    locationName.textContent = `${data.name}, ${data.sys.country}`;

    const iconCode = data.weather[0].icon; 
    weatherIcon.src = `./images/${iconCode}.png`; 
    weatherIcon.style.display = 'block';

    // Update additional details
    document.getElementById('humidity').textContent = data.main.humidity;
    document.getElementById('wind-speed').textContent = (data.wind.speed * 3.6).toFixed(2); 
    document.getElementById('pressure').textContent = data.main.pressure;
    document.getElementById('feels-like').textContent = kelvinToCelsius(data.main.feels_like);

    // Change background based on sunrise and sunset
    const currentTime = new Date().getTime() / 1000; 
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    if (currentTime >= sunrise && currentTime < sunset) {
        document.body.classList.add('day');
        document.body.classList.remove('night');
    } else {
        document.body.classList.add('night');
        document.body.classList.remove('day');
    }
}


function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('location-input').value.trim();
    if (city) {
        fetchWeatherByCity(city);
    } else {
        alert('Please enter a city name');
    }
});
