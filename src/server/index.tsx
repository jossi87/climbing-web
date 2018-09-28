import express from "express";
import cors from "cors";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, matchPath } from "react-router-dom";
import serialize from "serialize-javascript";
import { CookiesProvider } from 'react-cookie';
import MetaTagsServer from 'react-meta-tags/server';
import { MetaTagsContext } from 'react-meta-tags';
import App from '../shared/app';
import routes from '../shared/routes';

const app = express();
const cookiesMiddleware = require('universal-cookie-express')

app.use(cors());
app.use(cookiesMiddleware());
app.use(express.static("build"));

app.get("*", (req: any, res: any, next) => {
  const metaTagsInstance = MetaTagsServer();
  (global as any).myOrigin = req.headers.host==='localhost:3000'? "http://localhost:3000" : "https://" + req.headers.host;
  // @ts-ignore
  const activeRoute = routes.find((route) => matchPath(req.url, route)) || {};

  const accessToken = req.universalCookies.get('access_token');
  const promise = activeRoute.fetchInitialData
    ? activeRoute.fetchInitialData(accessToken, req.path)
    : Promise.resolve()

  promise.then((data) => {
    const context: any = { data }
    const markup = renderToString(
      <CookiesProvider cookies={req.universalCookies} allCookies={null}>
        <MetaTagsContext extract={metaTagsInstance.extract}>
          <StaticRouter location={req.url} context={context}>
            <App />
          </StaticRouter>
        </MetaTagsContext>
      </CookiesProvider>
    )
    const meta = metaTagsInstance.renderToString();

    const response = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          ${meta}
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="icon" href="/favicon.ico">
          <meta name="author" content="Jostein Øygarden">
          <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
          <link rel="stylesheet" type="text/css" href="/css/image-gallery.css">
          <link rel="stylesheet" type="text/css" href="/css/leaflet.css">
          <link rel="stylesheet" type="text/css" href="/css/buldreinfo.css">
          <script async src="/js/bundle.js" defer></script>
          <script>window.__INITIAL_METADATA__ = ${serialize(data? data.metadata : null)}</script>
          <script>window.__INITIAL_DATA__ = ${serialize(data)}</script>
        </head>

        <body>
          <div id="app">${markup}</div>
        </body>
      </html>
    `;
    if (activeRoute.status) {
      res.status(activeRoute.status).send(response);
    } else {
      res.send(response);
    }
  }).catch((error)=>console.warn(error))
});

app.listen(3000, () => {
  console.log(`Server is listening on port: 3000`)
})
