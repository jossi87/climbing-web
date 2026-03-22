import { useMeta } from './common/meta/context';
import { Heart, ChevronRight } from 'lucide-react';

const Donations = () => {
  const meta = useMeta();

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`Donations | ${meta?.title}`}</title>
      <meta name='description' content='Donations' />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <Heart size={14} className='text-brand' />
            <span className='uppercase'>Donations</span>
            <span className='text-slate-500 font-mono normal-case'>(Support the site)</span>
          </div>
        </nav>
      </div>

      <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm p-6 sm:p-8'>
        <div className='max-w-2xl space-y-6 text-slate-300 leading-relaxed'>
          <p className='text-lg font-medium text-white'>
            This is a nonprofit website created by climbers, for climbers.
          </p>

          <p>
            The local climbing club{' '}
            <a
              href='https://brv.no'
              rel='noreferrer noopener'
              target='_blank'
              className='text-brand hover:text-white transition-colors underline underline-offset-4 decoration-brand/30 hover:decoration-brand'
            >
              BRV (Bratte Rogalands Venner)
            </a>{' '}
            pays all monthly operating expenses (server and domains). By the end of the year, these
            costs are split between the climbing clubs who use these services.
          </p>

          <p>
            You can help out by donating a gift{' '}
            <a
              href='https://shop.tpgo.no/#/?countryCode=NO&companyIdent=986175830'
              rel='noreferrer noopener'
              target='_blank'
              className='text-brand hover:text-white transition-colors underline underline-offset-4 decoration-brand/30 hover:decoration-brand font-bold'
            >
              here
            </a>{' '}
            (see &quot;Støtte nettfører&quot;), or joining your local climbing club (e.g.{' '}
            <a
              href='https://brv.no/om-brv/medlemskap/'
              rel='noreferrer noopener'
              target='_blank'
              className='text-brand hover:text-white transition-colors underline underline-offset-4 decoration-brand/30 hover:decoration-brand'
            >
              BRV
            </a>
            ).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Donations;
