# client-renderer

This is a dynamic client-side site rendering with a server-side fallback in the case of noscript

## Docs

Any url that does not match a static file found in `docs/` will be served the `docs/index.html`.  This file will load the corresponding jsonp layout config from `docs/data`.

For the requests `/abc`, `/abc/`, or `/abc.html`, the layout found in `docs/data/abc.jsonp` will be used.

## Rendering

The layout jsonp is used by `docs/renderer.js` to load the necessary rendering component functions from `docs/components` and execute them on the layout components listed in the config.

## Server-Side

There is a private phantomjs server running in the image that will be used if `rendered=true` query parameter is provided.

If nodejs is used for the public proxy (see below), phantomjs can be configured to run as a forked process instead of a server (set environment variable `PHANTOMJS` to `process` or `server`; default is server).  However, there is a startup delay for phantomjs processes which more than defeats the benefit of a dedicated process.

## Proxy

The public server is either nodejs or nginx (configured with environment variable `PROXY` set to either `nginx` or `nodejs`; default is nodejs).  Currently, there is a header or connection setting that is causing server-side rendering connections from nginx to close and fail.
