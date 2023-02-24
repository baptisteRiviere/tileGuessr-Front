// DOM elements
window.onload = (event) => {
    let guessButton = document.getElementById("guessButton");
    let respawnButton = document.getElementById("respawnButton");
    let htmlMessages = document.getElementById("messages");

    let distanceMessage = document.createElement('p');
    let successMessage = document.createElement('p');
    let factMessage = document.createElement('p');
    htmlMessages.appendChild(distanceMessage);
    htmlMessages.appendChild(successMessage);
    htmlMessages.appendChild(factMessage);

    // choosing a minimal zoom
    let tileMapMinZoom = 10;

    // init compteurs
    let time = new Date();
    let counter = 0;

    // choosing a random point
    /*
    tileResearched = {
        //lat: 48.856614,
        //lng: 2.3522
        lng: Math.random() * 160 + 10,
        lat: Math.random() * 160 - 80
    }
    */
    let tileResearched = capitals[Math.floor(Math.random() * capitals.length)];

    // Generating satellite map
    let tileMap = L.map('tileMap', {
        maxZoom: 21,
        minZoom: tileMapMinZoom,
    }).setView(tileResearched, tileMapMinZoom);
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(tileMap);

    tileResearched.bounds = tileMap.getBounds();
    tileResearched.polygon = L.polygon([
        [tileResearched.bounds._northEast.lat, tileResearched.bounds._northEast.lng],
        [tileResearched.bounds._southWest.lat, tileResearched.bounds._northEast.lng],
        [tileResearched.bounds._southWest.lat, tileResearched.bounds._southWest.lng],
        [tileResearched.bounds._northEast.lat, tileResearched.bounds._southWest.lng]
    ]);
    console.log(tileResearched)
    tileMap.setMaxBounds(tileResearched.bounds);

    // Creating the researched marker
    let researchedMarker = new L.Marker(tileResearched);
    researchedMarker.addTo(tileMap);

    // Generating guessing map
    let guessingMap = L.map('guessingMap', {
        minZoom: 2,
        maxZoom: 19,
        maxBounds: [[-90, -200], [+90, +200]]
    }).setView([0, 0], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(guessingMap);

    // Initialising the guessing marker
    let guessingMarker = new L.Marker();

    // event listener to add the guessing marker on click 
    guessingMap.on('click', (event) => {
        guessingMarker.setLatLng(event.latlng);
        guessingMarker.addTo(guessingMap);
    });

    // event listener to respawn
    respawnButton.addEventListener('click', () => {
        tileMap.setView(tileResearched, tileMapMinZoom);
    })

    // event listener to guess
    guessButton.addEventListener('click', () => {
        counter += 1;
        guessedLatLng = guessingMarker.getLatLng();
        let dist = getDistance(tileResearched, guessedLatLng);
        distanceMessage.textContent = Math.ceil(dist) / 1000 + " km";
        if (isInsideTile(guessedLatLng, tileResearched)) {
            tileResearched.polygon.addTo(guessingMap);
            successMessage.textContent = "You succeed by trying " + counter + " times !";
            factMessage.textContent = tileResearched.desc;
        }
    })

};

function isInsideTile(guessedLatLng, tileResearched) {
    let max_lat = tileResearched.bounds._northEast.lat;
    let max_lng = tileResearched.bounds._northEast.lng;
    let min_lat = tileResearched.bounds._southWest.lat;
    let min_lng = tileResearched.bounds._southWest.lng;
    return ((min_lat < guessedLatLng.lat) && (guessedLatLng.lat < max_lat) && (min_lng < guessedLatLng.lng) && (guessedLatLng.lng < max_lng))
}

function getDistance(tileResearched, guessedLatLng) {
    var R = 6371000; // Radius of the earth in m
    var dLat = deg2rad(tileResearched.lat - guessedLatLng.lat);  // deg2rad below
    var dLon = deg2rad(tileResearched.lng - guessedLatLng.lng);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(guessedLatLng.lat)) * Math.cos(deg2rad(tileResearched.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}


let capitals = [
    {
        "desc": "Abu Dhabi, United Arab Emirates - Abu Dhabi is home to the largest hand-loomed carpet in the world, measuring 5,625 sq. m.",
        "lat": 24.4539,
        "lng": 54.3773
    },
    {
        "desc": "Addis Ababa, Ethiopia - Addis Ababa is the third-highest capital city in the world, with an elevation of 2,355 meters.",
        "lat": 9.0054,
        "lng": 38.7636
    },
    {
        "desc": "Amman, Jordan - Amman was once known as Philadelphia and is one of the oldest continuously inhabited cities in the world.",
        "lat": 31.9454,
        "lng": 35.9284
    },
    {
        "desc": "Amsterdam, Netherlands - Amsterdam has more than 100 kilometers of canals, 90 islands, and 1,500 bridges.",
        "lat": 52.3667,
        "lng": 4.8945
    },
    {
        "desc": "Ankara, Turkey - Ankara is one of the driest capitals in the world, with an average annual rainfall of only 416 millimeters.",
        "lat": 39.9334,
        "lng": 32.8597
    }
]