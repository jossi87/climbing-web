import AppRoutes from './components/AppRoutes';
import { MetaProvider } from './components/common/meta';
import Header from './components/Header';
import Footer from './components/Footer';
import { Suspense } from 'react';
import { Loading } from './components/ui/StatusWidgets';

const App = () => {
  return (
    <MetaProvider>
      <div className='flex flex-col min-h-screen bg-surface-dark text-slate-400 antialiased font-sans'>
        <Header />
        <main className='grow w-full max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10'>
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
