export class RSRouter extends HTMLElement {
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
    // TODO: get urser routes from xhr
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
    this._createRoutes()
    // this._createViews()
    this._onChanged();
      // .then( _ => this._createRoutes() )
      //   .then( _ => this._onChanged())
      //     .catch( _ =>{
      //       console.warn("Something went wrong:(");
      //     });
  }
  disconnectedCallback(){
    window.removeEventListener('popstate', this._onChanged);
  }
}
