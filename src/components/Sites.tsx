import { useParams, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';
import Leaflet from './common/leaflet/leaflet';
import { Loading } from './ui/StatusWidgets';
import { useMeta } from './common/meta/context';
import { cn } from '../lib/utils';

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
    <div className='max-w-container mx-auto px-4 py-8'>
      <title>{`Sites | ${meta?.title}`}</title>
      <meta name='description' content={description} />

      <div className='flex flex-col gap-1 mb-8 text-left'>
        <div className='flex items-center gap-3'>
          <Globe className='text-slate-400' size={24} />
          <h1 className='text-2xl font-bold text-white tracking-tight'>Sites</h1>
        </div>
        <p className='text-slate-400 text-xs ml-9 font-bold uppercase tracking-widest italic'>
          {description}
        </p>
      </div>

      <div className='flex flex-col gap-6'>
        <div className='flex flex-row items-center gap-2 p-1.5 rounded-xl border border-surface-border bg-surface-card/50 shadow-sm backdrop-blur-sm'>
          {['bouldering', 'climbing', 'ice'].map((id) => (
            <Link
              key={id}
              to={`/sites/${id}`}
              className={cn(
                'btn-glass flex-1 justify-center h-10 transition-all duration-300',
                type === id
                  ? 'btn-glass-active border-brand/40 text-white'
                  : 'border-transparent bg-transparent',
              )}
            >
              {id === 'climbing' ? 'Route climbing' : id}
            </Link>
          ))}
        </div>

        <div className='bg-surface-card border border-surface-border rounded-xl shadow-sm h-[70vh] lg:h-[80vh] overflow-hidden relative'>
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
