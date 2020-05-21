export function installServiceWorker () {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported - aborting');
    return;
  }

  var currentVersion = null;

  navigator.serviceWorker.onmessage = function (evt) {
    if (typeof evt.data.version !== 'undefined') {
      if (currentVersion === null) {
        currentVersion = evt.data.version;
      } else {
        var newVersion = evt.data.version;
        var cvParts = currentVersion.split('.');
        var nvParts = newVersion.split('.');

        if (cvParts[0] === nvParts[0]) {
          console.log('Service Worker moved from ' +
                    currentVersion + ' to ' + newVersion);
        } else {
          console.log('Site updated. Refresh to get the latest!');
        }
      }
    }
  };


  navigator.serviceWorker.register('/indirimbo/sw.js').then(function (registration) {
    if (registration.active) {
      registration.active.postMessage('version');
    }

    // We should also start tracking for any updates to the Service Worker.
    registration.onupdatefound = function () {
      console.log('A new version has been found... Installing...');

      // If an update is found the spec says that there is a new Service Worker
      // installing, so we should wait for that to complete then show a
      // notification to the user.
      registration.installing.onstatechange = function () {
        if (this.state === 'installed') {
          return console.log('App updated');
        }

        if (this.state === 'activated') {
          registration.active.postMessage('version');
        }

        console.log('Incoming SW state:', this.state);
      };
    };
  });
}
