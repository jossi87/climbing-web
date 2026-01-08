import { useState, type FC, Fragment, type ReactNode } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  useMapEvents,
  MapContainer,
  TileLayer,
  LayersControl,
  WMSTileLayer,
  ScaleControl,
  FeatureGroup,
  useMap,
} from 'react-leaflet';
import { type LeafletMouseEventHandlerFn, latLngBounds } from 'leaflet';
import Locate from './locate';
import FullscreenControl from './fullscreencontrol';
import Markers, { type MarkerDef } from './markers';
import Polygons from './polygons';
import Polylines from './polylines';
import MarkerClusterGroup from './react-leaflet-markercluster';
import { Segment, Checkbox } from 'semantic-ui-react';
import UseControl from '../../../utils/use-leaflet-control';

// Local fallback for computing the geographic center from an array of [lat,lng]
function computeCenterFromDegrees(coords: number[][]): [number, number] | null {
  if (!coords || coords.length === 0) return null;
  let sumLat = 0;
  let sumLng = 0;
  let count = 0;
  for (const c of coords) {
    const lat = c[0] ?? 0;
    const lng = c[1] ?? 0;
    sumLat += lat;
    sumLng += lng;
    count += 1;
  }
  if (count === 0) return null;
  return [sumLat / count, sumLng / count];
}
import type { components } from '../../../@types/buldreinfo/swagger';

function MapEvent({
  onMouseClick,
  onMouseMove,
}: {
  onMouseClick?: LeafletMouseEventHandlerFn | null;
  onMouseMove?: LeafletMouseEventHandlerFn | null;
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
  markers?: MarkerDef[] | null;
  onMouseClick?: LeafletMouseEventHandlerFn | null;
  onMouseMove?: LeafletMouseEventHandlerFn | null;
  outlines?:
    | {
        background?: boolean;
        outline: components['schemas']['Coordinates'][];
        url?: string;
        label?: string;
      }[]
    | undefined;
  slopes?:
    | {
        background?: boolean;
        backgroundColor: string;
        label?: string;
        slope: components['schemas']['Slope'];
      }[]
    | null;
  rocks?: string[];
  showSatelliteImage?: boolean;
  children?: ReactNode | ReactNode[];
};

const UpdateBounds = ({
  autoZoom,
  markers,
  outlines,
  slopes,
}: Pick<Props, 'autoZoom' | 'markers' | 'outlines' | 'slopes'>) => {
  const map = useMap();

  if (!autoZoom) {
    return null;
  }

  const bounds = latLngBounds([]);
  markers
    ?.filter(
      ({ coordinates }) => (coordinates?.latitude ?? 0) > 0 && (coordinates?.longitude ?? 0) > 0,
    )
    ?.forEach(({ coordinates }) =>
      bounds.extend([
        (coordinates?.latitude ?? 0) as number,
        (coordinates?.longitude ?? 0) as number,
      ]),
    );
  outlines
    ?.filter(({ outline }) => !!outline)
    ?.forEach(({ outline }) =>
      outline.forEach((c) =>
        bounds.extend({ lat: (c.latitude ?? 0) as number, lng: (c.longitude ?? 0) as number }),
      ),
    );
  slopes
    ?.filter(({ slope }) => !!slope)
    ?.forEach(({ slope }) =>
      slope.coordinates?.forEach((c) =>
        bounds.extend({ lat: (c.latitude ?? 0) as number, lng: (c.longitude ?? 0) as number }),
      ),
    );

  if (
    bounds.isValid() &&
    bounds.getNorthWest().lat != bounds.getSouthEast().lat &&
    bounds.getNorthWest().lng != bounds.getSouthEast().lng
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
  markers = null,
  onMouseClick = undefined,
  onMouseMove = undefined,
  outlines,
  slopes = null,
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
    const rockMarkers: MarkerDef[] = (rocks ?? [])
      .map((r) => {
        const markersOnRock = (markers ?? []).filter((m) => 'rock' in m && m.rock === r);
        const coords = markersOnRock
          .filter(
            ({ coordinates }) =>
              (coordinates?.latitude ?? 0) > 0 && (coordinates?.longitude ?? 0) > 0,
          )
          .map(({ coordinates }) => [coordinates?.latitude ?? 0, coordinates?.longitude ?? 0]);
        if (coords && coords.length > 0) {
          const centerCoordinates = computeCenterFromDegrees(coords) ?? [
            coords[0][0],
            coords[0][1],
          ];
          const html = (
            <>
              <b>{r}:</b>
              <br />
              {markersOnRock
                .filter((m): m is MarkerDef & { url: string } => 'url' in m && !!m.url)
                .map((m) => (
                  <Fragment key={m.url}>
                    <a rel='noreferrer noopener' target='_blank' href={m.url}>
                      {'label' in m ? m.label : ''}
                    </a>
                    <br />
                  </Fragment>
                ))}
            </>
          );
          return {
            coordinates: {
              latitude: centerCoordinates[0],
              longitude: centerCoordinates[1],
            },
            label: r,
            rock: true,
            html,
          } as MarkerDef;
        }
        return undefined;
      })
      .filter((item) => !!item) as MarkerDef[];
    const markersWithoutRock = (markers ?? []).filter((m) => !('rock' in m) || !m.rock);
    markerGroup = (
      <Markers
        opacity={opacity}
        markers={[...rockMarkers, ...markersWithoutRock]}
        addEventHandlers={addEventHandlers}
        flyToId={flyToId}
        showElevation={showElevation}
      />
    );
  } else {
    markerGroup = (
      <Markers
        opacity={opacity}
        markers={markers ?? []}
        addEventHandlers={addEventHandlers}
        flyToId={flyToId}
        showElevation={showElevation}
      />
    );
    if (clusterMarkers) {
      markerGroup = <MarkerClusterGroup>{markerGroup}</MarkerClusterGroup>;
    }
  }

  // Use a generic wrapper to allow passing children to the control
  const UseControlWrapper = UseControl as FC<{
    children?: ReactNode;
    position?: string;
  }>;

  return (
    <MapContainer
      style={{ height: height ? height : '500px', width: '100%', zIndex: 0 }}
      zoomControl={true}
      zoom={defaultZoom}
      center={defaultCenter}
    >
      <UpdateBounds slopes={slopes} outlines={outlines} autoZoom={autoZoom} markers={markers} />
      <MapEvent onMouseClick={onMouseClick} onMouseMove={onMouseMove} />
      <FullscreenControl />
      <Locate />
      <ScaleControl maxWidth={100} metric={true} imperial={false} />
      <UseControlWrapper position='bottomleft'>
        {rocks != null && rocks.length > 0 && (
          <Checkbox
            as={Segment}
            size='mini'
            label={<label>Group by rock</label>}
            toggle
            checked={groupByRock}
            onChange={(e, d) => {
              setGroupByRock(!!d.checked);
            }}
          />
        )}
      </UseControlWrapper>
      {((outlines?.length ?? 0) > 0 || (markers?.length ?? 0) > 0) && (
        <UseControlWrapper position='bottomright'>
          <Checkbox
            as={Segment}
            size='mini'
            label={<label>Elevation</label>}
            toggle
            checked={showElevation}
            onChange={(e, d) => {
              setShowElevation(!!d.checked);
            }}
          />
        </UseControlWrapper>
      )}
      <LayersControl>
        <LayersControl.BaseLayer checked={showSatelliteImage} name='Norge i Bilder'>
          <TileLayer
            maxZoom={21}
            attribution='<a href="https://www.norgeibilder.no/" rel="noreferrer noopener" target="_blank">Geovekst</a>'
            url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer name='OpenStreetMap'>
          <TileLayer
            maxZoom={19}
            attribution='<a href="https://openstreetmap.org/copyright" rel="noreferrer noopener" target="_blank">OpenStreetMap contributors</a>'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={!showSatelliteImage} name='Kartverket N50 topo'>
          <TileLayer
            maxZoom={18}
            attribution='<a href="http://www.kartverket.no/">Kartverket</a>'
            url='https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png'
          />
        </LayersControl.BaseLayer>

        <LayersControl.Overlay checked={true} name='Stedsnavn'>
          <WMSTileLayer
            params={{
              transparent: true,
              format: 'image/png',
              layers: 'Stedsnavn',
              version: '1.3.0',
            }}
            url='https://openwms.statkart.no/skwms1/wms.topo4'
          />
        </LayersControl.Overlay>

        <LayersControl.Overlay checked={true} name='Vegnett'>
          <WMSTileLayer
            params={{
              transparent: true,
              format: 'image/png',
              layers: 'all',
              version: '1.3.0',
            }}
            url='https://openwms.statkart.no/skwms1/wms.vegnett'
          />
        </LayersControl.Overlay>
      </LayersControl>
      <FeatureGroup>
        {markerGroup}
        <Polygons
          opacity={opacity}
          outlines={outlines ?? []}
          addEventHandlers={addEventHandlers}
          showElevation={showElevation}
        />
        <Polylines opacity={opacity} slopes={slopes ?? []} />
      </FeatureGroup>
      {children}
    </MapContainer>
  );
};

export default Leaflet;
