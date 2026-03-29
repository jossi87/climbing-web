import AppRoutes from './routes/AppRoutes';
import { MetaProvider } from './shared/components/Meta';
import Header from './shared/layout/Header';
import Footer from './shared/layout/Footer';
import { Suspense } from 'react';
import { Loading } from './shared/ui/StatusWidgets';

const App = () => {
  return (
    <MetaProvider>
      <div className='bg-surface-dark flex min-h-screen flex-col font-sans text-slate-300 antialiased'>
        <Header />
        <main className='max-w-container mx-auto flex w-full min-w-0 grow flex-col px-4 pt-0 pb-10 sm:px-6 sm:pt-0 sm:pb-10 lg:px-8 lg:pt-6 lg:pb-6 xl:pt-8 xl:pb-8'>
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
