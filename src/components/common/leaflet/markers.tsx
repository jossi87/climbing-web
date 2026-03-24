import { useRef, useEffect, type ReactNode } from 'react';
import { Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import { markerBlueIcon, markerRedIcon, parkingIcon, weatherIcon, rockIcon } from './icons';
import { useNavigate } from 'react-router';
import type { Marker as LeafletMarker } from 'leaflet';
import type { components } from '../../../@types/buldreinfo/swagger';
import { captureException } from '@sentry/react';
import { Navigation, ExternalLink, CloudSun } from 'lucide-react';

type ParkingMarker = {
  coordinates: components['schemas']['Coordinates'];
  isParking: true;
};

type CameraFeed = {
  id: string;
  urlStillImage: string;
  lastUpdated: string;
};

type CameraMarker = {
  coordinates: components['schemas']['Coordinates'];
  label: string;
  isCamera: true;
  name: string;
  feeds: CameraFeed[];
  urlYr?: string;
  urlOther?: string;
};

type HtmlMarker = {
  id: number;
  coordinates: components['schemas']['Coordinates'];
  label: string;
  html: ReactNode;
  rock?: string;
};

type LabelMarker = {
  coordinates: components['schemas']['Coordinates'];
  label: string;
  url: string;
};

type GenericMarker = {
  coordinates: components['schemas']['Coordinates'];
  label?: string;
  url?: string;
  rock?: boolean | string | number | null;
};

export type MarkerDef = CameraMarker | GenericMarker | HtmlMarker | LabelMarker | ParkingMarker;

type Props = {
  markers: MarkerDef[];
  opacity: number;
  addEventHandlers: boolean;
  flyToId: number | undefined | null;
  showElevation?: boolean;
};

const isCoordinateMarker = (
  m: MarkerDef,
): m is MarkerDef & Required<Pick<MarkerDef, 'coordinates'>> =>
  !!(m.coordinates.latitude && m.coordinates.longitude);

const isParkingMarker = (m: MarkerDef): m is ParkingMarker =>
  isCoordinateMarker(m) && (m as ParkingMarker).isParking;

const isCameraMarker = (m: MarkerDef): m is CameraMarker => (m as CameraMarker).isCamera;

const isHtmlMarker = (m: MarkerDef): m is HtmlMarker => !!(m as HtmlMarker).html;

const isLabelMarker = (m: MarkerDef): m is LabelMarker => !!(m as LabelMarker).label;

export default function Markers({
  opacity,
  markers,
  addEventHandlers,
  flyToId,
  showElevation,
}: Props) {
  const navigate = useNavigate();
  const map = useMap();
  const markerRefs = useRef<Record<number, LeafletMarker | null>>({});

  useEffect(() => {
    if (map && flyToId && markerRefs.current[flyToId]) {
      const marker = markerRefs.current[flyToId];
      if (marker) {
        map.flyTo(marker.getLatLng(), 13, { animate: false });
        marker.openPopup();
      } else {
        captureException('Missing marker ref', {
          extra: { flyToId, refs: Object.keys(markerRefs.current ?? {}) },
        });
      }
    }
  }, [flyToId, map]);

  if (!markers) return null;

  return markers.map((m) => {
    const lat = m.coordinates.latitude ?? 0;
    const lng = m.coordinates.longitude ?? 0;
    const position: [number, number] = [lat, lng];

    if (isParkingMarker(m)) {
      return (
        <Marker icon={parkingIcon} position={position} key={['parking', lat, lng].join('/')}>
          <Popup closeButton={false}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 px-3 py-2 bg-brand hover:brightness-110 text-surface-dark rounded-md text-xs font-black uppercase transition-all no-underline shadow-sm'
            >
              <Navigation size={14} />
              Navigate
            </a>
          </Popup>
        </Marker>
      );
    }

    let labelText = m.label;
    if (showElevation && m.coordinates.elevation) {
      const elevation = Math.round(m.coordinates.elevation);
      labelText = labelText ? `${labelText} (${elevation}m)` : `${elevation}m`;
    }

    if (isCameraMarker(m)) {
      return (
        <Marker icon={weatherIcon} position={position} key={['camera', lat, lng].join('/')}>
          <Popup closeButton={false} className='buldreinfo-dark-popup'>
            <div className='space-y-4 text-left min-w-64 max-h-[60vh] overflow-y-auto scrollbar-hide'>
              <style>{`
                .buldreinfo-dark-popup .leaflet-popup-content-wrapper {
                  background: var(--color-surface-card) !important;
                  color: var(--color-white) !important;
                  border: 1px solid var(--color-surface-border) !important;
                  border-radius: 12px !important;
                }
                .buldreinfo-dark-popup .leaflet-popup-tip {
                  background: var(--color-surface-card) !important;
                  border: 1px solid var(--color-surface-border) !important;
                }
                .buldreinfo-dark-popup .leaflet-popup-content {
                  margin: 16px !important;
                }
              `}</style>
              <div className='flex flex-col sticky top-0 bg-surface-card z-10 pb-2 border-b border-surface-border'>
                <span className='text-sm font-bold text-slate-100 leading-tight'>{m.name}</span>
              </div>

              <div className='space-y-4 pt-2'>
                {m.feeds.map((feed) => (
                  <div key={feed.id} className='space-y-1.5'>
                    <a
                      href={feed.urlStillImage}
                      target='_blank'
                      rel='noreferrer'
                      className='block overflow-hidden rounded-lg border border-surface-border hover:border-brand/50 transition-colors bg-surface-dark'
                    >
                      <img
                        src={feed.urlStillImage}
                        alt={m.name}
                        className='w-full h-auto block'
                        loading='lazy'
                      />
                    </a>
                    <div className='flex justify-end items-center'>
                      <span className='text-[9px] text-slate-600 font-medium'>
                        {feed.lastUpdated}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className='flex flex-col gap-2 pt-2 border-t border-surface-border'>
                {m.urlYr && (
                  <a
                    href={m.urlYr}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center justify-between px-3 py-2 rounded-lg bg-surface-dark border border-surface-border hover:border-brand/50 transition-all no-underline group'
                  >
                    <div className='flex items-center gap-2'>
                      <CloudSun
                        size={14}
                        className='text-slate-500 group-hover:text-brand transition-colors'
                      />
                      <span className='text-[11px] font-bold text-slate-400 group-hover:text-slate-200'>
                        Weather Forecast
                      </span>
                    </div>
                    <span className='text-[9px] font-black text-slate-600 uppercase tracking-tighter'>
                      yr.no
                    </span>
                  </a>
                )}
                {m.urlOther && (
                  <a
                    href={m.urlOther}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-2.5 px-3 py-1.5 text-[11px] font-bold text-slate-500 hover:text-brand transition-colors no-underline group'
                  >
                    <ExternalLink
                      size={14}
                      className='text-slate-600 group-hover:text-brand transition-colors'
                    />
                    Official Source
                  </a>
                )}
              </div>
            </div>
          </Popup>
        </Marker>
      );
    }

    if (isHtmlMarker(m)) {
      return (
        <Marker
          icon={m.rock ? rockIcon : markerBlueIcon}
          position={position}
          key={['html', lat, lng].join('/')}
          ref={(ref) => {
            markerRefs.current[m.id] = ref;
          }}
        >
          <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
            {labelText}
          </Tooltip>
          <Popup closeButton={false}>
            <div className='text-left py-1 text-slate-200'>{m.html}</div>
          </Popup>
        </Marker>
      );
    }

    if (isLabelMarker(m)) {
      return (
        <Marker
          icon={markerBlueIcon}
          position={position}
          key={['label', m.label, lat, lng].join('/')}
          eventHandlers={{
            click: () => addEventHandlers && navigate(m.url),
          }}
          draggable={false}
        >
          <Tooltip opacity={opacity} permanent className='buldreinfo-tooltip-compact'>
            {labelText}
          </Tooltip>
        </Marker>
      );
    }

    return (
      <Marker
        icon={markerRedIcon}
        position={position}
        key={['red', lat, lng].join('/')}
        eventHandlers={{
          click: () => addEventHandlers && m.url && navigate(m.url),
        }}
        draggable={false}
      />
    );
  });
}
