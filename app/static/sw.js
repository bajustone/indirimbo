'use strict'

const NAME = 'INDIRIMBO';
const VERSION = 0;

self.oninstall = _ => {
  self.skipWaiting();
};

self.onactivate = _ => {
  self.clients.claim();
};

self.onfetch = evt => {
  // TODO: First check if the request is in cache
  evt.respondWith(fetch(evt.request));
  // TODO: cache the contents from the server
};
