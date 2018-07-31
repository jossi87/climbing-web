import express from "express";
import cors from "cors";
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter, matchPath } from "react-router-dom";
import serialize from "serialize-javascript";
import App from '../shared/App';
import routes from '../shared/routes';
import { getMeta } from '../shared/api';

const app = express();

app.use(cors());
app.use(express.static("public"));

app.get("*", (req, res, next) => {
  const activeRoute = routes.find((route) => matchPath(req.url, route)) || {};

  const promise = activeRoute.fetchInitialData
    ? activeRoute.fetchInitialData(req.path)
    : Promise.resolve()

  getMeta().then((meta) => {
    promise.then((data) => {
      const context = { data, meta }
      const markup = renderToString(
        <StaticRouter location={req.url} context={context}>
          <App />
        </StaticRouter>
      )

      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" href="/favicon.ico">
            <meta name="author" content="Jostein Øygarden">
            <link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
            <link rel="stylesheet" type="text/css" href="/css/react-input-calendar.css">
            <link rel="stylesheet" type="text/css" href="/css/image-gallery.css">
            <link rel="stylesheet" type="text/css" href="/css/react-bootstrap-table.css">
            <link rel="stylesheet" type="text/css" href="/css/buldreinfo.css">
            <script src="/bundle.js" defer></script>
            <script>window.__INITIAL_META__ = ${serialize(meta)}</script>
            <script>window.__INITIAL_DATA__ = ${serialize(data)}</script>
          </head>

          <body>
            <div id="app">${markup}</div>
          </body>
        </html>
      `)
    }).catch((error)=>console.warn(error))
  }).catch(next)
});

app.listen(3000, () => {
  console.log(`Server is listening on port: 3000`)
})
