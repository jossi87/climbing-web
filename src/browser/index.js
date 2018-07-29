import React from 'react';
import { hydrate } from 'react-dom';
import App from '../shared/App';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

hydrate(
  <CookiesProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CookiesProvider>,
  document.getElementById('app')
);
