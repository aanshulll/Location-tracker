const socket = io();

let myId = null;
let firstUpdate = true;
const marker = {};

// Initialize map at neutral zoom
const map = L.map('map').setView([0, 0], 2);

// Load OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 36,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Get your socket ID
socket.on('connect', () => {
    myId = socket.id;
    console.log('Connected with ID:', myId);
});

// Handle geolocation
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (pos) => {
            const { latitude, longitude } = pos.coords;
            console.log('📍 My current location:', latitude, longitude);

            // Send location to server
            socket.emit('send-location', { latitude, longitude });

            // Update or create your own marker
            if (!marker[myId]) {
                marker[myId] = L.marker([latitude, longitude], { title: "You" })
                    .addTo(map)
                    .bindPopup('You')
                    .openPopup();
            } else {
                marker[myId].setLatLng([latitude, longitude]);
            }

            // Center map on first update
            if (firstUpdate) {
                map.setView([latitude, longitude], 15);
                firstUpdate = false;
            }
        },
        (err) => {
            console.error('❌ Geolocation error:', err);
            alert("Unable to retrieve your location.");
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
} else {
    alert("Geolocation is not supported by your browser.");
}

// Receive location from others
socket.on('received-location', (data) => {
    const { id, latitude, longitude } = data;
    console.log(`📡 Received location from ${id}:`, latitude, longitude);

    if (!marker[id]) {
        marker[id] = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup(id === myId ? 'You' : `User: ${id}`);
    } else {
        marker[id].setLatLng([latitude, longitude]);
    }

    // Optional: re-center map when receiving your own first update
    if (id === myId && firstUpdate) {
        map.setView([latitude, longitude], 15);
        firstUpdate = false;
    }
});
