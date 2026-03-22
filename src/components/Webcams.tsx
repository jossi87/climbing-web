import { useParams } from 'react-router-dom';
import Leaflet from './common/leaflet/leaflet';
import { Loading } from './common/widgets/widgets';
import { useMeta } from './common/meta';
import { useData } from '../api';
import type { Success } from '../@types/buldreinfo';
import type { ComponentProps } from 'react';
import { Camera, ChevronRight } from 'lucide-react';

const Webcams = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getCameras'>>(`/webcams`);
  const { json } = useParams();

  if (!data) {
    return <Loading />;
  }

  const markers: ComponentProps<typeof Leaflet>['markers'] = data
    .filter((c) => c.lat !== 0 && c.lng !== 0)
    .map((c) => {
      return {
        coordinates: { latitude: c.lat, longitude: c.lng },
        isCamera: true,
        name: c.name,
        lastUpdated: c.lastUpdated,
        urlStillImage: c.urlStillImage,
        urlYr: c.urlYr,
        urlOther: c.urlOther,
      };
    });

  let defaultCenter = meta.defaultCenter;
  let defaultZoom = meta.defaultZoom;

  if (json) {
    const { lat, lng, label } = JSON.parse(json);
    defaultCenter = { lat, lng };
    defaultZoom = 10;
    markers.push({ coordinates: { latitude: lat, longitude: lng }, label });
  }

  const description = `${markers.length} cameras`;

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`Webcams | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500 uppercase'>
          <span className='text-slate-500'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <Camera size={14} className='text-brand' />
            <span>Webcams</span>
            <span className='text-slate-500 font-mono normal-case'>({description})</span>
          </div>
        </nav>
      </div>

      <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm p-1'>
        <div className='h-[75vh] w-full rounded-xl overflow-hidden'>
          <Leaflet
            height='100%'
            autoZoom={false}
            defaultCenter={defaultCenter}
            defaultZoom={defaultZoom}
            markers={markers}
            showSatelliteImage={false}
            clusterMarkers={false}
            flyToId={null}
          />
        </div>
      </div>
    </div>
  );
};

export default Webcams;
