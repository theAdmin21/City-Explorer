
const map = L.map('map').setView([20.5937, 78.9629], 5);

const baseLayers = {
    "Default": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
    }),
    "Terrain": L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
        attribution: 'Map tiles by Stamen Design, CC BY 3.0'
    })
};

baseLayers["Default"].addTo(map); // Default layer

L.control.layers(baseLayers).addTo(map);

const control = L.Routing.control({
    waypoints: [],
    routeWhileDragging: true,
    router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
    }),
    geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);

function calculateRoute() {
    const startLocation = document.getElementById('start').value;
    const endLocation = document.getElementById('end').value;
    if (startLocation && endLocation) {
        L.Control.Geocoder.nominatim().geocode(startLocation, (results) => {
            const startLatLng = results[0].center;
            L.Control.Geocoder.nominatim().geocode(endLocation, (results) => {
                const endLatLng = results[0].center;
                control.setWaypoints([startLatLng, endLatLng]);

                setTimeout(() => {
                    const bounds = L.latLngBounds([startLatLng, endLatLng]);
                    map.fitBounds(bounds);
                }, 1000);
            });
        });
    } else {
        alert('Please enter both start and end locations.');
    }
}

function downloadRoute() {
    setTimeout(() => {
        html2canvas(document.getElementById('map')).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'route.png';
            link.click();
        });
    }, 1000);
}

function showShareOptions() {
    document.getElementById('share-options').style.display = 'flex';
}

function shareViaEmail() {
    html2canvas(document.getElementById('map')).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const startLocation = document.getElementById('start').value;
        const endLocation = document.getElementById('end').value;
        const subject = encodeURIComponent('Check out my route!');
        const body = encodeURIComponent(`Start Location: ${startLocation}\nEnd Location: ${endLocation}\nRoute: See attached image.`);
        window.location.href = `mailto:?subject=${subject}&body=${body}&attachment=${image}`;
    });
}

function shareViaWhatsApp() {
    html2canvas(document.getElementById('map')).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const startLocation = document.getElementById('start').value;
        const endLocation = document.getElementById('end').value;
        const text = encodeURIComponent(`Start Location: ${startLocation}\nEnd Location: ${endLocation}\nRoute: See attached image.`);
        const link = `https://api.whatsapp.com/send?text=${text}&attachment=${image}`;
        window.open(link, '_blank');
    });
}
