import { Container } from 'semantic-ui-react';
import AppRoutes from './components/AppRoutes';
import { MetaProvider } from './components/common/meta';

import Header from './components/Header';
import Footer from './components/Footer';

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
        <Header />
        <Container as='main' style={{ marginTop: '1em', minHeight: '70vh' }}>
          <AppRoutes />
        </Container>
        <Footer />
      </div>
    </MetaProvider>
  );
};

export default App;
