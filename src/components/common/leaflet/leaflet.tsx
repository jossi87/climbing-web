import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import { useMapEvents, MapContainer, TileLayer, LayersControl, WMSTileLayer, ScaleControl, FeatureGroup } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import LocateControl from './locatecontrol';
import FullscreenControl from './fullscreencontrol';
import Markers from './markers';
import Polygons from './polygons';
import Polylines from './polylines';
import MarkerClusterGroup from "./react-leaflet-markercluster";
import { Segment, Checkbox } from 'semantic-ui-react';
import UseControl from '../../../utils/use-leaflet-control';
import GetCenterFromDegrees from '../../../utils/map-utils';

function MapEvent({ onMouseClick, onMouseMove }) {
  useMapEvents({
    click: (e) => {
      if (onMouseClick) {
        onMouseClick(e);
      }
    },
    mousemove: (e) => {
      if (onMouseMove) {
        onMouseMove(e);
      }
    },
  })
  return null
}

const Leaflet = ({ autoZoom, navigate, markers, outlines, polylines, height, defaultCenter, defaultZoom, onMouseClick, onMouseMove, clusterMarkers, showSateliteImage, rocks, flyToId }) => {
  const [groupByRock, setGroupByRock] = useState((rocks != null && rocks.length>0)? true : false);
  let bounds = null;
  if (autoZoom && ((markers && markers.length > 0) || (outlines && outlines.length > 0) || (polylines && polylines.length > 0))) {
    bounds = latLngBounds([]);
    if (markers && markers.length > 0) {
      markers.forEach((m) => bounds.extend([m.lat, m.lng]));
    }
    if (outlines && outlines.length > 0) {
      outlines.forEach((o) => o.polygon.forEach((p) => bounds.extend([p[0], p[1]])));
    }
    if (polylines && polylines.length > 0) {
      polylines.forEach((p) => p.polyline.forEach((x) => bounds.extend([x[0], x[1]])));
    }
    if (bounds._northEast.lat===bounds._southWest.lat || bounds._northEast.lng===bounds._southWest.lng) {
      bounds = null;
    }
  }
  let opacity = 0.6;
  let addEventHandlers = onMouseClick == null && onMouseMove == null;
  let markerGroup;
  if (groupByRock) {
    let rockMarkers = rocks.map(r => {
      let markersOnRock = markers.filter(m => m.rock===r);
      let coords = markersOnRock.filter(m => m.lat && m.lng).map(m => [m.lat,m.lng]);
      if (coords && coords.length>0) {
        let centerCoordinates = GetCenterFromDegrees(coords);
        let html = <>
          <b>{r}:</b><br/>
          {markersOnRock.map((m, i) => <React.Fragment key={i}><a rel='noreferrer noopener' target='_blank' href={m.url}>{m.label}</a><br/></React.Fragment>)}
        </>;
        return ({lat: centerCoordinates[0], lng: centerCoordinates[1], label: r, rock: true, html});
      }
    }).filter(item => item); // Remove undefined
    let markersWithoutRock = markers.filter(m => !m.rock);
    markerGroup = <Markers navigate={navigate} opacity={opacity} markers={[...rockMarkers, ...markersWithoutRock]} addEventHandlers={addEventHandlers} flyToId={flyToId} />;
  } else {
    markerGroup = <Markers navigate={navigate} opacity={opacity} markers={markers} addEventHandlers={addEventHandlers} flyToId={flyToId} />;
    if (clusterMarkers) {
      markerGroup = <MarkerClusterGroup>{markerGroup}</MarkerClusterGroup>
    }
  }
  return (
    <MapContainer
      style={{height: (height? height : '500px'), width: '100%', zIndex: 0}}
      zoomControl={true}
      zoom={bounds? null : defaultZoom}
      center={bounds? null : defaultCenter}
      bounds={bounds}
    >
      <MapEvent onMouseClick={onMouseClick} onMouseMove={onMouseMove}/>
      <FullscreenControl />
      <LocateControl />
      <ScaleControl maxWidth={100} metric={true} imperial={false} />
      {rocks != null && rocks.length>0 &&
        <UseControl position='bottomleft'>
          <Checkbox as={Segment} label={<label>Group by rock</label>} toggle checked={groupByRock} onChange={(e,d) => {
            setGroupByRock(d.checked);
          }} />
        </UseControl>
      }
      <LayersControl>
        <LayersControl.BaseLayer checked={showSateliteImage} name="Norge i Bilder">
          <TileLayer
            maxZoom={21}
            attribution='<a href="https://www.norgeibilder.no/" rel="noreferrer noopener" target="_blank">Geovekst</a>'
            url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer
            maxZoom={19}
            attribution='<a href="https://openstreetmap.org/copyright" rel="noreferrer noopener" target="_blank">OpenStreetMap contributors</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={!showSateliteImage} name="Kartverket N50 topo">
          <TileLayer
            maxZoom={19}
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
        <Polygons navigate={navigate} opacity={opacity} outlines={outlines} addEventHandlers={addEventHandlers} />
        <Polylines opacity={opacity} polylines={polylines} />
      </FeatureGroup>
    </MapContainer>
  );
}

export default Leaflet;