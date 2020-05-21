export function get(url, callback ){
  /*
  * This function helps to get data from the server
  * json data form the server passed to the callback function
  */
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.responseText);
    }
  };
  xhttp.open('GET', url, true);
  // xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhttp.send();
}
