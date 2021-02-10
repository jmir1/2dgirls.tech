const logbtn = document.getElementById('logbtn');
var get_logbtn = new XMLHttpRequest();
get_logbtn.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        result = get_logbtn.responseText;
        if (result == 'access_token') {
            logbtn.setAttribute('href', '/logout');
            logbtn.innerHTML = 'log out';
            logged_in();
        } else if (result == 'refresh_token') {
            window.location = '/login';
        } else {
            logbtn.setAttribute('href', '/login');
            logbtn.innerHTML = 'log in';
            logged_in();
        }
    }
};
get_logbtn.open("GET", "/loginstatus", true);
get_logbtn.send();
