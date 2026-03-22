import { useMeta } from './common/meta/context';
import { Shield, ChevronRight } from 'lucide-react';

const PrivacyPolicy = () => {
  const meta = useMeta();

  return (
    <div className='max-w-container mx-auto px-4 py-6 space-y-6 text-left'>
      <title>{`Privacy Policy | ${meta?.title}`}</title>
      <meta name='description' content='Privacy Policy' />

      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-surface-border pb-4'>
        <nav className='flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-500'>
          <span className='uppercase'>Navigation</span>
          <ChevronRight size={12} className='opacity-20' />
          <div className='flex items-center gap-1.5 text-white'>
            <Shield size={14} className='text-brand' />
            <span className='uppercase'>Privacy Policy</span>
            <span className='text-slate-500 font-mono normal-case hidden sm:inline'>
              (Non-profit site)
            </span>
          </div>
        </nav>
      </div>

      <div className='bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm p-6 sm:p-8'>
        <div className='max-w-3xl space-y-10 text-slate-300'>
          <div className='space-y-2'>
            <p className='text-lg font-medium text-white leading-relaxed'>
              This is a non-profit site. We publish your name but we keep your email address
              private. We do not send spam.
            </p>
          </div>

          <div className='space-y-8'>
            <section className='space-y-3'>
              <h3 className='text-sm font-black uppercase tracking-widest text-white flex items-center gap-3'>
                <span className='flex items-center justify-center w-6 h-6 rounded bg-brand/10 text-brand'>
                  1
                </span>
                Introduction
              </h3>
              <ul className='list-disc list-outside ml-10 space-y-2 text-sm leading-relaxed'>
                <li>We are committed to safeguarding the privacy of our website visitors.</li>
                <li>
                  We use cookies on our website. These are not strictly necessary, but will give the
                  users a better experience by remembering user settings.
                </li>
              </ul>
            </section>

            <section className='space-y-3'>
              <h3 className='text-sm font-black uppercase tracking-widest text-white flex items-center gap-3'>
                <span className='flex items-center justify-center w-6 h-6 rounded bg-brand/10 text-brand'>
                  2
                </span>
                How we use your personal data
              </h3>
              <ul className='list-disc list-outside ml-10 space-y-2 text-sm leading-relaxed'>
                <li>
                  We collect and store your data when you create an account. The data we save is
                  your name, email address and profile picture (from login via third party such as
                  Facebook or Google).
                </li>
                <li>
                  Data you choose to save, such as routes/boulders climbed, and images, can at any
                  time be deleted from your profile page.
                </li>
                <li>
                  The data you choose to save will increase the quality of the climbing guide, and
                  help other users to choose route/boulder based on logged climbs.
                </li>
                <li>
                  Your personal data will never be passed on to a third party. This page is a
                  non-profit site, by the climbing community, for the climbing community.
                </li>
              </ul>
            </section>

            <section className='space-y-3'>
              <h3 className='text-sm font-black uppercase tracking-widest text-white flex items-center gap-3'>
                <span className='flex items-center justify-center w-6 h-6 rounded bg-brand/10 text-brand'>
                  3
                </span>
                Personal data of children
              </h3>
              <ul className='list-disc list-outside ml-10 space-y-2 text-sm leading-relaxed'>
                <li>Our website and services are targeted at persons over the age of 13.</li>
                <li>
                  If we have a reason to believe that we hold personal data of a person under that
                  age in our database, we will delete that personal data.
                </li>
              </ul>
            </section>

            <section className='space-y-3'>
              <h3 className='text-sm font-black uppercase tracking-widest text-white flex items-center gap-3'>
                <span className='flex items-center justify-center w-6 h-6 rounded bg-brand/10 text-brand'>
                  4
                </span>
                Deleting personal data
              </h3>
              <ul className='list-disc list-outside ml-10 space-y-2 text-sm leading-relaxed'>
                <li>
                  Most of your personal data can be deleted on your profile page after you log in.
                </li>
                <li>
                  If you need help, or want to delete data someone else uploaded, please contact
                  Jostein Øygarden on e-mail{' '}
                  <a
                    href='mailto:jostein.oygarden@gmail.com'
                    className='text-brand hover:text-white transition-colors underline underline-offset-4 decoration-brand/30 hover:decoration-brand'
                  >
                    jostein.oygarden@gmail.com
                  </a>{' '}
                  with the data you want to delete.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
