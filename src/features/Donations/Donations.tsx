import { useMeta } from '../../shared/components/Meta/context';
import { Heart } from 'lucide-react';
import { Card, SectionHeader, TextLink } from '../../shared/ui';

const Donations = () => {
  const meta = useMeta();

  return (
    <div className='w-full'>
      <title>{`Donations | ${meta?.title}`}</title>
      <meta name='description' content='Donations' />

      <Card>
        <SectionHeader title='Donations' icon={Heart} subheader='Support the site' />
        <div className='space-y-4'>
          <p className='type-body'>This is a nonprofit website created by climbers, for climbers.</p>
          <p className='type-body'>
            The local climbing club <TextLink href='https://brv.no'>BRV (Bratte Rogalands Venner)</TextLink> pays all
            monthly operating expenses (server costs). By the end of the year, these costs are split between the
            climbing clubs that use these services.
          </p>
          <p className='type-body'>
            You can help out by donating a gift via{' '}
            <TextLink href='https://shop.tpgo.no/#/?countryCode=NO&companyIdent=986175830'>TPGO</TextLink> (see
            &quot;Støtte nettfører&quot;).
          </p>
          <p className='type-body'>
            You can also support by joining your local climbing club, for example{' '}
            <TextLink href='https://brv.no/om-brv/medlemskap/'>BRV membership</TextLink>.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Donations;
