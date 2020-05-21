'use strict';

class Song{

}
const DB_VERSION = 3;
class songsDb {
  constructor() {
    const request = indexedDB.open('indirimbo-db', DB_VERSION);

    this.dbPromise = new Promise((resolve, reject) => {
      this.dbResolve = resolve;
      this.dbReject = reject;

      request.onerror = (reason) => this.dbReject(reason);
      request.onupgradeneeded = (event) => this.createObjectStore(event);
      request.onsuccess = (event) => this.dbOpened(request);

    });
  }
  getSong(id){
    const promise = new Promise((resolve, reject) => {
      this.dbPromise.then((db) => {
        const transaction = db.transaction(['songs'], 'readonly');
        const get = transaction.objectStore('songs').get(id);

        get.onsuccess = (event) => {
          resolve(get.result);
        };
        get.onerror = reject;
      }).catch(reject);
    });

    return promise;
  }
  addSong (song){
    const promise = new Promise((resolve, reject) => {
      this.dbPromise.then((db) => {
        const transaction = db.transaction(['songs'], 'readwrite');
        const put = transaction.objectStore('songs').put(song);

        put.onsuccess = (event) => resolve(put.result);
        put.onerror = reject;
      }).catch(reject);
    });

    return promise;
  }

  dbOpened (request){
    this.dbResolve(request.result);
    this.dbPromise.then((db) => {
      db.onerror = (reason) => this.error(reason);
    });
  }

  createObjectStore (event){
    const request = event.target;
    const db = request.result;
    console.log("Creating objectStores");
    console.log('Older version', event.oldVersion);
    if (event.oldVersion < DB_VERSION) {
      console.warn('Updtating objectStores');
      if (event.oldVersion !==0 ) {
        db.deleteObjectStore('songs');
        db.deleteObjectStore('books');
      }
      db.createObjectStore('songs', {keyPath: 'songId'});
      db.createObjectStore('books', {autoIncrement: true});
    }
  }

  error (reason){
    console.log(reason);
  }


}


new songsDb().getSong('gush2').then(song=>{
  console.log(song.indirimboYose.indexOf('\n'));
  console.log(song.indirimboYose.substring(0, song.indirimboYose.indexOf('\n') ));
}).catch(err=>{
  console.log('Error retreiving data', err);
});
