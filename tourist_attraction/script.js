let map;
let markers = [];
let locations = [];

const categoryIcons = {
  'Temple': 'https://img.icons8.com/fluency/48/000000/temple.png',
  'War Memorial': 'https://img.icons8.com/fluency/48/000000/military.png',
  'Theme Park': 'https://img.icons8.com/fluency/48/000000/theme-park.png',
  'Observatory': 'https://img.icons8.com/fluency/48/000000/observatory.png',
  'Fort': 'https://img.icons8.com/fluency/48/000000/fort.png',
  'Stepwell': 'https://img.icons8.com/fluency/48/000000/well.png',
  'Park': 'https://img.icons8.com/fluency/48/000000/park.png',
  'Museum': 'https://img.icons8.com/fluency/48/000000/museum.png',
  'Zoo': 'https://img.icons8.com/fluency/48/000000/zoo.png',
  'Monument': 'https://img.icons8.com/fluency/48/000000/monument.png',
  'National Park': 'https://img.icons8.com/fluency/48/000000/national-park.png',
  'Beach': 'https://img.icons8.com/fluency/48/000000/beach.png',
  'Amusement Park': 'https://img.icons8.com/fluency/48/000000/amusement-park.png',
  'Palace': 'https://img.icons8.com/fluency/48/000000/palace.png',
  'Lake': 'https://img.icons8.com/fluency/48/000000/lake.png',
  'Bridge': 'https://img.icons8.com/fluency/48/000000/bridge.png',
  'Church': 'https://img.icons8.com/fluency/48/000000/church.png',
  'Waterfall': 'https://img.icons8.com/fluency/48/000000/waterfall.png',
  'Bird Sanctuary': 'https://img.icons8.com/fluency/48/000000/bird.png',
  'Cave': 'https://img.icons8.com/fluency/48/000000/cave.png',
  'Valley': 'https://img.icons8.com/fluency/48/000000/valley.png',
  'Gurudwara': 'https://img.icons8.com/fluency/48/000000/gurudwara.png',
  'Wildlife Sanctuary': 'https://img.icons8.com/fluency/48/000000/wildlife.png',
  'Hill': 'https://img.icons8.com/fluency/48/000000/hill.png',
  'Aquarium': 'https://img.icons8.com/fluency/48/000000/aquarium.png'
 
};

async function initMap() {
  const scriptUrl = 'https://script.google.com/macros/s/AKfycbwvhF9sFMJKj8SB3eC0ewPdt5Tn4w5yrUg2i1l0y6oGCuXUT-zPBl4TuO4RVETUvDEM/exec';

  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const jsonData = await response.json();

    locations = jsonData.data.map(row => ({
      name: row.Name,
      lat: parseFloat(row.Latitude),
      lng: parseFloat(row.Longitude),
      state: row.State,
      city: row.City,
      category: row.Category
    }));

    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 5,
      center: { lat: 20.5937, lng: 78.9629 }
    });

    populateDropdowns();
  } catch (error) {
    console.error('Error fetching or parsing data:', error);
  }
}

function updateMarkers() {
  const selectedState = document.getElementById('stateDropdown').value;
  const selectedCity = document.getElementById('cityDropdown').value;
  const selectedCategory = document.getElementById('categoryDropdown').value;

  markers.forEach(marker => marker.setMap(null));
  markers = [];

  const infoCards = document.querySelectorAll('.info-card');
  infoCards.forEach(card => card.remove());

  if (!selectedState) {
    return;
  }

  const filteredLocations = locations.filter(location => {
    return (!selectedState || location.state === selectedState) &&
           (!selectedCity || location.city === selectedCity) &&
           (!selectedCategory || location.category === selectedCategory);
  });

  filteredLocations.forEach(location => {
    const position = new google.maps.LatLng(location.lat, location.lng);
    const marker = new google.maps.Marker({
      position,
      map,
      title: location.name
    });

    const infoCard = document.createElement('div');
    infoCard.className = 'info-card';
    const iconUrl = categoryIcons[location.category] || 'https://img.icons8.com/fluency/48/000000/map-pin.png';
    infoCard.innerHTML = `<img src="${iconUrl}" alt="${location.category}"><strong>${location.name}</strong><br>${location.category}`;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(infoCard);

    const overlayProjection = new google.maps.OverlayView();
    overlayProjection.onAdd = function() {
      const panes = this.getPanes();
      panes.floatPane.appendChild(infoCard);
    };
    overlayProjection.draw = function() {
      const projection = this.getProjection();
      const position = projection.fromLatLngToDivPixel(marker.getPosition());
      infoCard.style.left = position.x + 'px';
      infoCard.style.top = position.y + 'px';
    };
    overlayProjection.onRemove = function() {
      infoCard.parentNode.removeChild(infoCard);
    };
    overlayProjection.setMap(map);

    markers.push(marker);
  });
}

function populateDropdowns() {
  const stateDropdown = document.getElementById('stateDropdown');
  const cityDropdown = document.getElementById('cityDropdown');
  const categoryDropdown = document.getElementById('categoryDropdown');

  const states = [...new Set(locations.map(location => location.state))].sort();
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.text = state;
    stateDropdown.add(option);
  });

  stateDropdown.addEventListener('change', function() {
    const selectedState = this.value;
    updateDropdowns(selectedState);
    updateMarkers();

    const cityWrapper = document.getElementById('cityWrapper');
    const categoryWrapper = document.getElementById('categoryWrapper');

    if (selectedState) {
      cityWrapper.classList.remove('hidden');
      categoryWrapper.classList.remove('hidden');
    } else {
      cityWrapper.classList.add('hidden');
      categoryWrapper.classList.add('hidden');
    }
  });

  cityDropdown.addEventListener('change', function() {
    updateMarkers();
    updateCategoryDropdown(this.value);
  });

  categoryDropdown.addEventListener('change', updateMarkers);
}

function updateDropdowns(selectedState) {
  const cityDropdown = document.getElementById('cityDropdown');
  const categoryDropdown = document.getElementById('categoryDropdown');

  cityDropdown.innerHTML = '<option value="">All Cities</option>';
  categoryDropdown.innerHTML = '<option value="">All Categories</option>';

  const filteredLocations = locations.filter(location => !selectedState || location.state === selectedState);

  const cities = [...new Set(filteredLocations.map(location => location.city))].sort();
  const categories = [...new Set(filteredLocations.map(location => location.category))].sort();

  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.text = city;
    cityDropdown.add(option);
  });

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.text = category;
    categoryDropdown.add(option);
  });
}

function updateCategoryDropdown(selectedCity) {
  const categoryDropdown = document.getElementById('categoryDropdown');
  categoryDropdown.innerHTML = '<option value="">All Categories</option>';

  const filteredLocations = locations.filter(location => !selectedCity || location.city === selectedCity);

  const categories = [...new Set(filteredLocations.map(location => location.category))].sort();

  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.text = category;
    categoryDropdown.add(option);
  });
}
