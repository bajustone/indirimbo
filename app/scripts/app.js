import {installServiceWorker} from './sw-install.js'
import {get} from './utils.js'
import {RSRouter} from './rs-router.js'
import {RSView} from './rs-view.js'
import {SideNav} from './side-nav';

(function(){
  installServiceWorker ();
  // get('/indirimbo/static/res/bookslog.json', function(data){
  //
  //   console.log(JSON.parse(data));
  // });
  customElements.define('rs-view', RSView);
  customElements.define('rs-router', RSRouter);
  new SideNav();

})();
