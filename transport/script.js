
var map = L.map('map').setView([20.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

function getCoordinates(city, callback) {
    var url = `https://nominatim.openstreetmap.org/search?format=json&q=${city}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                callback(null, `${lon},${lat}`);
            } else {
                callback('City not found', null);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            callback(error, null);
        });
}

function getRoute(start, end, mode) {
    var profile = mode === 'walking' ? 'foot' : mode;
    var url = `https://router.project-osrm.org/route/v1/${profile}/${start};${end}?overview=full&geometries=geojson`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes.length > 0) {
                var route = data.routes[0].geometry;
                var duration = data.routes[0].duration;
                var travelTime = convertTime(duration, profile);
                alert(`Estimated travel time: ${travelTime}`);
                var geojson = L.geoJSON(route).addTo(map);
                map.fitBounds(geojson.getBounds());
            } else {
                alert('No route found');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function convertTime(time, profile) {
    if (profile === 'foot') {
        var minutes = Math.ceil(time / 60);
        return `${minutes} minutes`;
    } else {
        var minutes = Math.floor(time / 60);
        var hours = Math.floor(minutes / 60);
        minutes = minutes % 60;
        return `${hours} hours and ${minutes} minutes`;
    }
}

document.getElementById('routeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    var startCity = document.getElementById('start').value;
    var endCity = document.getElementById('end').value;
    var mode = document.getElementById('mode').value;

    if (startCity && endCity) {
        getCoordinates(startCity, (error, startCoordinates) => {
            if (error) {
                alert(`Error with start city: ${error}`);
                return;
            }
            getCoordinates(endCity, (error, endCoordinates) => {
                if (error) {
                    alert(`Error with end city: ${error}`);
                    return;
                }
                getRoute(startCoordinates, endCoordinates, mode);
            });
        });
    } else {
        alert('Please enter start and end cities');
    }
});

