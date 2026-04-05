import { useParams, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';
import { Card, SectionHeader } from '../../shared/ui';

const Regions = () => {
  const meta = useMeta();
  const { type } = useParams();
  const selectedType = type ?? 'bouldering';

  if (!meta || !meta.sites || meta.sites.length === 0) return <Loading />;

  const outlines = meta.sites
    .filter((s) => s.group.toLowerCase() === selectedType)
    .map((s) => ({ url: s.url, label: s.name, outline: s.outline }));

  const regionCount = meta.sites.filter((s) => s.group.toLowerCase() === selectedType).length;
  const description = `${regionCount} ${
    selectedType === 'bouldering' ? 'bouldering' : selectedType === 'climbing' ? 'rock climbing' : 'ice climbing'
  } regions`;

  return (
    <div className='w-full min-w-0'>
      <title>{`Regions | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <Card flush className='min-w-0 border-0 sm:border'>
        <div className='p-4 pb-3 sm:p-5 sm:pb-4'>
          <SectionHeader title='Regions' icon={Globe} subheader={description} />

          <div className='flex items-center gap-1.5 overflow-x-auto pb-1'>
            {['bouldering', 'climbing', 'ice'].map((id) => (
              <Link
                key={id}
                to={`/regions/${id}`}
                className={cn(
                  'inline-flex h-8 shrink-0 items-center justify-center rounded-full px-3 text-[11px] leading-none font-medium transition-colors sm:text-[12px]',
                  selectedType === id
                    ? designContract.surfaces.segmentActiveBrandBorder
                    : designContract.surfaces.segmentIdleRaised,
                )}
              >
                {id === 'bouldering' ? 'Bouldering' : id === 'climbing' ? 'Route Climbing' : 'Ice Climbing'}
              </Link>
            ))}
          </div>
        </div>
        <div className='border-surface-border/60 border-t'>
          <div className='relative h-[68vh] overflow-hidden sm:h-[74vh] lg:h-[80vh]'>
            <Leaflet
              autoZoom
              height='100%'
              outlines={outlines}
              defaultCenter={meta.defaultCenter}
              defaultZoom={meta.defaultZoom}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Regions;
