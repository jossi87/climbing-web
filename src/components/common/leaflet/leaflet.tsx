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
import UseControl from '../../../utils/use-leaflet-control';
import type { components } from '../../../@types/buldreinfo/swagger';

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
    ?.forEach(({ slope }) => {
      slope.coordinates?.forEach((c: components['schemas']['Coordinates']) => {
        bounds.extend({ lat: (c.latitude ?? 0) as number, lng: (c.longitude ?? 0) as number });
      });
    });

  if (
    bounds.isValid() &&
    bounds.getNorthWest().lat !== bounds.getSouthEast().lat &&
    bounds.getNorthWest().lng !== bounds.getSouthEast().lng
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
  outlines,
  slopes = null,
  rocks = [],
  showSatelliteImage,
  children,
  onMouseClick = undefined,
  onMouseMove = undefined,
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
              <b className='text-white'>{r}:</b>
              <div className='mt-1 flex flex-col gap-1'>
                {markersOnRock
                  .filter((m): m is MarkerDef & { url: string } => 'url' in m && !!m.url)
                  .map((m) => (
                    <Fragment key={m.url}>
                      <a
                        rel='noreferrer noopener'
                        target='_blank'
                        href={m.url}
                        className='text-brand font-bold hover:underline underline-offset-2'
                      >
                        {'label' in m ? m.label : ''}
                      </a>
                    </Fragment>
                  ))}
              </div>
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

  const UseControlWrapper = UseControl as FC<{
    children?: ReactNode;
    position?: string;
  }>;

  return (
    <>
      <style>{`
        .leaflet-container {
          background-color: var(--color-surface-dark) !important;
          font-family: inherit !important;
        }

        .dark-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }

        .leaflet-bar, .leaflet-control-layers {
          border: none !important;
          box-shadow: none !important;
          margin: 12px !important;
        }

        .leaflet-bar a, .leaflet-control-layers-toggle, .leaflet-control-locate a {
          background-color: var(--color-surface-nav) !important;
          border: 1px solid var(--color-surface-border) !important;
          border-radius: 8px !important;
          width: 34px !important;
          height: 34px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
          background-repeat: no-repeat;
          background-position: center;
          color: transparent !important;
          transition: all 0.2s ease;
        }

        .leaflet-control-zoom-in { 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='5' x2='12' y2='19'/%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E") !important; 
          background-size: 18px 18px !important;
        }

        .leaflet-control-zoom-out { 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E") !important; 
          background-size: 18px 18px !important;
        }

        .leaflet-control-locate a { 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 2v2M12 20v2M2 12h2m16 0h2'/%3E%3C/svg%3E") !important; 
          background-size: 18px 18px !important;
        }

        .leaflet-control-layers-toggle { 
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 2 7 12 12 22 7 12 2'/%3E%3Cpolyline points='2 17 12 22 22 17'/%3E%3Cpolyline points='2 12 12 17 22 12'/%3E%3C/svg%3E") !important; 
          background-size: 20px 20px !important;
        }

        .leaflet-control-layers-expanded {
          background: var(--color-surface-nav) !important;
          color: white !important;
          border: 1px solid var(--color-surface-border) !important;
          padding: 16px !important;
          border-radius: 12px !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5) !important;
          min-width: 180px;
        }

        .leaflet-control-layers-expanded .leaflet-control-layers-toggle {
          display: none !important;
        }

        .leaflet-bottom .bg-surface-card {
          background: rgba(13, 17, 23, 0.7) !important;
          backdrop-filter: blur(8px);
          border: 1px solid var(--color-surface-border) !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          margin: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }

        .leaflet-control-scale {
          margin: 12px !important;
        }

        .leaflet-control-scale-line {
          background: rgba(13, 17, 23, 0.5) !important;
          border: 1px solid var(--color-surface-border) !important;
          border-top: none !important;
          color: white !important;
          font-size: 9px !important;
          font-weight: bold;
          backdrop-filter: blur(4px);
          padding: 2px 5px !important;
          text-shadow: 0 1px 2px black;
        }

        .leaflet-control-attribution {
          background: transparent !important;
          color: rgba(255,255,255,0.2) !important;
          font-size: 8px !important;
        }
      `}</style>
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
        {rocks && rocks.length > 0 && (
          <UseControlWrapper position='bottomleft'>
            <div className='bg-surface-card'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={groupByRock}
                  onChange={(e) => setGroupByRock(e.target.checked)}
                  className='accent-brand'
                />
                <span className='text-[10px] font-bold text-slate-300 uppercase tracking-widest'>
                  Group by rock
                </span>
              </label>
            </div>
          </UseControlWrapper>
        )}
        {((outlines?.length ?? 0) > 0 || (markers?.length ?? 0) > 0) && (
          <UseControlWrapper position='bottomright'>
            <div className='bg-surface-card'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={showElevation}
                  onChange={(e) => setShowElevation(e.target.checked)}
                  className='accent-brand'
                />
                <span className='text-[10px] font-bold text-slate-300 uppercase tracking-widest'>
                  Elevation
                </span>
              </label>
            </div>
          </UseControlWrapper>
        )}
        <LayersControl>
          <LayersControl.BaseLayer checked={showSatelliteImage} name='Norge i Bilder'>
            <TileLayer
              maxZoom={21}
              attribution='&copy; Geovekst'
              url='https://waapi.webatlas.no/maptiles/tiles/webatlas-orto-newup/wa_grid/{z}/{x}/{y}.jpeg?api_key=b8e36d51-119a-423b-b156-d744d54123d5'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name='OpenStreetMap'>
            <TileLayer
              className={!showSatelliteImage ? 'dark-tiles' : ''}
              maxZoom={19}
              attribution='&copy; OpenStreetMap'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer checked={!showSatelliteImage} name='Kartverket N50 topo'>
            <TileLayer
              className={!showSatelliteImage ? 'dark-tiles' : ''}
              maxZoom={18}
              attribution='&copy; Kartverket'
              url='https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png'
            />
          </LayersControl.BaseLayer>

          <LayersControl.Overlay checked={true} name='Stedsnavn'>
            <WMSTileLayer
              className={!showSatelliteImage ? 'dark-tiles' : ''}
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
              className={!showSatelliteImage ? 'dark-tiles' : ''}
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
    </>
  );
};

export default Leaflet;
