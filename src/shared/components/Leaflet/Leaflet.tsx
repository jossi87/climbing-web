import { useEffect, useMemo, useRef, useState, type FC, Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import {
  useMapEvents,
  MapContainer,
  TileLayer,
  LayersControl,
  ScaleControl,
  FeatureGroup,
  useMap,
} from 'react-leaflet';
import { type LatLng, type LatLngBounds, type LeafletMouseEventHandlerFn, latLngBounds } from 'leaflet';
import { Activity } from 'lucide-react';
import Locate from './locate';
import FullscreenControl from './fullscreencontrol';
import Markers, { type MarkerDef } from './markers';
import Polygons from './polygons';
import Polylines from './polylines';
import MarkerClusterGroup from './ReactLeafletMarkerCluster';
import OsmFallback from './osmfallback';
import KartverketOverlays from './kartverketoverlays';
import UseControl from '../../../utils/use-leaflet-control';
import type { components } from '../../../@types/buldreinfo/swagger';
import { useMeta } from '../Meta/context';
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

/**
 * 1×1 transparent GIF used for failed tiles. A regional base layer without coverage (or with a
 * tile server that is down) then renders nothing, so the OSM fallback underneath shows through
 * instead of a broken image.
 */
const TRANSPARENT_TILE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

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

type TrailDef = {
  background?: boolean;
  backgroundColor: string;
  label?: string;
  trail: components['schemas']['Trail'];
};

type Props = {
  /**
   * Frame the map on what it draws (markers, outlines, trails) instead of the region's
   * `defaultCenter`/`defaultZoom`. The view follows the content's extent, so e.g. a profile map shows
   * where that user has actually climbed. Without any coordinates the defaults are used.
   */
  autoZoom?: boolean;
  /**
   * Zoom for `autoZoom` content that has no box to fit (one marker, or markers on the same spot / in
   * a straight line) — a centre is all there is. Defaults to `defaultZoom`.
   */
  autoZoomPointZoom?: number;
  clusterMarkers?: boolean;
  /** Fallback centre — only used when the map does not `autoZoom`, or the content has no coordinates. */
  defaultCenter: { lat: number; lng: number };
  /** Fallback zoom — only used when the map does not `autoZoom`, or the content has no coordinates. */
  defaultZoom: number;
  flyToId?: number | null;
  height?: number | string;
  markers?: MarkerDef[] | null;
  onMarkerClick?: (marker: MarkerDef) => void;
  /** Coordinates [lat, lng] of the currently active/highlighted marker */
  activeMarkerPosition?: [number, number] | null;
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
  trails?: TrailDef[] | null;
  rocks?: string[];
  /** Bottom-right elevation labels toggle; hide on embedded TOC maps so it is not mistaken for page chrome. */
  showElevationControl?: boolean;
  /** Overlay rendered in the bottom-right corner, above the elevation button. */
  mapOverlay?: ReactNode;
  children?: ReactNode | ((state: { showElevation: boolean }) => ReactNode);
};

type ContentProps = Pick<Props, 'markers' | 'outlines' | 'trails'>;

/**
 * Geographic extent of everything the map draws — markers, outlines and trails.
 *
 * `autoZoom` frames the map on this instead of the region's `defaultCenter`/`defaultZoom`. `null`
 * means the content has no usable coordinates, so the caller's defaults stay in charge.
 */
function computeContentBounds({ markers, outlines, trails }: ContentProps): LatLngBounds | null {
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
  trails
    ?.filter(({ trail }) => !!trail)
    ?.forEach(({ trail }) => {
      trail.path?.forEach((c: components['schemas']['Coordinates']) => {
        bounds.extend({ lat: (c.latitude ?? 0) as number, lng: (c.longitude ?? 0) as number });
      });
    });
  return bounds.isValid() ? bounds : null;
}

/**
 * Bounds that cannot be fitted: they have no extent in at least one axis (a single coordinate, or
 * several on the same spot / in a straight line). `fitBounds` divides by the box's pixel size and
 * would ask for an infinite zoom, so such content is framed as a centre plus a zoom instead.
 */
function isPointLike(bounds: LatLngBounds): boolean {
  const northWest = bounds.getNorthWest();
  const southEast = bounds.getSouthEast();
  return northWest.lat === southEast.lat || northWest.lng === southEast.lng;
}

type AutoZoomView = { center: LatLng; zoom: number } | { bounds: LatLngBounds };

/**
 * View for `autoZoom` content: its box, or its centre plus a zoom when there is no box to fit. A box
 * is handed to `MapContainer` as `bounds`, which fits it the moment the map is created — with the
 * container's real size — so the very first frame is already framed on the content.
 */
function getAutoZoomView(bounds: LatLngBounds | null, pointZoom: number): AutoZoomView | null {
  if (!bounds) return null;
  return isPointLike(bounds) ? { center: bounds.getCenter(), zoom: pointZoom } : { bounds };
}

const UpdateBounds = ({
  autoZoom,
  bounds,
  pointZoom,
}: {
  autoZoom?: boolean;
  bounds: LatLngBounds | null;
  pointZoom: number;
}) => {
  const map = useMap();
  /*
   * Refit only when the content's extent changes — a filter hides some areas, a trail/outline appears
   * — never on every render: a pan or zoom the user made must survive unrelated re-renders. The box
   * string is the key because that is all `fitBounds` depends on.
   */
  const viewKey = bounds?.toBBoxString() ?? '';
  const latestBounds = useRef(bounds);
  latestBounds.current = bounds;

  useEffect(() => {
    const next = latestBounds.current;
    if (!autoZoom || !viewKey || !next) {
      return;
    }
    if (isPointLike(next)) {
      /*
       * No box to fit. `MapContainer` already centred this content on creation; only recentre when it
       * moved outside the current view, so marking a spot by clicking the map (the edit pages) does
       * not yank the map out from under the pointer.
       */
      const center = next.getCenter();
      if (!map.getBounds().contains(center)) {
        map.setView(center, pointZoom);
      }
      return;
    }
    map.fitBounds(next);
  }, [autoZoom, map, pointZoom, viewKey]);

  return null;
};

const Leaflet = ({
  activeMarkerPosition,
  autoZoom,
  autoZoomPointZoom,
  clusterMarkers,
  defaultCenter,
  defaultZoom,
  flyToId,
  height,
  markers = null,
  onMarkerClick,
  outlines,
  trails = null,
  rocks = [],
  showElevationControl = true,
  mapOverlay,
  children,
  onMouseClick = undefined,
  onMouseMove = undefined,
}: Props) => {
  const { t } = useTranslation();
  const [groupByRock, setGroupByRock] = useState(!!rocks?.length);
  const [showElevation, setShowElevation] = useState(false);
  /** Base maps offered by the active region; the region's default is the one selected on load. */
  const { maps } = useMeta();

  /** Extent of the drawn content — what an `autoZoom` map is framed on. */
  const contentBounds = useMemo(
    () => (autoZoom ? computeContentBounds({ markers, outlines, trails }) : null),
    [autoZoom, markers, outlines, trails],
  );
  /** Zoom for content with no box to fit; `defaultZoom` keeps the caller's scale unless overridden. */
  const pointZoom = autoZoomPointZoom ?? defaultZoom;
  const autoZoomView = getAutoZoomView(contentBounds, pointZoom);
  /*
   * `MapContainer` applies its view once, on creation. A content box therefore goes in as `bounds`
   * (fitted right there, at the container's real size), while a point goes in as `center` + `zoom`;
   * only a map with no content falls back to the region's `defaultCenter`/`defaultZoom`.
   */
  const viewBounds = autoZoomView && 'bounds' in autoZoomView ? autoZoomView.bounds : undefined;
  const viewCenter = autoZoomView ? ('center' in autoZoomView ? autoZoomView.center : undefined) : defaultCenter;
  const viewZoom = autoZoomView ? ('zoom' in autoZoomView ? autoZoomView.zoom : undefined) : defaultZoom;

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
        onMarkerClick={onMarkerClick}
        activeMarkerPosition={activeMarkerPosition}
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
        onMarkerClick={onMarkerClick}
        activeMarkerPosition={activeMarkerPosition}
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
      zoom={viewZoom}
      center={viewCenter}
      bounds={viewBounds}
    >
      <UpdateBounds autoZoom={autoZoom} bounds={contentBounds} pointZoom={pointZoom} />

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
              <span className={cn('text-slate-300', designContract.typography.label)}>{t('leaflet.groupByRock')}</span>
            </label>
          </div>
        </UseControlWrapper>
      )}
      {mapOverlay && <UseControlWrapper position='bottomright'>{mapOverlay}</UseControlWrapper>}
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
            aria-label={t(showElevation ? 'leaflet.hideElevationLabels' : 'leaflet.showElevationLabels')}
            title={t(showElevation ? 'leaflet.hideElevationLabels' : 'leaflet.showElevationLabels')}
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
      {/* World-wide underlay: covers areas (and tile failures) outside the region's base map coverage. */}
      <OsmFallback maps={maps} />
      <LayersControl>
        {maps.map((base) => (
          <LayersControl.BaseLayer key={base.id} name={base.name} checked={base.isDefault}>
            <TileLayer
              maxZoom={base.maxZoom}
              attribution={base.attribution}
              url={base.url}
              errorTileUrl={TRANSPARENT_TILE}
              zIndex={1}
            />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>

      {/* Kartverket place names + roads, only requested where the services actually have data. */}
      <KartverketOverlays maps={maps} />
      <FeatureGroup>
        {markerGroup}
        <Polygons
          opacity={opacity}
          outlines={outlines ?? []}
          addEventHandlers={addEventHandlers}
          showElevation={showElevation}
        />
        <Polylines opacity={opacity} trails={trails ?? undefined} />
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
          box-shadow: none !important;
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
          padding: 2px 6px !important;
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
          font-size: 8px !important;
          line-height: 1 !important;
          padding: 0 3px !important;
          border-radius: 3px !important;
          max-width: 100px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        .buldreinfo-tooltip-semi {
          opacity: 0.6 !important;
        }

        .buldreinfo-tooltip-clickable {
          cursor: pointer !important;
          padding: 0 4px !important;
          font-size: 8px !important;
          font-weight: 600 !important;
        }
        .buldreinfo-tooltip-clickable:hover {
          opacity: 1 !important;
          background-color: var(--color-surface-card) !important;
          border-color: var(--color-brand) !important;
        }

        .buldreinfo-popup-primary-link {
          cursor: pointer !important;
          color: var(--color-slate-100) !important;
          transition: color 0.15s ease !important;
        }
        .buldreinfo-popup-primary-link:hover {
          color: var(--color-brand) !important;
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
