function updateClock() {
    const now = new Date();
    const clockElement = document.getElementById('clock');
    clockElement.innerText = now.toLocaleTimeString(); 
}

async function fetchGPSData() {
    try {
        const response = await fetch('gps_data.json');
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched GPS data:', data);
            sendDataToServer('GPS Data', data, 'reverseGeo');
            const latitude = data.latitude;
            const longitude = data.longitude;
            const stop = await getNearestStation(latitude, longitude);
            fetchDepartures(stop);
        } else {
            console.error('Error fetching GPS data:', response.statusText);
            sendDataToServer('Error fetching GPS data', { error: response.statusText }, 'reverseGeo');
        }
    } catch (error) {
        console.error('Error fetching GPS data:', error);
        sendDataToServer('Error fetching GPS data', { error: error.message }, 'reverseGeo');
    }
}

async function getNearestStation(latitude, longitude) {
    const endpoint = 'https://nominatim.openstreetmap.org/reverse';
    const params = new URLSearchParams({
        lat: latitude,
        lon: longitude,
        format: 'json',
        zoom: 10,
        addressdetails: 1
    });

    try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Nearest station data:', data);
            sendDataToServer('Nearest station data', data, 'reverseGeo');
            return data.address.railway || 'Rotkreuz';  
        } else {
            console.error('Error fetching station data:', response.statusText);
            sendDataToServer('Error fetching station data', { error: response.statusText }, 'reverseGeo');
            return 'Rotkreuz';  // Default to 'Rotkreuz' if there's an error
        }
    } catch (error) {
        console.error('Error fetching station data:', error);
        sendDataToServer('Error fetching station data', { error: error.message }, 'reverseGeo');
        return 'Rotkreuz';
    }
}

async function fetchDepartures(stop) {
    const endpoint = 'https://timetable.search.ch/api/stationboard.json';
    const params = new URLSearchParams({
        stop: stop,
        limit: 10
    });

    try {
        const response = await fetch(`${endpoint}?${params.toString()}`);
        if (response.ok) {
            const data = await response.json();
            console.log('Fetched departures:', data);
            sendDataToServer('Fetched Departures', data, 'transport');
            displayDepartures(data);
        } else {
            console.error('Error fetching departures:', response.statusText);
            sendDataToServer('Error fetching departures', { error: response.statusText }, 'transport');
        }
    } catch (error) {
        console.error('Error fetching departures:', error);
        sendDataToServer('Error fetching departures', { error: error.message }, 'transport');
    }
}

function displayDepartures(data) {
    const departuresElement = document.getElementById('departures');
    departuresElement.innerHTML = '<h2>Departures</h2>';
    const departuresList = document.createElement('ul');

    if (!data.connections) {
        sendDataToServer('Display Departures', { error: 'No connections found' }, 'transport');
        console.error('No connections found');
        return;
    }

    data.connections.forEach(departure => {
        console.log('Departure:', departure);
        sendDataToServer('Departure', departure, 'transport');

        const time = departure.time;
        const destination = departure.terminal.name;
        const line = departure.line;
        const type = departure.type;
        
        const listItem = document.createElement('li');
        listItem.textContent = `${time}: ${line} to ${destination}`;
        departuresList.appendChild(listItem);
    });

    departuresElement.appendChild(departuresList);
}


async function fetchWeather() {
    const apiKey = 'b45874d38b4546cbad18937b534ea988'; 

    try {
        const response = await fetch('gps_data.json');
        if (response.ok) {
            const data = await response.json();
            const latitude = data.latitude;
            const longitude = data.longitude;

            const url = `https://api.weatherbit.io/v2.0/current?lat=${latitude}&lon=${longitude}&key=${apiKey}`;
            const weatherResponse = await fetch(url);
            if (weatherResponse.ok) {
                const weatherData = await weatherResponse.json();
                console.log('Fetched weather data:', weatherData);
                sendDataToServer('Weather data', weatherData, 'weather');
                if (weatherData.data && weatherData.data.length > 0) {
                    const currentWeather = weatherData.data[0];
                    const city = currentWeather.city_name;
                    const weatherDescription = currentWeather.weather.description;
                    const temperature = currentWeather.temp;
                    const weatherElement = document.getElementById('weather');
                    weatherElement.innerText = `${city}: ${temperature}°C, ${weatherDescription}`;
                } else {
                    document.getElementById('weather').innerText = "Weather data not available";
                    sendDataToServer('Weather data not available', {}, 'weather');
                }
            } else {
                console.error('Error fetching weather data:', weatherResponse.statusText);
                sendDataToServer('Error fetching weather data', { error: weatherResponse.statusText }, 'weather');
            }
        } else {
            console.error('Error fetching GPS data:', response.statusText);
            sendDataToServer('Error fetching GPS data', { error: response.statusText }, 'weather');
        }
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        sendDataToServer('Failed to fetch weather data', { error: error.message }, 'weather');
        document.getElementById('weather').innerText = 'Error fetching weather data';
    }
}

async function fetchNews() {
    const url = `https://newsdata.io/api/1/news?apikey=pub_4543872bda3db3abf6426c4c5be6e5bb43816&q=Switzerland&country=ch&language=en`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const newsData = await response.json();
            console.log('Fetched news data:', newsData);
            sendDataToServer('Fetched News', newsData, 'news');
            displayNews(newsData);
        } else {
            console.error('Error fetching news data:', response.statusText);
            sendDataToServer('Error fetching news data', { error: response.statusText }, 'news');
        }
    } catch (error) {
        console.error('Failed to fetch news data:', error);
        sendDataToServer('Failed to fetch news data', { error: error.message }, 'news');
    }
}

function displayNews(newsData) {
    const newsElement = document.getElementById('news');
    newsElement.innerHTML = '<p>News</p>';
    
    if (newsData.results && newsData.results.length > 0) {
        const headline = newsData.results[0].title; // Get the first headline
        newsElement.innerText = headline;
    } else {
        newsElement.innerText = "No news available";
    }
}



async function fetchCurrency() {
    const url = `https://v6.exchangerate-api.com/v6/20e81018170daebee544f9de/latest/CHF`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            const currencyData = await response.json();
            console.log('Fetched currency data:', currencyData);
            sendDataToServer('Fetched Currency', currencyData, 'currency');
            displayCurrency(currencyData);
        } else {
            console.error('Error fetching currency data:', response.statusText);
            sendDataToServer('Error fetching currency data', { error: response.statusText }, 'currency');
        }
    } catch (error) {
        console.error('Failed to fetch currency data:', error);
        sendDataToServer('Failed to fetch currency data', { error: error.message }, 'currency');
    }
}

function displayCurrency(currencyData) {
    const currencyElement = document.getElementById('currency');
    currencyElement.innerHTML = '<h3> CHF Value </h3>';
    const chfRate = currencyData.conversion_rates.CHF; // Get CHF rate
    const eurRate = currencyData.conversion_rates.EUR; // Get EUR rate

    if (chfRate && eurRate) {
        const exchangeRate = (chfRate / eurRate).toFixed(2);
        currencyElement.innerText = `CHF/EUR: ${exchangeRate}`;
    } else {
        currencyElement.innerText = "Currency data not available";
    }
}



async function sendDataToServer(event, data, eventType) {
    fetch(`http://localhost:3000/data`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, data, eventType }),
    }).then(response => {
        if (response.ok) {
            console.log('Data sent to server');
        } else {
            console.error('Error sending data to server');
        }
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}


window.onload = () => {
    fetchGPSData();
    //fetchWeather();
    fetchNews();
    fetchCurrency();
};


setInterval(updateClock, 1000); // Update clock every second
setInterval(fetchWeather, 3600000); // Update weather every hour
fetchWeather(); // Initial call to set the weather
