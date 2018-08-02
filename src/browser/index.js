import React from 'react';
import { hydrate } from 'react-dom';
import { CookiesProvider } from 'react-cookie';
import App from '../shared/app';
import { BrowserRouter } from 'react-router-dom';

hydrate(
  <CookiesProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </CookiesProvider>,
  document.getElementById('app')
);
