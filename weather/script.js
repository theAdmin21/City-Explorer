document.addEventListener('DOMContentLoaded', function () {
    var map = L.map('map').setView([20.5937, 78.9629], 5); // India coordinates

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var marker;

    // Function to fetch weather data
    function fetchWeather(city) {
        var apiKey = '7e2dfccc207a4f6ba76164757241107';
        var apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Update weather information
                var weatherData = `
                    <p>Location: ${data.location.name}, ${data.location.country}</p>
                    <p>Temperature: ${data.current.temp_c} °C</p>
                    <p>Condition: ${data.current.condition.text}</p>
                `;
                document.getElementById('weather-data').innerHTML = weatherData;

                // Update map marker
                if (marker) {
                    map.removeLayer(marker);
                }
                marker = L.marker([data.location.lat, data.location.lon]).addTo(map)
                    .bindPopup(`<b>${data.location.name}</b><br>Temperature: ${data.current.temp_c} °C`)
                    .openPopup();
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                document.getElementById('weather-data').innerHTML = '<p>Error fetching weather data. Please try again.</p>';
            });
    }

    // Form submit event listener
    document.getElementById('city-form').addEventListener('submit', function (event) {
        event.preventDefault();
        var city = document.getElementById('city').value.trim();
        if (city) {
            fetchWeather(city);
        }
    });
});
