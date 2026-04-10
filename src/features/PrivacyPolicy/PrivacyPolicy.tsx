import { useMeta } from '../../shared/components/Meta/context';
import { FileText, Shield } from 'lucide-react';
import {
  BRV_PLATFORM_AGREEMENT_DATE_LABEL,
  BRV_PLATFORM_AGREEMENT_PDF,
  BRV_WEBSITE_URL,
} from '../../constants/legalLinks';
import { Card, SectionHeader, TextLink } from '../../shared/ui';

const PrivacyPolicy = () => {
  const meta = useMeta();

  return (
    <>
      <title>{`Privacy Policy | ${meta?.title}`}</title>
      <meta name='description' content='Privacy Policy' />
      <Card>
        <SectionHeader title='Privacy Policy' icon={Shield} subheader='How we protect your data' />
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
                We store information in your browser using local storage and session storage (not cookies)—for example
                to keep you signed in, remember your preferences, and cache some content. We also use a third-party
                error-monitoring service (Sentry) to help diagnose and fix technical issues.
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
              <li className='type-body'>
                We do not sell personal data or use it for advertising. Trusted providers process data on our behalf
                only where needed to run the service (for example sign-in and error monitoring), and only as required
                for that purpose.
              </li>
            </ul>
          </section>

          <section className='space-y-3'>
            <h3 className='type-label'>Regional agreements</h3>
            <ul className='list-disc space-y-2 pl-5'>
              <li className='type-body'>
                For Rogaland, there is a signed agreement with <TextLink href={BRV_WEBSITE_URL}>BRV</TextLink> (the
                local climbing club) from {BRV_PLATFORM_AGREEMENT_DATE_LABEL}. It covers who owns the data, how the
                platform may be used, and related terms. Legally it applies to Rogaland; we still show this section on
                every regional guide so the terms stay easy to find:{' '}
                <TextLink href={BRV_PLATFORM_AGREEMENT_PDF} title='Agreement (PDF)'>
                  <span className='inline-flex items-center gap-1'>
                    Read the PDF
                    <FileText className='h-3.5 w-3.5 shrink-0 opacity-90' strokeWidth={2} aria-hidden />
                  </span>
                </TextLink>
                {'.'}
              </li>
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
