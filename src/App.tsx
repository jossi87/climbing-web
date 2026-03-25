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
        <main className='max-w-container mx-auto w-full grow px-4 py-6 sm:px-6 sm:py-8 lg:px-8'>
          <Suspense fallback={<Loading />}>
            <AppRoutes />
          </Suspense>
        </main>
        <Footer />
      </div>
    </MetaProvider>
  );
};

export default App;
