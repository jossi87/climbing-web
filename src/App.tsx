import { lazy, Suspense } from 'react';
import { Container } from 'semantic-ui-react';
import AppRoutes from './components/AppRoutes';
import { MetaProvider } from './components/common/meta';

const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));

const App = () => {
  return (
    <MetaProvider>
      <div
        style={{
          background: '#F5F5F5',
          minHeight: '100vh',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        <Suspense fallback={<div style={{ height: '60px', background: 'black' }} />}>
          <Header />
        </Suspense>

        <Container style={{ marginTop: '1em', minHeight: '70vh' }}>
          <AppRoutes />
        </Container>

        <Suspense fallback={<div style={{ height: '200px' }} />}>
          <Footer />
        </Suspense>
      </div>
    </MetaProvider>
  );
};

export default App;
