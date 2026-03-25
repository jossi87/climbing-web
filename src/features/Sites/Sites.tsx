import { useParams, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Leaflet from '../../shared/components/Leaflet/Leaflet';
import { Loading } from '../../shared/ui/StatusWidgets';
import { useMeta } from '../../shared/components/Meta/context';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const Sites = () => {
  const meta = useMeta();
  const { type } = useParams();

  if (!meta || !meta.sites || meta.sites.length === 0) return <Loading />;

  const outlines = meta.sites
    .filter((s) => s.group.toLowerCase() === type)
    .map((s) => ({ url: s.url, label: s.name, outline: s.outline }));

  const siteCount = meta.sites.filter((s) => s.group.toLowerCase() === type).length;
  const description = `${siteCount} ${type === 'bouldering' ? 'bouldering' : type === 'climbing' ? 'rock climbing' : 'ice climbing'} sites`;

  return (
    <div className='max-w-container mx-auto px-4 py-6'>
      <title>{`Sites | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className='mb-6 flex flex-col gap-1 text-left'>
        <div className='flex items-center gap-3'>
          <Globe className='text-slate-400' size={24} />
          <h1 className={cn(designContract.typography.title, 'leading-none')}>Sites</h1>
        </div>
        <p className={cn('ml-9 italic', designContract.typography.meta)}>{description}</p>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='border-surface-border bg-surface-card/50 flex flex-row items-center gap-2 rounded-xl border p-1.5 shadow-sm backdrop-blur-sm'>
          {['bouldering', 'climbing', 'ice'].map((id) => (
            <Link
              key={id}
              to={`/sites/${id}`}
              className={cn(
                'btn-glass h-10 flex-1 justify-center transition-all duration-300',
                type === id ? 'btn-glass-active border-brand/40' : 'border-transparent bg-transparent',
              )}
            >
              {id === 'climbing' ? 'Route climbing' : id}
            </Link>
          ))}
        </div>

        <div className='bg-surface-card border-surface-border relative h-[70vh] overflow-hidden rounded-xl border shadow-sm lg:h-[80vh]'>
          <Leaflet
            autoZoom
            height='100%'
            outlines={outlines}
            defaultCenter={meta.defaultCenter}
            defaultZoom={meta.defaultZoom}
          />
        </div>
      </div>
    </div>
  );
};

export default Sites;
