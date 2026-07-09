import { useState, useCallback, type ComponentProps } from 'react';
import { useParams } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta';
import { useData } from '../../api';
import type { Success } from '../../@types/buldreinfo';
import { Camera, CloudSun, ExternalLink, X } from 'lucide-react';
import type { MarkerDef } from '../../shared/components/Leaflet/markers';
import { Card, SectionHeader } from '../../shared/ui';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

type WebcamGroup = {
  coordinates: { latitude: number; longitude: number };
  isCamera: boolean;
  name: string;
  urlYr?: string;
  urlOther?: string;
  feeds: {
    id: string;
    urlStillImage: string;
    lastUpdated: string;
  }[];
};

const CameraPanel = ({ camera, onClose }: { camera: WebcamGroup; onClose: () => void }) => {
  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {/* Header with name, YR link, and close button */}
      <div className='border-surface-border flex items-center justify-between gap-2 border-b px-3 py-2'>
        <div className='flex min-w-0 items-center gap-1.5'>
          <Camera size={14} className='shrink-0 text-slate-400' />
          <h2 className='truncate text-sm font-bold text-slate-100'>{camera.name}</h2>
        </div>
        <div className='flex shrink-0 items-center gap-1'>
          {camera.urlYr && (
            <a
              href={camera.urlYr}
              target='_blank'
              rel='noreferrer'
              className='hover:bg-surface-hover inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-bold text-slate-500 no-underline transition-colors hover:text-slate-200'
              title='Weather forecast on yr.no'
            >
              <CloudSun size={12} />
              <span className='tracking-tighter uppercase'>yr.no</span>
            </a>
          )}
          <button
            type='button'
            onClick={onClose}
            className='hover:bg-surface-hover inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:text-slate-200'
            aria-label='Close camera panel'
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Feeds */}
      <div className='flex-1 space-y-3 overflow-y-auto p-3'>
        {camera.feeds.map((feed) => (
          <div key={feed.id} className='space-y-1'>
            <a
              href={feed.urlStillImage}
              target='_blank'
              rel='noreferrer'
              className='border-surface-border bg-surface-dark block overflow-hidden rounded-lg border transition-colors hover:border-white/12'
            >
              <img src={feed.urlStillImage} alt={camera.name} className='block h-auto w-full' loading='lazy' />
            </a>
            <div className='flex items-center justify-end'>
              <span className='text-[11px] font-medium text-slate-500'>{feed.lastUpdated}</span>
            </div>
          </div>
        ))}

        {/* Official source link */}
        {camera.urlOther && (
          <a
            href={camera.urlOther}
            target='_blank'
            rel='noreferrer'
            className='group flex items-center gap-2 px-1 py-1 text-[11px] font-bold text-slate-500 no-underline transition-colors hover:text-slate-200'
          >
            <ExternalLink size={12} className='text-slate-500 transition-colors group-hover:text-slate-400' />
            Official Source
          </a>
        )}
      </div>
    </div>
  );
};

const Webcams = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getCameras'>>(`/webcams`);
  const { json } = useParams();
  const [selectedCamera, setSelectedCamera] = useState<WebcamGroup | null>(null);

  const handleMarkerClick = useCallback((marker: MarkerDef) => {
    if ('isCamera' in marker && marker.isCamera) {
      setSelectedCamera(marker as unknown as WebcamGroup);
    }
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedCamera(null);
  }, []);

  if (!data) {
    return <Loading />;
  }

  const grouped = data
    .filter((c) => c.lat && c.lng && c.name) // Ensure we have the basics
    .reduce(
      (acc, c) => {
        const key = `${c.lat}_${c.lng}`;
        if (!acc[key]) {
          acc[key] = {
            coordinates: {
              latitude: c.lat ?? 0,
              longitude: c.lng ?? 0,
            },
            isCamera: true,
            name: c.name ?? 'Unknown Camera',
            urlYr: c.urlYr,
            urlOther: c.urlOther,
            feeds: [],
          };
        }
        acc[key].feeds.push({
          id: c.id ?? '',
          urlStillImage: c.urlStillImage ?? '',
          lastUpdated: c.lastUpdated ?? '',
        });
        return acc;
      },
      {} as Record<string, WebcamGroup>,
    );

  const markers: ComponentProps<typeof Leaflet>['markers'] = Object.values(grouped);

  let defaultCenter = meta.defaultCenter;
  let defaultZoom = meta.defaultZoom;

  if (json) {
    try {
      const { lat, lng, label } = JSON.parse(json);
      defaultCenter = { lat, lng };
      defaultZoom = 10;
      markers.push({ coordinates: { latitude: lat, longitude: lng }, label });
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      <title>{`Webcams | ${meta?.title}`}</title>
      <meta name='description' content='Live webcams and camera feeds in climbing areas' />

      <Card flush className='min-w-0 overflow-hidden border-0'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <SectionHeader
            title='Webcams'
            icon={Camera}
            subheader={`${data.length} active feeds · ${markers.length} locations`}
          />
        </div>

        {/* 
          Split layout: map on top, camera panel below when selected.
          On mobile (default): 60% map / 40% panel when camera selected.
          On desktop (lg+): 50% / 50% split.
        */}
        <div className={cn('flex flex-col', selectedCamera ? 'lg:flex-row' : '')}>
          {/* Map */}
          <div
            className={cn(
              'min-h-[320px] transition-all duration-300',
              selectedCamera ? 'h-[40vh] lg:h-[65vh] lg:w-1/2' : 'h-[56vh] sm:h-[66vh] lg:h-[72vh]',
            )}
          >
            <Leaflet
              height='100%'
              autoZoom={false}
              defaultCenter={defaultCenter}
              defaultZoom={defaultZoom}
              markers={markers}
              showSatelliteImage={false}
              clusterMarkers={false}
              flyToId={null}
              onMarkerClick={handleMarkerClick}
              activeMarkerPosition={
                selectedCamera ? [selectedCamera.coordinates.latitude, selectedCamera.coordinates.longitude] : null
              }
            />
          </div>

          {/* Camera Panel (shown below map on mobile, beside on desktop) */}
          {selectedCamera && (
            <div
              className={cn(
                'border-surface-border bg-surface-card h-[40vh] border-t lg:h-[65vh] lg:w-1/2 lg:border-t-0 lg:border-l',
                designContract.typography.body,
              )}
            >
              <CameraPanel camera={selectedCamera} onClose={handleClosePanel} />
            </div>
          )}
        </div>
      </Card>
    </>
  );
};

export default Webcams;
