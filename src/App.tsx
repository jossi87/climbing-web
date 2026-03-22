import AppRoutes from './components/AppRoutes';
import { MetaProvider } from './components/common/meta';
import Header from './components/Header';
import Footer from './components/Footer';

const App = () => {
  return (
    <MetaProvider>
      <div className='flex flex-col min-h-screen bg-surface-dark text-slate-300 antialiased'>
        <Header />
        <main className='grow w-full max-w-container mx-auto px-4 py-6 sm:px-6 lg:px-8'>
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </MetaProvider>
  );
};

export default App;
