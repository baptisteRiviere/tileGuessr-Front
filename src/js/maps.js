// DOM elements
window.onload = (event) => {
    let guessButton = document.getElementById("guessButton");

    // choosing a minimal zoom
    let tileMapMinZoom = 10;

    // choosing a random point
    let lon = Math.random() * 160 + 10;
    let lat = Math.random() * 160 - 80;

    // test over Paris
    lat = 48.856614
    lon = 2.3522219

    // Generating satellite map
    let tileMap = L.map('tileMap').setView([lat, lon], tileMapMinZoom);
    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 21,
        //minZoom: tileMapMinZoom,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(tileMap);

    // Creating the researched marker
    let researchedMarker = new L.Marker([lat, lon]);
    researchedMarker.addTo(tileMap);

    // Generating guessing map
    let guessingMap = L.map('guessingMap').setView([0, 0], 2);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(guessingMap);

    // Initialising the guessing marker
    let guessingMarker = new L.Marker([0, 0]);

    // event listener to add the guessing marker on click 
    guessingMap.on('click', (event) => {
        guessingMarker.setLatLng(event.latlng);
        guessingMarker.addTo(guessingMap);
    });

    // event listeners to guess
    guessButton.addEventListener('click', guess)

    // guess
    function guess() {
        guessedLatLng = guessingMarker.getLatLng();
    }


};