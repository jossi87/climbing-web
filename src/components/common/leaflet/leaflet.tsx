import React, { useRef } from "react";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import { Map, Circle, TileLayer, LayersControl, Marker, Polygon, Polyline, Tooltip, WMSTileLayer, FeatureGroup, ScaleControl, Popup } from 'react-leaflet';
import MarkerClusterGroup from "react-leaflet-markercluster";
import FullscreenControl from 'react-leaflet-fullscreen';
let markerIcon;
let parkingIcon;
let weatherIcon;

const Leaflet = ({ autoZoom, history, markers, outlines, polylines, height, defaultCenter, defaultZoom, onClick, clusterMarkers }) => {
  let opacity = 0.5;
  const featureGroupRef = useRef();
  const mapRef = useRef();

  let renderMarkers = markers && markers.map((m, i) => {
    if (m.isParking) {
      if (parkingIcon == null) {
        const L = require('leaflet')
        parkingIcon = new L.icon({ iconUrl: '/png/parking_lot_maps.png', iconAnchor: [15, 15] })
      }
      return (
        <Marker position={[m.lat, m.lng]} key={i} onClick={() => onClick? null : history.push(m.url)} icon={parkingIcon}>
          {m.label && (
            <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
              {m.label}
            </Tooltip>
          )}
        </Marker>
      )
    } else if (m.isCamera) {
      if (weatherIcon == null) {
        const L = require('leaflet')
        weatherIcon = new L.icon({ iconUrl: '/png/weather.png', iconAnchor: [15, 15] })
      }
      return (
        <Marker position={[m.lat, m.lng]} key={i} icon={weatherIcon}>
          <Popup>
            <b>{m.name}</b> (<i>{m.lastUpdated}</i>)
            <a rel='noopener' target='_blank' href={m.urlStillImage}><img style={{maxWidth: '225px'}} src={m.urlStillImage}/></a><br/>
            <i>Click on image to open in new tab</i><br/><br/>
            <a rel='noopener' target='_blank' href={m.urlYr}>yr.no weather forecast</a>
          </Popup>
        </Marker>
      );
    } else {
      if (markerIcon == null) {
        const L = require('leaflet')
        markerIcon = new L.icon({ iconUrl: '/png/marker_icon.png', iconAnchor: [15, 41] })
      }
      return (
        <Marker
          icon={markerIcon}
          position={[m.lat, m.lng]}
          key={i}
          onClick={() => history.push(m.url)}
          draggable={false} >
          {m.label && (
            <Tooltip opacity={opacity} permanent>
              {m.label}
            </Tooltip>
          )}
        </Marker>
      )
    }
  })
  if (renderMarkers && clusterMarkers) {
    renderMarkers = <MarkerClusterGroup>{renderMarkers}</MarkerClusterGroup>
  }

  const polygons = outlines && outlines.map((o, i) => (
    <Polygon key={i} positions={o.polygon} onClick={() => {
      if (!onClick) {
        if (o.url.startsWith("https")) {
          var win = window.open(o.url, '_blank');
          win.focus();
        } else {
          history.push(o.url)
        }
      }
    }}>
      {o.label && (
        <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
          {o.label}
        </Tooltip>
      )}
    </Polygon>
  ))
  var renderPolylines;
  if (polylines) {
    renderPolylines = polylines.map((p, i) => {
      if (p.length == 1) {
        return <Circle key={i} center={p[0]} radius={0.5} />
      }
      else {
        return (
          <Polyline key={i} color="lime" positions={p} />
        );
      }
    })
  }

  return (
    <Map
      ref={mapRef}
      className="markercluster-map"
      style={{height: (height? height : '500px'), width: '100%', zIndex: 0}}
      center={defaultCenter}
      zoom={defaultZoom}
      onClick={onClick}
      zoomControl={true}
      whenReady={() => {
        if (autoZoom && mapRef.current && featureGroupRef.current) { //we will get inside just once when loading
          const map = (mapRef as any).current.leafletElement;
          const layer = (featureGroupRef as any).current.leafletElement;
          let bounds = layer.getBounds();
          if (bounds._northEast && bounds._southWest) {
            map.fitBounds(bounds.pad(0.032), {maxZoom: 21}); // Test padding on Sirevåg - Holmavatn
          }
        }
    }}
    >
      <ScaleControl maxWidth={100} metric={true} imperial={false} />
      <FullscreenControl position="topright" />
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked={!clusterMarkers || autoZoom} name="Norge i Bilder">
          <TileLayer
            maxNativeZoom={21}
            maxZoom={21}
            attribution='<a href="https://www.norgeibilder.no/" rel="noopener" target="_blank">Geovekst</a>'
            url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={clusterMarkers || !autoZoom} name="OpenStreetMap">
          <TileLayer
            maxZoom={19}
            maxNativeZoom={19}
            attribution='<a href="https://openstreetmap.org/copyright" rel="noopener" target="_blank">OpenStreetMap contributors</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Kartverket N50 topo">
          <TileLayer
            maxNativeZoom={15}
            maxZoom={15}
            attribution='<a href="http://www.kartverket.no/">Kartverket</a>'
            url='https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}'
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked={true} name="Stedsnavn">
          <WMSTileLayer
            maxNativeZoom={15}
            maxZoom={15}
            transparent={true}
            format={"image/png"}
            layers={"Stedsnavn"}
            version={"1.3.0"}
            uppercase={true}
            url="https://openwms.statkart.no/skwms1/wms.topo4"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={true} name="Vegnett">
          <WMSTileLayer
            maxNativeZoom={15}
            maxZoom={15}
            transparent={true}
            format={"image/png"}
            layers={"all"}
            version={"1.3.0"}
            uppercase={true}
            url="https://openwms.statkart.no/skwms1/wms.vegnett"
          />
        </LayersControl.Overlay>

      </LayersControl>
      <FeatureGroup ref={featureGroupRef}>
        {renderMarkers}
        {polygons}
        {renderPolylines}
      </FeatureGroup>
    </Map>
  );
}

export function calculateDistance(polyline) {
  var km = 0;
  for (var i = 1; i < polyline.length; i++) {
    const lat1 = polyline[i-1][0];
    const lng1 = polyline[i-1][1];
    const lat2 = polyline[i][0];
    const lng2 = polyline[i][1];
    km += calculateDistanceBetweenCoordinates(lat1, lng1, lat2, lng2);
  }
  if (km > 1) {
    return Math.round(km*100)/100 + " km";
  }
  return Math.round(km*1000) + " meter";
}

function calculateDistanceBetweenCoordinates(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1);  // deg2rad below
  const dLon = deg2rad(lng2-lng1); 
  const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default Leaflet;