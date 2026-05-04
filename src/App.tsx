import AppRoutes from './routes/AppRoutes';
import { appShellLightBackdropStripClass } from './design/twInk';
import { MetaProvider } from './shared/components/Meta';
import Header from './shared/layout/Header';
import Footer from './shared/layout/Footer';
import { ThemeSync } from './shared/components/ThemeSync';
import { Suspense } from 'react';
import { Loading } from './shared/ui/StatusWidgets';

const App = () => {
  return (
    <MetaProvider>
      <ThemeSync />
      <div className='bg-surface-dark flex min-h-screen flex-col font-sans text-slate-300 antialiased'>
        <a
          href='#main-content'
          className='focus:border-brand-border focus:bg-surface-card focus:ring-brand-border/80 focus:ring-offset-surface-dark sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:inline-flex focus:rounded-md focus:border focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-slate-100 focus:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none'
        >
          Skip to main content
        </a>
        {/* Light: graphite band under sticky header — `appShellLightBackdropStripClass` in `design/twInk.ts`. */}
        <div aria-hidden className={appShellLightBackdropStripClass} role='presentation' />
        <Header />
        <main
          id='main-content'
          className='max-w-container relative z-[46] mx-auto flex w-full min-w-0 grow flex-col px-4 pt-0 pb-10 sm:px-6 sm:pt-0 sm:pb-10 lg:px-8 lg:pt-4 lg:pb-6 xl:pt-5 xl:pb-8'
        >
          <Suspense
            fallback={
              <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col'>
                <Loading />
              </div>
            }
          >
            <div className='flex min-h-0 w-full min-w-0 flex-1 flex-col'>
              <AppRoutes />
            </div>
          </Suspense>
        </main>
        <Footer />
      </div>
    </MetaProvider>
  );
};

export default App;
