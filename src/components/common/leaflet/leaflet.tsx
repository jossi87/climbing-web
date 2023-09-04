import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  useMapEvents,
  MapContainer,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  ScaleControl,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import {
  LatLngExpression,
  LeafletMouseEventHandlerFn,
  latLngBounds,
} from "leaflet";
import LocateControl from "./locatecontrol";
import FullscreenControl from "./fullscreencontrol";
import Markers, { MarkerDef } from "./markers";
import Polygons from "./polygons";
import Polylines from "./polylines";
import MarkerClusterGroup from "./react-leaflet-markercluster";
import { Segment, Checkbox } from "semantic-ui-react";
import UseControl from "../../../utils/use-leaflet-control";
import GetCenterFromDegrees from "../../../utils/map-utils";
import { components } from "../../../@types/buldreinfo/swagger";

function MapEvent({
  onMouseClick,
  onMouseMove,
}: {
  onMouseClick?: LeafletMouseEventHandlerFn;
  onMouseMove?: LeafletMouseEventHandlerFn;
}) {
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
  });
  return null;
}

type Props = {
  autoZoom?: boolean;
  clusterMarkers?: boolean;
  defaultCenter: { lat: number; lng: number };
  defaultZoom: number;
  flyToId?: number | null;
  height?: number | string;
  markers?: MarkerDef[];
  onMouseClick?: LeafletMouseEventHandlerFn;
  onMouseMove?: LeafletMouseEventHandlerFn;
  outlines?: {
    background?: boolean;
    outline: components["schemas"]["Coordinates"][];
    url?: string;
    label?: string;
  }[];
  polylines?: {
    background?: boolean;
    label?: string;
    polyline: LatLngExpression[];
  }[];
  rocks?: string[];
  showSatelliteImage?: boolean;
  children?: React.ReactNode | React.ReactNode[];
};

const UpdateBounds = ({
  autoZoom,
  markers,
  outlines,
  polylines,
}: Pick<Props, "autoZoom" | "markers" | "outlines" | "polylines">) => {
  const map = useMap();

  if (!autoZoom) {
    return null;
  }

  const bounds = latLngBounds([]);
  markers
    ?.filter(({ lat, lng }) => lat && lng)
    ?.forEach((latlng) => bounds.extend(latlng));
  outlines
    ?.filter(({ outline }) => !!outline)
    ?.forEach(({ outline }) =>
      outline.forEach((c) =>
        bounds.extend({ lat: c.latitude, lng: c.longitude }),
      ),
    );
  polylines
    ?.filter(({ polyline }) => polyline)
    ?.forEach(({ polyline }) =>
      polyline.forEach((latlng) => bounds.extend(latlng)),
    );

  if (
    bounds.isValid() &&
    bounds.getWest() !== bounds.getEast() &&
    bounds.getNorth() !== bounds.getSouth()
  ) {
    map.fitBounds(bounds);
  }

  return null;
};

const Leaflet = ({
  autoZoom,
  clusterMarkers,
  defaultCenter,
  defaultZoom,
  flyToId,
  height,
  markers,
  onMouseClick,
  onMouseMove,
  outlines,
  polylines,
  rocks = [],
  showSatelliteImage,
  children,
}: Props) => {
  const [groupByRock, setGroupByRock] = useState(!!rocks?.length);
  const [showElevation, setShowElevation] = useState(false);

  const opacity = 0.6;
  const addEventHandlers = !onMouseClick && !onMouseMove;
  let markerGroup;
  if (groupByRock) {
    const rockMarkers: MarkerDef[] = rocks
      .map((r) => {
        const markersOnRock = markers.filter(
          (m) => "rock" in m && m.rock === r,
        );
        const coords = markersOnRock
          .filter((m) => m.lat && m.lng)
          .map((m) => [m.lat, m.lng]);
        if (coords && coords.length > 0) {
          const centerCoordinates = GetCenterFromDegrees(coords);
          const html = (
            <>
              <b>{r}:</b>
              <br />
              {markersOnRock
                .filter((m) => "url" in m)
                .map((m: MarkerDef & { url: string }) => (
                  <React.Fragment key={m.url}>
                    <a rel="noreferrer noopener" target="_blank" href={m.url}>
                      {m.label}
                    </a>
                    <br />
                  </React.Fragment>
                ))}
            </>
          );
          return {
            lat: centerCoordinates[0],
            lng: centerCoordinates[1],
            label: r,
            rock: true,
            html,
          };
        }
      })
      .filter((item) => item); // Remove undefined
    const markersWithoutRock = markers.filter((m) => !("rock" in m) || !m.rock);
    markerGroup = (
      <Markers
        opacity={opacity}
        markers={[...rockMarkers, ...markersWithoutRock]}
        addEventHandlers={addEventHandlers}
        flyToId={flyToId}
      />
    );
  } else {
    markerGroup = (
      <Markers
        opacity={opacity}
        markers={markers}
        addEventHandlers={addEventHandlers}
        flyToId={flyToId}
      />
    );
    if (clusterMarkers) {
      markerGroup = <MarkerClusterGroup>{markerGroup}</MarkerClusterGroup>;
    }
  }

  return (
    <MapContainer
      style={{ height: height ? height : "500px", width: "100%", zIndex: 0 }}
      zoomControl={true}
      zoom={defaultZoom}
      center={defaultCenter}
    >
      <UpdateBounds
        polylines={polylines}
        outlines={outlines}
        autoZoom={autoZoom}
        markers={markers}
      />
      <MapEvent onMouseClick={onMouseClick} onMouseMove={onMouseMove} />
      <FullscreenControl />
      <LocateControl />
      <ScaleControl maxWidth={100} metric={true} imperial={false} />
      <UseControl position="bottomleft">
        {rocks != null && rocks.length > 0 && (
          <Checkbox
            as={Segment}
            size="mini"
            label={<label>Group by rock</label>}
            toggle
            checked={groupByRock}
            onChange={(e, d) => {
              setGroupByRock(d.checked);
            }}
          />
        )}
      </UseControl>
      {outlines && outlines.length > 0 && (
        <UseControl position="bottomright">
          <Checkbox
            as={Segment}
            size="mini"
            label={<label>Elevation</label>}
            toggle
            checked={showElevation}
            onChange={(e, d) => {
              setShowElevation(d.checked);
            }}
          />
        </UseControl>
      )}
      <LayersControl>
        <LayersControl.BaseLayer
          checked={showSatelliteImage}
          name="Norge i Bilder"
        >
          <TileLayer
            maxZoom={21}
            attribution='<a href="https://www.norgeibilder.no/" rel="noreferrer noopener" target="_blank">Geovekst</a>'
            url="https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name="OpenStreetMap">
          <TileLayer
            maxZoom={19}
            attribution='<a href="https://openstreetmap.org/copyright" rel="noreferrer noopener" target="_blank">OpenStreetMap contributors</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer
          checked={!showSatelliteImage}
          name="Kartverket N50 topo"
        >
          <TileLayer
            maxZoom={19}
            attribution='<a href="http://www.kartverket.no/">Kartverket</a>'
            url="https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=topo4&zoom={z}&x={x}&y={y}"
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked={true} name="Stedsnavn">
          <WMSTileLayer
            params={{
              transparent: true,
              format: "image/png",
              layers: "Stedsnavn",
              version: "1.3.0",
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
              version: "1.3.0",
            }}
            url="https://openwms.statkart.no/skwms1/wms.vegnett"
          />
        </LayersControl.Overlay>
      </LayersControl>
      <FeatureGroup>
        {markerGroup}
        <Polygons
          opacity={opacity}
          outlines={outlines}
          addEventHandlers={addEventHandlers}
          showElevation={showElevation}
        />
        <Polylines opacity={opacity} polylines={polylines} />
      </FeatureGroup>
      {children}
    </MapContainer>
  );
};

export default Leaflet;
