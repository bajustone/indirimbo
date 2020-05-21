export class SideNav {

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
    // this.hideSideNav(ev);
		const router = document.querySelector('rs-router');
    this.sideNavContainerEl.classList.remove('side-nav-container__visible');

		router.go(evt.target.href);

  }
}
