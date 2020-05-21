/*!
 * Build: 2020-05-21T20:18:43.218Z
 */
function installServiceWorker () {
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
    registration.onupdatefound = function () {
      console.log('A new version has been found... Installing...');
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

class RSRouter extends HTMLElement {
  _onChanged (){
    const path = window.location.pathname;
    const routes = Array.from(this._routes.keys());
    const route = routes.find(r => r.test(path));
    if (!route) return;
    const data = route.exec(path);
    this._newView = this._routes.get(route);
    if (this.isStillTransitioningView) return Promise.resolve();
    this.isStillTransitioningView = true;
    let outViewPromise = Promise.resolve();
    if (this._currentView) {
      if (this._currentView === this._newView) {
        this.isStillTransitioningView = false;
        return this._currentView.update(data);
      }
      outViewPromise = this._currentView.out(data);
    }
    return outViewPromise
      .then( _ => {
        this._currentView = this._newView;
        this.isStillTransitioningView = false;
        this._newView.in(data).then(_=>{
        });
      }).then(_=>{
        if(!this._currentView._isRemote) this._currentView._init();
      });
  }
  go (url){
    window.history.pushState(null,null,url);
    this._onChanged();
  }
  _clearRoutes (){
    this._routes.clear();
  }
  _createRoute (route, view){
    if (this._routes.has(route)) console.warn(`route already exist ${route}`);
    this._routes.set(route,view);
  }
  _createRoutes (){
    Array.from(document.querySelectorAll('rs-view'))
    .forEach(view=>{
      if (!view.route) return;
      this._createRoute(new RegExp (view.route, 'i'), view);
    });
  }
  _createViews (){
    return Promise.resolve();
  }
  constructor(){
    super();
    this._onChanged = this._onChanged.bind(this);
    this._routes = new Map();
  }
  connectedCallback(){
    window.addEventListener('popstate', this._onChanged);
    this._clearRoutes();
    this._createRoutes();
    this._onChanged();
  }
  disconnectedCallback(){
    window.removeEventListener('popstate', this._onChanged);
  }
}

class RSView extends HTMLElement {
  get route (){
    return this.getAttribute('route') || null;
  }
  get name (){
    return this.getAttribute('name') || null;
  }
  _hideSpinner (){
    this.classList.remove('pending');
  }
  _showSpinner (){
    this.classList.add('pending');
  }
  _loadView (data){
    const spinnerTimeout = setTimeout(_ => this._showSpinner(), 500);
    this._view = new DocumentFragment();
    return new Promise((resolve, reject) =>{
      const xhr = new XMLHttpRequest();
      xhr.onload = (evt) => {
        const newDoc = evt.target.response;
        const newView = newDoc.querySelector('rs-view.visible');
        while(newView.firstChild) {
          this._view.appendChild(newView.firstChild);
       }
        this._hideSpinner();
        clearTimeout(spinnerTimeout);
        this.appendChild(this._view);
        resolve();
      };
      xhr.responseType = 'document';
      xhr.open('GET', data[0]);
      xhr.send();
    });
  }
  _init (){
    if (!this.name || this._obj) return;
    try {
      this._obj = eval(`new ${this.name} ()`);
    } catch (e) {
      this._obj = null;
      console.warn(`Something went worng while trying to evaluate view
        scripts: new ${this.name}`);
        console.warn(e);
    }
  }
  in (data){
    if (this._isRemote && !this._view) {
      this._loadView(data).then(_=>{
        this._init();
      });
    }
    return new Promise((resolve, reject) => {
      const onTransitionEnd = () =>{
        this.removeEventListener("transitionend", onTransitionEnd);
        const detail = {
          data: data
        };
        const event = new CustomEvent('view-in', detail);
        this.dispatchEvent(event);
        resolve();
      };
      this.classList.add('visible');
      this.addEventListener("transitionend", onTransitionEnd);
    });
  }
  out (data){
    return new Promise((resolve, reject) => {
      const onTransitionEnd = () =>{
        this.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      };
      this.classList.remove('visible');
      this.addEventListener('transitionend', onTransitionEnd);
    });
  }
  update (data){
    console.log(data);
    return Promise.resolve();
  }
  constructor(){
    super();
    this._view = null;
    this._isRemote = ( this.getAttribute('remote') !== null );
  }
  connectedCallback(){
    if (this.classList.contains('visible')) {
      console.log(`${this.name} Is visible`);
      const detail = {};
      const event = new CustomEvent('view-in', detail);
      this.dispatchEvent(event);
    }
  }
  disconnectedCallback(){
  }
}

class SideNav {
  constructor() {
    this.KEY_CODE = {
      ESC: 27
    };
    this.showSideNavBtn = document.querySelector('.page-header--show-button');
    this.hideSideNavBtn = document.querySelector('.page-header--hide-button');
    this.sideNavContainerEl = document.querySelector('.side-nav-container');
    this.showSideNav = this.showSideNav.bind(this);
    this.hideSideNav = this.hideSideNav.bind(this);
    this._linkClicked = this._linkClicked.bind(this);
    this.addEventListeners = this.addEventListeners.bind(this);
    Array.from(this.sideNavContainerEl.querySelectorAll('a'))
    .forEach(link=>{
      link.addEventListener('click', this._linkClicked);
    });
    this.addEventListeners();
  }
  addEventListeners(){
    this.showSideNavBtn.addEventListener('click', this.showSideNav);
    this.hideSideNavBtn.addEventListener('click', this.hideSideNav);
    document.body.addEventListener('keydown',this.hideSideNav);
  }
  showSideNav(evt){
    this.sideNavContainerEl.classList.add('side-nav-container__animate');
    this.sideNavContainerEl.classList.add('side-nav-container__visible');
  }
  hideSideNav(evt){
    if ( evt.type == 'keydown' && evt.keyCode == this.KEY_CODE.ESC || evt.type == 'click'){
      this.sideNavContainerEl.classList.remove('side-nav-container__visible');
    }
  }
  _linkClicked(evt){
    evt.preventDefault();
		const router = document.querySelector('rs-router');
    this.sideNavContainerEl.classList.remove('side-nav-container__visible');
		router.go(evt.target.href);
  }
}

(function(){
  installServiceWorker ();
  customElements.define('rs-view', RSView);
  customElements.define('rs-router', RSRouter);
  new SideNav();
})();
