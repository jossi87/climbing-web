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

type CameraMarker = {
  coordinates: components['schemas']['Coordinates'];
  label: string;
  isCamera: true;
  name: string;
  lastUpdated: string;
  urlStillImage: string;
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
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-2 px-3 py-2 bg-brand hover:bg-brand/90 text-white rounded-md text-xs font-bold transition-colors no-underline shadow-sm'
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
          <Popup closeButton={false}>
            <div className='space-y-2 text-left min-w-45'>
              <div className='flex flex-col'>
                <span className='text-sm font-bold text-slate-800 leading-tight'>{m.name}</span>
                {m.lastUpdated && (
                  <span className='text-[10px] text-slate-500 italic'>
                    Updated: {m.lastUpdated}
                  </span>
                )}
              </div>

              <a
                href={m.urlStillImage}
                target='_blank'
                rel='noreferrer'
                className='block overflow-hidden rounded border border-slate-200 hover:border-brand transition-colors'
              >
                <img
                  src={m.urlStillImage}
                  alt={m.name}
                  className='w-full h-auto block'
                  loading='lazy'
                />
              </a>

              <div className='flex flex-col gap-1.5 pt-1'>
                {m.urlYr && (
                  <a
                    href={m.urlYr}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-brand transition-colors no-underline'
                  >
                    <CloudSun size={14} className='text-brand' /> yr.no forecast
                  </a>
                )}
                {m.urlOther && (
                  <a
                    href={m.urlOther}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-2 text-[11px] font-bold text-slate-600 hover:text-brand transition-colors no-underline'
                  >
                    <ExternalLink size={14} className='text-brand' /> External Link
                  </a>
                )}
              </div>
              <p className='text-[9px] text-slate-400 text-center italic mt-1 border-t pt-2'>
                Click image for full size
              </p>
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
            <div className='text-left py-1'>{m.html}</div>
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
