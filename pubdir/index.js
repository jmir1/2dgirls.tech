const logbtn = document.getElementById('logbtn');
const listbtn = document.getElementById('listbtn');
var get_logbtn = new XMLHttpRequest();
get_logbtn.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        result = get_logbtn.responseText;
        if (result == 'access_token') {
            logbtn.setAttribute('href', '/logout');
            logbtn.innerHTML = 'log out';
            listbtn.setAttribute('href', '/list');
            listbtn.innerHTML = 'my list';
        } else {
            logbtn.setAttribute('href', '/login');
            logbtn.innerHTML = 'log in';
        }
    }
};
get_logbtn.open("GET", "/loginstatus", true);
get_logbtn.send();
function search(mal_id) {
    window.location = '/search/' + document.getElementById('search').value;
}
