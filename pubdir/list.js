const watching = document.getElementById('watching');
const completed = document.getElementById('completed');
const plan_to_watch = document.getElementById('plan_to_watch');
const on_hold = document.getElementById('on_hold');
const dropped = document.getElementById('dropped');
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
            watching.innerHTML = 'log in to see your list';
            completed.innerHTML = 'log in to see your list';
        }
    }
};
get_logbtn.open("GET", "/loginstatus", true);
get_logbtn.send();
function logged_in() {
    var get_watching = new XMLHttpRequest();
    get_watching.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_watching.responseText);
            console.log(result);
            for (number in result.data) {
                watching.innerHTML += "<li><img src='" + result.data[number].node.main_picture.medium + "'/><a href='/list/" + result.data[number].node.title + "?mal_id=" + result.data[number].node.id + "'>episodes</a> | <a href='https://nyaa.si/?c=1_2&q=" + result.data[number].node.title + "'>torrent</a> | <a href='https://myanimelist.net/anime/" + result.data[number].node.id + "'>myanimelist</a> | " + result.data[number].node.title + "</li>";
            }
            document.getElementById('watching_btn').removeAttribute('style');
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/login";
        }
    };
    get_watching.open("GET", "/watching", true);
    get_watching.send();

    var get_completed = new XMLHttpRequest();
    get_completed.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_completed.responseText);
            for (number in result.data) {
                completed.innerHTML += "<li><img src='" + result.data[number].node.main_picture.medium + "'/><a href='/list/" + result.data[number].node.title + "?mal_id=" + result.data[number].node.id + "'>episodes</a> | <a href='https://nyaa.si/?c=1_2&q=" + result.data[number].node.title + "'>torrent</a> | <a href='https://myanimelist.net/anime/" + result.data[number].node.id + "'>myanimelist</a> | " + result.data[number].node.title + "</li>";
            }
            document.getElementById('completed_btn').removeAttribute('style');
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/login";
        }
    };
    get_completed.open("GET", "/completed", true);
    get_completed.send();

    var get_on_hold = new XMLHttpRequest();
    get_on_hold.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_on_hold.responseText);
            for (number in result.data) {
                on_hold.innerHTML += "<li><img src='" + result.data[number].node.main_picture.medium + "'/><a href='/list/" + result.data[number].node.title + "?mal_id=" + result.data[number].node.id + "'>episodes</a> | <a href='https://nyaa.si/?c=1_2&q=" + result.data[number].node.title + "'>torrent</a> | <a href='https://myanimelist.net/anime/" + result.data[number].node.id + "'>myanimelist</a> | " + result.data[number].node.title + "</li>";
            }
            document.getElementById('on_hold_btn').removeAttribute('style');
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/login";
        }
    };
    get_on_hold.open("GET", "/on_hold", true);
    get_on_hold.send();

    var get_plan_to_watch = new XMLHttpRequest();
    get_plan_to_watch.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_plan_to_watch.responseText);
            for (number in result.data) {
                plan_to_watch.innerHTML += "<li><img src='" + result.data[number].node.main_picture.medium + "'/><a href='/list/" + result.data[number].node.title + "?mal_id=" + result.data[number].node.id + "'>episodes</a> | <a href='https://nyaa.si/?c=1_2&q=" + result.data[number].node.title + "'>torrent</a> | <a href='https://myanimelist.net/anime/" + result.data[number].node.id + "'>myanimelist</a> | " + result.data[number].node.title + "</li>";
            }
            document.getElementById('plan_to_watch_btn').removeAttribute('style');
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/login";
        }
    };
    get_plan_to_watch.open("GET", "/plan_to_watch", true);
    get_plan_to_watch.send();

    var get_dropped = new XMLHttpRequest();
    get_dropped.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_dropped.responseText);
            for (number in result.data) {
                dropped.innerHTML += "<li><img src='" + result.data[number].node.main_picture.medium + "'/><a href='/list/" + result.data[number].node.title + "?mal_id=" + result.data[number].node.id + "'>episodes</a> | <a href='https://nyaa.si/?c=1_2&q=" + result.data[number].node.title + "'>torrent</a> | <a href='https://myanimelist.net/anime/" + result.data[number].node.id + "'>myanimelist</a> | " + result.data[number].node.title + "</li>";
            }
            document.getElementById('dropped_btn').removeAttribute('style');
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/login";
        }
    };
    get_dropped.open("GET", "/dropped", true);
    get_dropped.send();
}
