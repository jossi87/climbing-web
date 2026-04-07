import { useMeta } from '../../shared/components/Meta/context';
import { Shield } from 'lucide-react';
import { Card, SectionHeader, TextLink } from '../../shared/ui';

const PrivacyPolicy = () => {
  const meta = useMeta();

  return (
    <>
      <title>{`Privacy Policy | ${meta?.title}`}</title>
      <meta name='description' content='Privacy Policy' />
      <Card>
        <SectionHeader title='Privacy Policy' icon={Shield} subheader='How we collect, use and protect your data' />
        <div className='space-y-8 text-slate-300'>
          <p className='type-body'>
            This is a non-profit site. Your name may be visible, but your email stays private and is never used for
            spam.
          </p>

          <section className='space-y-3'>
            <h3 className='type-label'>Introduction</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>We safeguard the privacy of website visitors.</li>
              <li className='type-body'>
                We use cookies to improve the experience, for example by remembering user settings.
              </li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>How we use personal data</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>
                When you create an account, we store your name, email, and profile picture from your login provider.
              </li>
              <li className='type-body'>
                Data you choose to save, such as climbed routes/boulders and uploaded images, can be deleted from your
                profile page.
              </li>
              <li className='type-body'>Saved data helps improve guide quality and helps other users choose climbs.</li>
              <li className='type-body'>Personal data is never shared with third parties.</li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>Children</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>The service is intended for people over 13 years old.</li>
              <li className='type-body'>If we identify personal data for someone under that age, we delete it.</li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>Deleting personal data</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>Most personal data can be deleted from your profile page after login.</li>
              <li className='type-body'>
                If you need help, contact{' '}
                <TextLink href='mailto:jostein.oygarden@gmail.com'>jostein.oygarden@gmail.com</TextLink>.
              </li>
            </ul>
          </section>
        </div>
      </Card>
    </>
  );
};

export default PrivacyPolicy;
