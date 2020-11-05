import L from 'leaflet';

const markerIcon = new L.Icon({
    iconUrl: "/png/marker_icon.png",
    iconAnchor: [8, 30]
});

const parkingIcon = new L.Icon({
    iconUrl: "/png/parking_lot_maps.png",
    iconAnchor: [15, 15]
});

const weatherIcon = new L.Icon({
    iconUrl: "/png/weather.png",
    iconAnchor: [15, 15]
});

export { markerIcon, parkingIcon, weatherIcon };