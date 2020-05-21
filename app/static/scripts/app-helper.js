var config = {
   apiKey: "AIzaSyAwU4GOAB5AwqY_xOH9AoA4PhJbQxI2q24",
   authDomain: "first-app-fd6a6.firebaseapp.com",
   databaseURL: "https://first-app-fd6a6.firebaseio.com",
   projectId: "first-app-fd6a6",
   storageBucket: "first-app-fd6a6.appspot.com",
   messagingSenderId: "841302942713"
 };
 firebase.initializeApp(config);

class IshakiroView {
  constructor() {
    this._addEventListeners();
    this._onViewin = this._onViewin.bind(this);
    // console.log(this.book);
    // console.log(this);

  }
  get book (){
    let search = window.location.search;
    if (search.charAt(0) === '?') search = search.slice(1);
    let book = '';
    Array(search.slice('&'))
    .forEach(p=>{
      if (p.split('=')[0]==='book')
        book = p.split('=')[1];
    });
    return book;
  }
  _onViewin (evt){
    // console.log(evt);
    // console.log(evt);
    const book = function(){
      let search = window.location.search;
      if (search.charAt(0) === '?') search = search.slice(1);
      let book = '';
      Array(search.slice('&'))
      .forEach(p=>{
        if (p.split('=')[0]==='book')
          book = p.split('=')[1];
      });
      return book;
    }
    const addSongNumber = function(songNumber){
      let numeroList = document.querySelector('rs-view.visible .numero-list');
      let nuNum = document.createElement('li');
      let numLink = document.createElement('a');
      numLink.href = `/indirimbo/indirimbo?book=${book()}&number=${songNumber}`;
      numLink.innerText = songNumber;
      nuNum.appendChild(numLink);
      numeroList.appendChild(nuNum);
    }
    const SongsDbRef = firebase.database().ref().child(book());//.orderByChild('book').equalTo(this.book);
    SongsDbRef.once('value', snap=>{
      let numeroList = document.querySelector('rs-view.visible .numero-list');
      numeroList.innerHTML = "";
      const songs = snap.val();
      for (let songNumber in songs){
        addSongNumber(songNumber);
      }
    }).then(_=>{
      this._obj._addEventListeners();
    });





  }



  _onclick(evt){
    evt.preventDefault();
    console.log(evt);
    const router = document.querySelector('rs-router');
    router.go(evt.target.href);
  }
  _addEventListeners (){
    this._view = document.querySelector('rs-view[name="IshakiroView"]');
    this._view.addEventListener('view-in', this._onViewin);
    for (let link of document.querySelectorAll('.numero-list a')){
      link.addEventListener('click', this._onclick );
    }
  }
}
class IbitaboView {
  constructor() {
    this._loadBooks().then(books=>{
      for(let key in books){
        this._addSongBook({id:key,name:books[key]})
      }
      this._addEventListeners();
    });
  }
  _loadBooks (){
    const BooksDbRef = firebase.database().ref().child('books');
    return new Promise(function(resolve, reject) {
      BooksDbRef.once('value', snap =>{
        resolve(snap.val());
      });
    });

  }
  _addSongBook (book){
    let bookListView = document.querySelector('.ibitabo-list');
    let bookItem = document.createElement('li');
    let bookLink = document.createElement('a');
    bookLink.href = `/indirimbo/ishakiro?book=${book.id}`;
    bookLink.innerText = book.name;
    bookItem.appendChild(bookLink);
    bookListView.appendChild(bookItem);

  }

  _onclick(evt){
    evt.preventDefault();

    const router = document.querySelector('rs-router');
    router.go(evt.target.href);
  }
  _addEventListeners (){
    for (let link of document.querySelectorAll('.ibitabo-list a')){
      link.addEventListener('click', this._onclick );
    }
  }
}

class IndirimboView {
  constructor() {
    this._addEventListeners();
  }


  _onViewin (evt){
    // _loadBooks().then(books=>{
    //   console.log(books);
    // });

    const book = function(paramName){
      let search = window.location.search;
      if (search.charAt(0) === '?') search = search.slice(1);
      let param = '';
      Array(search.split('&'))
      .forEach(p=>{
        for(let pn of p ){
          if(pn.split('=')[0] == paramName){
            param = pn.split('=')[1];
          }
        }

      });
      return param;
    }
    let getSong = function(ref){
      return new Promise(function(resolve, reject) {
        const SongsDbRef = firebase.database().ref().child(ref);
          SongsDbRef.once('value', snap =>{
            resolve( snap.val() );
          });
      });
    }
    const addIgitero = function(igitero){
      let indirimboElt = document.querySelector('div.ibitero');
      let igiteroElt = document.createElement('p');
      igiteroElt.innerText=igitero;
     indirimboElt.appendChild(igiteroElt);
    }
    const ref =`${book('book')}/${book('number')}`;
    getSong(ref).then(song=>{
      document.querySelector('.umutwe').innerText = `No: ${book('number')}`;
      let indirimboElt = document.querySelector('div.ibitero');
      indirimboElt.innerHTML="";
      for(let igitero of song ){
        if(!igitero) continue;
        addIgitero(igitero);
      }
    });



  }
  _addEventListeners (){
    this._view = document.querySelector('rs-view[name="IndirimboView"]');
    this._view.addEventListener('view-in', this._onViewin);
  }
}
