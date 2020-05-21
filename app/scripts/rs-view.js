export class RSView extends HTMLElement {
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
    // console.log(`loading view ${data}`);

    return new Promise((resolve, reject) =>{


      const xhr = new XMLHttpRequest();
      xhr.onload = (evt) => {
        const newDoc = evt.target.response;
        const newView = newDoc.querySelector('rs-view.visible');
        // this._view=newView;
        while(newView.firstChild) {
          this._view.appendChild(newView.firstChild);
       }
        this._hideSpinner();
        clearTimeout(spinnerTimeout);
        this.appendChild(this._view);
        // console.log(newView);
        resolve();
      }
      xhr.responseType = 'document';
      xhr.open('GET', data[0]);
      xhr.send();
    });

  }
  _init (){
    if (!this.name || this._obj) return;
    // if (this._obj) return;
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
      }
      this.classList.add('visible');
      this.addEventListener("transitionend", onTransitionEnd);
    });
  }
  out (data){
    return new Promise((resolve, reject) => {
      const onTransitionEnd = () =>{
        this.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      }
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
    // TODO: dispatch an event which will be handled by the ClassView ...

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
