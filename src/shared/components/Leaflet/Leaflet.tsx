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
import { Activity } from 'lucide-react';
import Locate from './locate';
import FullscreenControl from './fullscreencontrol';
import Markers, { type MarkerDef } from './markers';
import Polygons from './polygons';
import Polylines from './polylines';
import MarkerClusterGroup from './ReactLeafletMarkerCluster';
import UseControl from '../../../utils/use-leaflet-control';
import type { components } from '../../../@types/buldreinfo/swagger';
import { cn } from '../../../lib/utils';
import { designContract } from '../../../design/contract';

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
  /** Bottom-right elevation labels toggle; hide on embedded TOC maps so it is not mistaken for page chrome. */
  showElevationControl?: boolean;
  children?: ReactNode | ((state: { showElevation: boolean }) => ReactNode);
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
    ?.filter(({ coordinates }) => (coordinates?.latitude ?? 0) > 0 && (coordinates?.longitude ?? 0) > 0)
    ?.forEach(({ coordinates }) =>
      bounds.extend([(coordinates?.latitude ?? 0) as number, (coordinates?.longitude ?? 0) as number]),
    );
  outlines
    ?.filter(({ outline }) => !!outline)
    ?.forEach(({ outline }) =>
      outline.forEach((c) => bounds.extend({ lat: (c.latitude ?? 0) as number, lng: (c.longitude ?? 0) as number })),
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
  showElevationControl = true,
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
          .filter(({ coordinates }) => (coordinates?.latitude ?? 0) > 0 && (coordinates?.longitude ?? 0) > 0)
          .map(({ coordinates }) => [coordinates?.latitude ?? 0, coordinates?.longitude ?? 0]);
        if (coords && coords.length > 0) {
          const centerCoordinates = computeCenterFromDegrees(coords) ?? [coords[0][0], coords[0][1]];
          const html = (
            <>
              <div className={cn(designContract.typography.micro, 'text-slate-500')}>{r}</div>
              <div className='mt-2 flex flex-col gap-1.5'>
                {markersOnRock
                  .filter((m): m is MarkerDef & { url: string } => 'url' in m && !!m.url)
                  .map((m) => (
                    <Fragment key={m.url}>
                      <a
                        rel='noreferrer noopener'
                        target='_blank'
                        href={m.url}
                        className={cn(
                          designContract.typography.body,
                          'buldreinfo-popup-primary-link font-medium underline-offset-2 transition-colors hover:underline',
                        )}
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

  const mapContainerEl = (
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
            <label className='flex cursor-pointer items-center gap-2'>
              <input
                type='checkbox'
                checked={groupByRock}
                onChange={(e) => setGroupByRock(e.target.checked)}
                className='accent-brand'
              />
              <span className={cn('text-slate-300', designContract.typography.label)}>Group by rock</span>
            </label>
          </div>
        </UseControlWrapper>
      )}
      {showElevationControl && ((outlines?.length ?? 0) > 0 || (markers?.length ?? 0) > 0) && (
        <UseControlWrapper position='bottomright'>
          <button
            type='button'
            onClick={() => setShowElevation((v) => !v)}
            className={cn(
              'inline-flex h-[34px] w-[34px] items-center justify-center rounded-lg border p-0 shadow-md transition-[background-color,border-color,box-shadow]',
              /*
               * Do not use `bg-surface-card` here: `.leaflet-bottom .bg-surface-card` frosts/blurs the “Group by rock”
               * chip and also matched this button, which smeared the tiny Activity glyph into a dot.
               */
              showElevation
                ? 'border-brand-border bg-surface-hover ring-brand/25 light:shadow-[0_4px_14px_rgba(15,23,42,0.12)] light:ring-brand/35 shadow-[0_4px_12px_rgba(0,0,0,0.5)] ring-1'
                : 'border-surface-border/60 light:shadow-[0_4px_14px_rgba(15,23,42,0.1),0_0_0_1px_rgba(15,23,42,0.05)] bg-[var(--color-surface-card)] shadow-[0_4px_12px_rgba(0,0,0,0.5)]',
            )}
            aria-pressed={showElevation}
            aria-label={showElevation ? 'Hide elevation labels' : 'Show elevation labels'}
            title={showElevation ? 'Hide elevation labels' : 'Show elevation labels'}
          >
            <Activity
              size={18}
              strokeWidth={2.25}
              className={cn('pointer-events-none block shrink-0 text-slate-200', 'light:type-body')}
              aria-hidden
            />
          </button>
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
            maxZoom={19}
            attribution='&copy; OpenStreetMap'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        </LayersControl.BaseLayer>

        <LayersControl.BaseLayer checked={!showSatelliteImage} name='Kartverket N50 topo'>
          <TileLayer
            maxZoom={18}
            attribution='&copy; Kartverket'
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
      {typeof children === 'function' ? children({ showElevation }) : children}
    </MapContainer>
  );

  return (
    <>
      <style>{`
        .leaflet-container {
          background-color: var(--color-surface-card) !important;
          font-family: inherit !important;
          border: none !important;
          outline: none !important;
        }

        /* Default Leaflet popups are light; force dark UI to match the app */
        .leaflet-container .leaflet-popup-content-wrapper {
          background: var(--color-surface-card) !important;
          color: var(--color-white) !important;
          border: 1px solid var(--color-surface-border) !important;
          border-radius: 12px !important;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55) !important;
        }
        html[data-theme='light'] .leaflet-container .leaflet-popup-content-wrapper {
          box-shadow: 0 14px 36px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06) !important;
        }
        .leaflet-container .leaflet-popup-tip {
          background: var(--color-surface-card) !important;
          border: 1px solid var(--color-surface-border) !important;
          box-shadow: none !important;
        }
        .leaflet-container .leaflet-popup-content {
          margin: 12px 14px !important;
          color: var(--color-white) !important;
          line-height: 1.45 !important;
        }
        /* Popup links: override Leaflet default anchor color (#0078A8); Tailwind loses to that rule. */
        .leaflet-container .leaflet-popup-pane a:not(.leaflet-popup-close-button) {
          color: var(--color-muted-ink) !important;
          text-decoration: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        .leaflet-container .leaflet-popup-pane a:not(.leaflet-popup-close-button):hover {
          color: var(--color-white) !important;
        }
        .leaflet-container .leaflet-popup-pane a.buldreinfo-popup-primary-link {
          color: var(--color-leaflet-link-strong) !important;
          font-weight: 600 !important;
        }
        .leaflet-container .leaflet-popup-pane a.buldreinfo-popup-primary-link:hover {
          color: var(--color-leaflet-link-strong-hover) !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: var(--color-muted-ink) !important;
          padding: 8px 10px 0 0 !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: var(--color-white) !important;
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
        html[data-theme='light'] .leaflet-bar a,
        html[data-theme='light'] .leaflet-control-layers-toggle,
        html[data-theme='light'] .leaflet-control-locate a {
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.05) !important;
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

        html[data-theme='light'] .leaflet-control-zoom-in {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='5' x2='12' y2='19'/%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E") !important;
        }
        html[data-theme='light'] .leaflet-control-zoom-out {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'/%3E%3C/svg%3E") !important;
        }
        html[data-theme='light'] .leaflet-control-locate a {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Ccircle cx='12' cy='12' r='3'/%3E%3Cpath d='M12 2v2M12 20v2M2 12h2m16 0h2'/%3E%3C/svg%3E") !important;
        }
        html[data-theme='light'] .leaflet-control-layers-toggle {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230f172a' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 2 7 12 12 22 7 12 2'/%3E%3Cpolyline points='2 17 12 22 22 17'/%3E%3Cpolyline points='2 12 12 17 22 12'/%3E%3C/svg%3E") !important;
        }

        .leaflet-control-layers-expanded {
          background: var(--color-surface-nav) !important;
          color: var(--color-white) !important;
          border: 1px solid var(--color-surface-border) !important;
          padding: 10px !important;
          border-radius: 10px !important;
          font-size: 10px !important;
          font-weight: 500 !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5) !important;
          min-width: 156px;
          line-height: 1.25 !important;
        }
        html[data-theme='light'] .leaflet-control-layers-expanded {
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06) !important;
        }

        .leaflet-control-layers-expanded .leaflet-control-layers-list {
          margin: 0 !important;
        }

        .leaflet-control-layers-expanded label {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          margin: 0 !important;
          padding: 2px 0 !important;
        }

        .leaflet-control-layers-expanded .leaflet-control-layers-toggle {
          display: none !important;
        }

        .leaflet-bottom .bg-surface-card {
          background: color-mix(in srgb, var(--color-surface-card) 74%, transparent) !important;
          backdrop-filter: blur(8px);
          border: 1px solid var(--color-surface-border) !important;
          border-radius: 10px !important;
          padding: 8px 12px !important;
          margin: 12px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
        html[data-theme='light'] .leaflet-bottom .bg-surface-card {
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(15, 23, 42, 0.05) !important;
        }

        .leaflet-control-scale {
          margin: 12px !important;
        }

        .leaflet-control-scale-line {
          background: color-mix(in srgb, var(--color-surface-card) 52%, transparent) !important;
          border: 1px solid var(--color-surface-border) !important;
          border-top: none !important;
          color: var(--color-white) !important;
          font-size: 9px !important;
          font-weight: bold;
          backdrop-filter: blur(4px);
          padding: 2px 5px !important;
          text-shadow: 0 1px 2px black;
        }
        html[data-theme='light'] .leaflet-control-scale-line {
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.85);
        }

        .leaflet-control-attribution {
          background: transparent !important;
          color: rgba(255,255,255,0.2) !important;
          font-size: 8px !important;
        }
        html[data-theme='light'] .leaflet-control-attribution {
          color: rgba(15, 23, 42, 0.38) !important;
        }

        .leaflet-container .leaflet-tooltip {
          background-color: var(--color-surface-nav) !important;
          border: 1px solid var(--color-surface-border) !important;
          color: var(--color-white) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45) !important;
        }
        html[data-theme='light'] .leaflet-container .leaflet-tooltip {
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.06) !important;
        }
        .leaflet-container .leaflet-tooltip-top:before {
          border-top-color: var(--color-surface-nav) !important;
        }
        .leaflet-container .leaflet-tooltip-bottom:before {
          border-bottom-color: var(--color-surface-nav) !important;
        }
        .leaflet-container .leaflet-tooltip-left:before {
          border-left-color: var(--color-surface-nav) !important;
        }
        .leaflet-container .leaflet-tooltip-right:before {
          border-right-color: var(--color-surface-nav) !important;
        }

        .buldreinfo-tooltip-compact {
          font-size: 9px !important;
          line-height: 1.15 !important;
          padding: 1px 5px !important;
          border-radius: 6px !important;
          max-width: 150px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          opacity: 0.95 !important;
        }

        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background: rgba(43, 50, 63, 0.55) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
          border-radius: 9999px !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45) !important;
        }
        html[data-theme='light'] .marker-cluster-small,
        html[data-theme='light'] .marker-cluster-medium,
        html[data-theme='light'] .marker-cluster-large {
          background: rgba(148, 163, 184, 0.35) !important;
          border: 1px solid rgba(15, 23, 42, 0.12) !important;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12) !important;
        }

        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background: color-mix(in srgb, var(--color-brand) 88%, #12151c) !important;
          color: rgb(15, 23, 42) !important;
          border: none !important;
          border-radius: 9999px !important;
          width: 30px !important;
          height: 30px !important;
          margin: 4px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-shadow: none !important;
        }
      `}</style>
      {mapContainerEl}
    </>
  );
};

export default Leaflet;
