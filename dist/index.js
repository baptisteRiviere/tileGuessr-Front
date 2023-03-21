///////////////////////////////////////////////////////////////////////
/////// DOM
///////////////////////////////////////////////////////////////////////

let guessButton = document.getElementById("guessButton");
let htmlScore = document.getElementById("score");
let htmlDesc = document.getElementById("description");

///////////////////////////////////////////////////////////////////////
/////// GUESSING MAP - ITOWNS GLOBE VIEW
///////////////////////////////////////////////////////////////////////

// Generating guessing map
let guessingMap = L.map('guessingMap', {
    minZoom: 2,
    maxZoom: 19,
    keyboard: false,
    zoomControl: false,
    maxBounds: [[-90, -200], [+90, +200]]
}).setView([0, 0], 2);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(guessingMap);

///////////////////////////////////////////////////////////////////////
/////// TILE MAP - LEAFLET
///////////////////////////////////////////////////////////////////////

let tileMap;
let tileMapMinZoom = 10;

function buildTileMap(lat, lng, L) {
    let tileResearched = { lat: lat, lng: lng };

    try {
        tileMap.remove();
    } catch (e) {
        // pass
    }

    // Generating satellite map
    tileMap = L.map('tileMap', {
        maxZoom: 21,
        minZoom: tileMapMinZoom,
        keyboard: false,
        zoomControl: false
    }).setView(tileResearched, tileMapMinZoom);

    googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(tileMap);

    tileResearched.bounds = tileMap.getBounds();
    tileMap.setMaxBounds(tileResearched.bounds);

    return tileResearched;
}

// respawn
let respawnButton = document.getElementById('respawnButton');
respawnButton.addEventListener('click', () => {
    tileMap.flyTo(tileResearched, tileMapMinZoom, {
        animate: true,
        duration: 1
    });
})

///////////////////////////////////////////////////////////////////////
/////// getting capitals
///////////////////////////////////////////////////////////////////////

let capitals;
let validCountries = ["AFG", "AGO", "ALB", "ARE", "ARG", "ARM", "ATA", "ATF", "AUS", "AUT", "AZE", "BDI", "BEL", "BEN", "BFA", "BGD", "BGR", "BHS", "BIH", "BLR", "BLZ", "BMU", "BOL", "BRA", "BRN", "BTN", "BWA", "CAF", "CAN", "CHE", "CHL", "CHN", "CIV", "CMR", "COD", "COG", "COL", "CRI", "CS-KM", "CUB", "CYP", "CZE", "DEU", "DJI", "DNK", "DOM", "DZA", "ECU", "EGY", "ERI", "ESH", "ESP", "EST", "ETH", "FIN", "FJI", "FLK", "FRA", "GAB", "GBR", "GEO", "GHA", "GIN", "GMB", "GNB", "GNQ", "GRC", "GRL", "GTM", "GUF", "GUY", "HND", "HRV", "HTI", "HUN", "IDN", "IND", "IRL", "IRN", "IRQ", "ISL", "ISR", "ITA", "JAM", "JOR", "JPN", "KAZ", "KEN", "KGZ", "KHM", "KOR", "KWT", "LAO", "LBN", "LBR", "LBY", "LKA", "LSO", "LTU", "LUX", "LVA", "MAR", "MDA", "MDG", "MEX", "MKD", "MLI", "MLT", "MMR", "MNE", "MNG", "MOZ", "MRT", "MWI", "MYS", "NAM", "NCL", "NER", "NGA", "NIC", "NLD", "NOR", "NPL", "NZL", "OMN", "PAK", "PAN", "PER", "PHL", "PNG", "POL", "PRI", "PRK", "PRT", "PRY", "PSE", "QAT", "ROU", "RUS", "RWA", "SAU", "SDN", "SEN", "SLB", "SLE", "SLV", "SOM", "SRB", "SSD", "SUR", "SVK", "SVN", "SWE", "SWZ", "SYR", "TCD", "TGO", "THA", "TJK", "TKM", "TLS", "TTO", "TUN", "TUR", "TWN", "TZA", "UGA", "UKR", "URY", "USA", "UZB", "VEN", "VNM", "VUT", "YEM", "ZAF", "ZMB", "ZWE"];

let capitalsPromise = fetch("https://raw.githubusercontent.com/Stefie/geojson-world/master/capitals.geojson")
    .then((res) => { return res.json() })
    .then((res) => {
        // getting every capitals from the json
        let allCapitals = res.features;
        // shuffling capitals to have a random list
        let shuffledCapitals = allCapitals.sort((a, b) => 0.5 - Math.random());
        // selecting capitals which are valid (present in the countries json file)
        capitals = [];
        shuffledCapitals.forEach(proposedCapital => {
            if (validCountries.includes(proposedCapital.properties.iso3)) {
                capitals.push(proposedCapital)
            };
        });
    })

///////////////////////////////////////////////////////////////////////
/////// GAME
///////////////////////////////////////////////////////////////////////

// game init
let round = 0;
let coords;
let counter;
let tileResearched;
let totaldistance = 0;
let finished = false;
let guessingMarker = new L.Marker();

// !!!! game start !!!!!
capitalsPromise.then(next);

// function that able to pass to the next round
function next() {
    if (round < 5) {

        // get round info
        round++;
        coords = capitals[round - 1].geometry.coordinates;
        researched_country = capitals[round - 1].properties.iso3;
        console.log(researched_country);

        // round reinit
        guessingMarker = new L.Marker();
        counter = 0;

        // rebuild maps
        // todo flyto
        tileResearched = buildTileMap(coords[1], coords[0], L);

    } else {
        finished = true;
        guessButton.textContent = "finish";
        respawnButton.hidden = true;
    }

}


///////////////////////////////////////////////////////////////////////
/////// LISTENERS
///////////////////////////////////////////////////////////////////////

// event listener to add the guessing marker on click 
guessingMap.on('click', (event) => {
    guessingMarker.setLatLng(event.latlng);
    guessingMarker.addTo(guessingMap);
});

// event listeners to guess
guessButton.addEventListener('click', guess);
document.addEventListener('keyup', event => {
    event.preventDefault();
    if (event.code === 'Space') {
        guess();
    }
})


// guessing
function guess() {
    if (finished) {
        htmlScore.textContent = "you have traveled " + Math.round(totaldistance) + " km"
        htmlDesc.textContent = "the equivalent of " + Math.round(totaldistance / 6400000) + " times around the world";
    } else {

        // incrementing counter 
        counter += 1;

        // computing distance to help the player
        //let distance = ellips.geodesicDistance(coordProposed, tileResearched.itownsCoordinates);
        guessedLatLng = guessingMarker.getLatLng();
        let distance = getDistance(tileResearched, guessedLatLng);
        htmlScore.textContent = "You are " + Math.ceil(distance) / 1000 + " km from the location !";
        totaldistance += distance;

        // the country is found
        if (isInsideTile(guessedLatLng, tileResearched)) {
            htmlScore.textContent = "You succeed by trying " + counter + " time(s) !";
            htmlDesc.textContent = "It was " + capitals[round - 1].properties.city + " (" + capitals[round - 1].properties.country + ")";
            next();
        }
    }
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