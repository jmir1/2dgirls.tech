var progress = null;
var total_eps = null;
var mal_id = null;
function logged_in() {
    var urlParams = new URLSearchParams(window.location.search);
    if(urlParams.has('id') && urlParams.has('mal_id')) {
        var anime_id = urlParams.get('id');
        mal_id = urlParams.get('mal_id');
        get_episodes(mal_id, anime_id);
    } else if(urlParams.has('id')) {
        var anime_id = urlParams.get('id');
        get_episodes(null, anime_id);
    } else if(urlParams.has('mal_id')) {
        mal_id = urlParams.get('mal_id');
        var get_id = new XMLHttpRequest();
        get_id.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var result = JSON.parse(get_id.responseText);
                var id = result.id;
                var title = result.animex.title;
                var image = result.animex.image;
                document.getElementById('anime_name').innerHTML = "<img style='width: 100px' src='" + image + "'>" + title + " | <a href='/search/" + window.location.pathname.split('list/').pop() + "?mal_id=" + mal_id + "'>wrong show?</a>";
                get_episodes(mal_id, id);
            } else if(this.readyState == 4 && this.status != 200) {
                var search_term = decodeURIComponent(window.location.pathname.split('/list/')[1]);
                var get_anime = new XMLHttpRequest();
                get_anime.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        result = JSON.parse(get_anime.responseText).results;
                        if(result.length == 0) document.getElementById('anime_name').innerHTML = "nothing found for '" + search_term + "'<br>try manual search: <input id='search' type='text'> <input type='button' onclick='search(mal_id)' value='search'>";
                        else {
                             get_episodes(mal_id, result[0].id);
                             document.getElementById('anime_name').innerHTML = "<img style='width: 100px' src='" + result[0].image + "'>" + result[0].title + " | <a href='/search/" + window.location.pathname.split('list/').pop() + "?mal_id=" + mal_id + "'>wrong show?</a>";
                        }
                    } else if (this.readyState == 4 && this.status == 400) {
                        window.location = "/#error=error";
                    }
                };
                get_anime.open("GET", "/api/search/" + search_term + "/1", true);
                get_anime.send();
            }
        };
        get_id.open("GET", "/db/" + mal_id, true);
        get_id.send();
    } else {
        var search_term = decodeURIComponent(window.location.pathname.split('/list/')[1]);
        var get_anime = new XMLHttpRequest();
        get_anime.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                result = JSON.parse(get_anime.responseText).results;
                //console.log(result);
                if(result.length == 0) document.getElementById('anime_name').innerHTML = "nothing found for '" + search_term + "'<br>try manual search: <input id='search' type='text'> <input type='button' onclick='search(mal_id)' value='search'>";
                else {
                    get_episodes(null, result[0].id);
                    document.getElementById('anime_name').innerHTML = "<img style='width: 100px' src='" + result[0].image + "'>" + result[0].title + " | <a href='/search/" + window.location.pathname.split('list/').pop() + "'>wrong show?</a>";
                }
            } else if (this.readyState == 4 && this.status == 400) {
                window.location = "/#error=error";
            }
        };
        get_anime.open("GET", "/api/search/" + search_term + "/1", true);
        get_anime.send();
    }

    get_progress(mal_id);
}
function get_progress(mal_id){
    if(mal_id) {
    var get_progress = new XMLHttpRequest();
    get_progress.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            progress = JSON.parse(get_progress.responseText).episodes_seen;
            if(total_eps) {
                document.getElementById('episodes').innerHTML ="progress: " + progress + "/" + total_eps;
            }
        }
    };
    get_progress.open("GET", "/progress/" + decodeURIComponent(window.location.pathname.split('/list/')[1]) + "?mal_id=" + mal_id, true);
    get_progress.send();
    } else {
    var get_progress = new XMLHttpRequest();
    get_progress.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            progress = JSON.parse(get_progress.responseText).episodes_seen;
            if(total_eps) {
                document.getElementById('episodes').innerHTML ="progress: " + progress + "/" + total_eps;
            }
        }
    };
    get_progress.open("GET", "/progress/" + decodeURIComponent(window.location.pathname.split('/list/')[1]), true);
    get_progress.send();
    }
}
function get_episodes(mal_id, anime_id) {
    var get_episodes = new XMLHttpRequest();
    get_episodes.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_episodes.responseText).results;
            if(mal_id) document.getElementById('anime_name').innerHTML = "<img style='width: 100px' src='" + result[0].image + "'>" + result[0].title + " | <a href='/search/" + window.location.pathname.split('list/').pop() + "?mal_id=" + mal_id + "'>wrong show?</a>";
            else document.getElementById('anime_name').innerHTML = "<img style='width: 100px' src='" + result[0].image + "'>" + result[0].title + " | <a href='/search/" + window.location.pathname.split('list/').pop() + "'>wrong show?</a>";
            total_eps = result[0].totalepisode;
            if(progress) {
                document.getElementById('episodes').innerHTML = "progress: " + progress + "/" + total_eps;
            }
            for(i = 1; i <= total_eps; i++) {
                document.getElementById("ep_list").innerHTML += "<li id='ep_" + i + "'></li>"
                get_episode(mal_id, anime_id, i);
            }
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/#error";
        }
    };
    get_episodes.open("GET", "/api/details/" + anime_id, true);
    get_episodes.send();
}

function get_episode(mal_id, anime_id, episode) {
    var get_episode = new XMLHttpRequest();
    get_episode.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_episode.responseText);
            //console.log(result);
            if(mal_id && total_eps) {
                var url = new URL(result.links[0].src);
                var link = (url.search == '') ? result.links[0].src + "?mal_id=" + mal_id + "&ep=" + episode + "&max_ep=" + total_eps : result.links[0].src + "&mal_id=" + mal_id + "&ep=" + episode + "&max_ep=" + total_eps;
                document.getElementById("ep_" + episode).innerHTML = "<a href='/watch/" + link + "'>Episode " + episode + "</a>";
            } else document.getElementById("ep_" + episode).innerHTML = "<a href='/watch/" + result.links[0].src + "'>Episode " + episode + "</a>";
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/login";
        }
    };
    get_episode.open("GET", "/api/watching/" + anime_id + "/" + episode, true);
    get_episode.send();
}
function search(mal_id) {
    if(mal_id) window.location = '/search/' + document.getElementById('search').value + '?mal_id=' + mal_id;
    else window.location = '/search/' + document.getElementById('search').value;
}
