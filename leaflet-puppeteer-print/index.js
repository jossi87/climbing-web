const puppeteer = require("puppeteer");
const atob = require("atob");
const htmlPath = `file://${__dirname}/index.html`;

start();

async function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function start() {
  const args = process.argv.slice(2);
  const path = args[0];
  const leaflet = JSON.parse(atob(args[1]));
  let chromePath;
  const os = process.platform;
  if (os === 'linux') {
    // sudo apt-get --only-upgrade install google-chrome-stable
    chromePath = "/opt/google/chrome/chrome";
  } else if (os === 'win32') {
    chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  } else {
    console.error('Unsupported operating system:', os);
    process.exit(1);
  }
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: "new",
    executablePath: chromePath,
    timeout: 30000,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720,
    deviceScaleFactor: 1,
  });
  await page.goto(htmlPath);
  await page.goto(htmlPath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(initMap, leaflet);
  await page.screenshot({ path });
  await browser.close();
}

function initMap(leaflet) {
  const outlines = leaflet.outlines.map((o) => {
    const polygon = o.polygonCoords.split(";").map((c) => {
      const latLng = c.split(",");
      return [parseFloat(latLng[0]), parseFloat(latLng[1])];
    });
    return { label: o.name, polygon };
  });
  let opacity = 0.8;
  const map = new L.map("map", { zoomControl: false }).setView(
    leaflet.defaultCenter,
    leaflet.defaultZoom,
  );
  L.control.scale({ metric: true, imperial: false }).addTo(map);
  const group = L.featureGroup();
  let num = 0;
  let parkingIcon = new L.icon({
    iconUrl: "../build/png/parking_lot_maps.png",
    iconAnchor: [15, 15],
  });
  let rockIcon = new L.icon({
    iconUrl: "../build/png/rock.png",
    iconAnchor: [15, 15],
  });
  leaflet.markers.forEach((m) => {
    if (m.iconType == "PARKING") {
      let marker = L.marker([m.lat, m.lng], { icon: parkingIcon });
      marker.addTo(group);
      num++;
    } else {
      let marker;
      if (m.iconType == "ROCK") {
        marker = L.marker([m.lat, m.lng], { icon: rockIcon });
      } else {
        marker = L.marker([m.lat, m.lng]);
      }
      if (m.label) {
        marker
          .bindTooltip(m.label, {
            permanent: true,
            opacity,
            className: "buldreinfo-tooltip-compact",
          })
          .openTooltip();
      }
      marker.addTo(group);
      num++;
    }
  });
  outlines.forEach((o) => {
    let polygon = L.polygon(o.polygon);
    if (o.label) {
      polygon
        .bindTooltip(o.label, {
          permanent: true,
          opacity,
          className: "buldreinfo-tooltip-compact",
        })
        .openTooltip();
    }
    polygon.addTo(group);
    num++;
  });
  leaflet.slopes.map(s => {
    let polyline = L.polyline(s.polyline.split(";").map((e) => e.split(",").map(Number)), { color: s.color });
    polyline
      .bindTooltip(s.label, {
        permanent: true,
        opacity,
        className: "buldreinfo-tooltip-compact",
      })
      .openTooltip();
    polyline.addTo(group);
    num++;
  });
  group.addTo(map);
  if (num > 1) {
    let bounds = group.getBounds();
    map.fitBounds(bounds.pad(0.032), { maxZoom: 18 });
  }
  if (leaflet.legends && leaflet.legends.length > 0) {
    let legend = leaflet.legends.join("<br/>");
    L.control.attribution({ prefix: legend, position: "topleft" }).addTo(map);
  }
  const tileUrl = leaflet.showPhotoNotMap
    ? "https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5"
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileLayer = L.tileLayer(tileUrl).addTo(map);
  window.map = map;
  return new Promise((resolve) => {
    tileLayer.on("load", () => {
        // Give it an extra 500ms just to be safe for rendering
        setTimeout(resolve, 500);
    });
  });
}
