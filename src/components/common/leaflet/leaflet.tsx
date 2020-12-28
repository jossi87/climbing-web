import React from "react";
import "leaflet/dist/leaflet.css";
import { useMapEvents, MapContainer, TileLayer, LayersControl, WMSTileLayer, ScaleControl, FeatureGroup } from 'react-leaflet';
import LocateControl from './locatecontrol';
import FitBounds from './fitbounds';
import FullscreenControl from './fullscreencontrol';
import Markers from './markers';
import Polygons from './polygons';
import Polylines from './polylines';
import MarkerClusterGroup from "./react-leaflet-markercluster";

function MapEvent({ onClick }) {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e);
      }
    },
  })
  return null
}

const Leaflet = ({ autoZoom, history, markers, outlines, polylines, height, defaultCenter, defaultZoom, onClick, clusterMarkers }) => {
  let opacity = 0.5;
  let addEventHandlers = onClick == null;
  let markerGroup = <Markers history={history} opacity={opacity} markers={markers} addEventHandlers={addEventHandlers} />;
  if (clusterMarkers) {
    markerGroup = <MarkerClusterGroup>{markerGroup}</MarkerClusterGroup>
  }
  let showSateliteImage = !clusterMarkers && autoZoom;
  return (
    <MapContainer
      style={{height: (height? height : '500px'), width: '100%', zIndex: 0}}
      center={defaultCenter}
      zoom={defaultZoom}
      zoomControl={true}
    >
      <MapEvent onClick={onClick}/>
      <FitBounds autoZoom={autoZoom} />
      <FullscreenControl />
      <LocateControl />
      <ScaleControl maxWidth={100} metric={true} imperial={false} />
      <LayersControl>
        <LayersControl.BaseLayer checked={showSateliteImage} name="Norge i Bilder">
          <TileLayer
            maxZoom={21}
            attribution='<a href="https://www.norgeibilder.no/" rel="noopener" target="_blank">Geovekst</a>'
            url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={!showSateliteImage} name="OpenStreetMap">
          <TileLayer
            attribution='<a href="https://openstreetmap.org/copyright" rel="noopener" target="_blank">OpenStreetMap contributors</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="Kartverket N50 topo">
          <TileLayer
            attribution='<a href="http://www.kartverket.no/">Kartverket</a>'
            url='https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}'
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked={true} name="Stedsnavn">
          <WMSTileLayer
            params={{
              transparent: true,
              format: "image/png",
              layers: "Stedsnavn",
              version: "1.3.0"
            }}
            url="https://openwms.statkart.no/skwms1/wms.topo4"
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={true} name="Vegnett">
          <WMSTileLayer
            params={{
              transparent: true,
              format: "image/png",
              layers: "all",
              version: "1.3.0"
            }}
            url="https://openwms.statkart.no/skwms1/wms.vegnett"
          />
        </LayersControl.Overlay>
      </LayersControl>
      <FeatureGroup>
        {markerGroup}
        <Polygons history={history} opacity={opacity} outlines={outlines} addEventHandlers={addEventHandlers} />
        <Polylines polylines={polylines} />
      </FeatureGroup>
    </MapContainer>
  );
}

export default Leaflet;