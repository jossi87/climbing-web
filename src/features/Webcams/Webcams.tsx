import { useParams } from 'react-router-dom';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta';
import { useData } from '../../api';
import type { Success } from '../../@types/buldreinfo';
import { type ComponentProps } from 'react';
import { Camera } from 'lucide-react';
import { Card, SectionHeader } from '../../shared/ui';

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

const Webcams = () => {
  const meta = useMeta();
  const { data } = useData<Success<'getCameras'>>(`/webcams`);
  const { json } = useParams();

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
        <div className='h-[56vh] min-h-[320px] sm:h-[66vh] lg:h-[72vh]'>
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
      </Card>
    </>
  );
};

export default Webcams;
