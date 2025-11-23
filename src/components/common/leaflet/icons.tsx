import L from 'leaflet';

const markerBlueIcon = new L.Icon({
  iconUrl: '/png/marker_icon_blue.png',
  iconAnchor: [8, 30],
});

const markerRedIcon = new L.Icon({
  iconUrl: '/png/marker_icon_red.png',
  iconAnchor: [8, 30],
});

const parkingIcon = new L.Icon({
  iconUrl: '/png/parking_lot_maps.png',
  iconAnchor: [15, 15],
});

const weatherIcon = new L.Icon({
  iconUrl: '/png/weather.png',
  iconAnchor: [15, 15],
});

const rockIcon = new L.Icon({
  iconUrl: '/png/rock.png',
  iconAnchor: [15, 15],
});

export { markerBlueIcon, markerRedIcon, parkingIcon, weatherIcon, rockIcon };
