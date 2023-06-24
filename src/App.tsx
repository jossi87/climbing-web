import { Container } from "semantic-ui-react";
import Header from "./components/Header";
import AppRoutes from "./components/AppRoutes";
import Footer from "./components/Footer";
import { MetaProvider } from "./components/common/meta";

const App = () => {
  return (
    <MetaProvider>
      <div style={{ background: "#F5F5F5" }}>
        <Header />
        <Container style={{ marginTop: "1em" }}>
          <AppRoutes />
        </Container>
        <Footer />
      </div>
    </MetaProvider>
  );
};

export default App;
