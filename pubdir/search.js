var mal_id = null;
var urlParams = new URLSearchParams(window.location.search);
if(urlParams.has('mal_id')) {
   mal_id = urlParams.get('mal_id');
}
const logbtn = document.getElementById('logbtn');
var get_logbtn = new XMLHttpRequest();
get_logbtn.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        result = get_logbtn.responseText;
        if (result == 'access_token') {
            logbtn.setAttribute('href', '/logout');
            logbtn.innerHTML = 'log out';
        } else if (result == 'refresh_token') {
            window.location = '/login';
        } else {
            logbtn.setAttribute('href', '/login');
            logbtn.innerHTML = 'log in';
        }
    }
};
get_logbtn.open("GET", "/loginstatus", true);
get_logbtn.send();
function search(mal_id) {
    if(mal_id) window.location = '/search/' + document.getElementById('search').value + '?mal_id=' + mal_id;
    else window.location = '/search/' + document.getElementById('search').value;
}
