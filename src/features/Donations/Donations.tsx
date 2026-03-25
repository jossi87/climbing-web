import { useMeta } from '../../shared/components/Meta/context';
import { Heart, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { designContract } from '../../design/contract';

const Donations = () => {
  const meta = useMeta();

  return (
    <div className={designContract.layout.pageShell}>
      <title>{`Donations | ${meta?.title}`}</title>
      <meta name='description' content='Donations' />

      <div className={designContract.layout.pageHeaderRow}>
        <nav className={designContract.layout.breadcrumb}>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='type-small flex items-center gap-1.5'>
            <Heart size={14} className='text-brand' />
            <span className='uppercase'>Donations</span>
            <span className='font-mono text-slate-500 normal-case'>(Support the site)</span>
          </div>
        </nav>
      </div>

      <div className={cn(designContract.surfaces.card, 'overflow-hidden p-6 sm:p-8')}>
        <div className='max-w-2xl space-y-6 leading-relaxed text-slate-300'>
          <p className='type-h2'>This is a nonprofit website created by climbers, for climbers.</p>

          <p>
            The local climbing club{' '}
            <a
              href='https://brv.no'
              rel='noreferrer noopener'
              target='_blank'
              className='text-brand decoration-brand/30 hover:decoration-brand underline underline-offset-4 transition-colors'
            >
              BRV (Bratte Rogalands Venner)
            </a>{' '}
            pays all monthly operating expenses (server and domains). By the end of the year, these costs are split
            between the climbing clubs who use these services.
          </p>

          <p>
            You can help out by donating a gift{' '}
            <a
              href='https://shop.tpgo.no/#/?countryCode=NO&companyIdent=986175830'
              rel='noreferrer noopener'
              target='_blank'
              className='text-brand decoration-brand/30 hover:decoration-brand font-bold underline underline-offset-4 transition-colors'
            >
              here
            </a>{' '}
            (see &quot;Støtte nettfører&quot;), or joining your local climbing club (e.g.{' '}
            <a
              href='https://brv.no/om-brv/medlemskap/'
              rel='noreferrer noopener'
              target='_blank'
              className='text-brand decoration-brand/30 hover:decoration-brand underline underline-offset-4 transition-colors'
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
