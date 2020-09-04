const path = require('path');
const puppeteer = require('puppeteer');
const atob = require('atob');
const htmlPath = `file://${__dirname}/index.html`;

start();

async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function start() {
  const args = process.argv.slice(2);
  const path = args[0];
  const leaflet = JSON.parse(atob(args[1]))
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1
  });
  await page.goto(htmlPath);
  await page.evaluate(initMap, leaflet);
  await timeout(500);
  await page.screenshot({ path });
  await browser.close();
}

function initMap(leaflet) {
  const outlines = leaflet.outlines.map(o => {
    const polygon = o.polygonCoords.split(";").map(c => {
      const latLng = c.split(",");
      return ([parseFloat(latLng[0]), parseFloat(latLng[1])]);
    });
    return {label: o.name, polygon}
  });
  const polylines = leaflet.polylines.map(p => p.split(";").map(e => e.split(",").map(Number)));
  return new Promise((yep, nope) => {
    let opacity = 0.8;
    const map = L.map('map', {zoomControl: false}).setView(leaflet.defaultCenter, leaflet.defaultZoom);
    L.control.scale({metric: true, imperial: false}).addTo(map);
    const group = L.featureGroup();
    let num = 0;
    leaflet.markers.forEach((m) => {
      if (m.isParking) {
        let parkingIcon = new L.icon({ iconUrl: '../build/png/parking_lot_maps.png', iconAnchor: [15, 15] });
        let marker = L.marker([m.lat, m.lng], {icon: parkingIcon});
        marker.addTo(group);
        num++;
      }
      else {
        let marker = L.marker([m.lat, m.lng]);
        if (m.label) {
          marker.bindTooltip(m.label, {permanent: true, opacity, className: 'buldreinfo-tooltip-compact'}).openTooltip();
        }
        marker.addTo(group);
        num++;
      }
    })
    outlines.forEach((o) => {
      let polygon = L.polygon(o.polygon);
      if (o.label) {
        polygon.bindTooltip(o.label, {permanent: true, opacity, className: 'buldreinfo-tooltip-compact'}).openTooltip();
      }
      polygon.addTo(group);
      num++;
    })
    polylines.forEach((p) => {
      let polyline = L.polyline(p, {color: 'lime'});
      polyline.addTo(group);
      num++;
    })
    group.addTo(map);
    if (num > 1) {
      let bounds = group.getBounds();
      map.fitBounds(bounds.pad(0.032));
    }
    if (leaflet.legends && leaflet.legends.length>0) {
      let legend = leaflet.legends.join('<br/>');
      L.control.attribution({prefix: legend, position: 'topleft'}).addTo(map);
    }
    const tileUrl = leaflet.showPhotoNotMap? 'https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5' : 'https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}';
    const tileLayer = L.tileLayer(tileUrl).addTo(map);
    window.map = map;
    tileLayer.on('load', yep);
  })
}