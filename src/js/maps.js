// DOM elements
window.onload = (event) => {
    let guessButton = document.getElementById("guessButton");
    let respawnButton = document.getElementById("respawnButton");

    // choosing a minimal zoom
    let tileMapMinZoom = 10;

    // choosing a random point
    researchedLatLng = {
        lng: Math.random() * 160 + 10,
        lat: Math.random() * 160 - 80
    }

    // Generating satellite map
    let tileMap = L.map('tileMap', {
        maxZoom: 21,
        minZoom: tileMapMinZoom,
    }).setView(researchedLatLng, tileMapMinZoom);
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(tileMap);
    tileMap.setMaxBounds(tileMap.getBounds());

    // Creating the researched marker
    let researchedMarker = new L.Marker(researchedLatLng);
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
        tileMap.setView(researchedLatLng, tileMapMinZoom);
    })

    // event listener to guess
    guessButton.addEventListener('click', () => {
        guessedLatLng = guessingMarker.getLatLng();
        let dist = getDistance(researchedLatLng, guessedLatLng);
        console.log(dist / 1000);
    })

};

function getDistance(researchedLatLng, guessedLatLng) {
    var R = 6371000; // Radius of the earth in m
    var dLat = deg2rad(researchedLatLng.lat - guessedLatLng.lat);  // deg2rad below
    var dLon = deg2rad(researchedLatLng.lng - guessedLatLng.lng);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(guessedLatLng.lat)) * Math.cos(deg2rad(researchedLatLng.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}