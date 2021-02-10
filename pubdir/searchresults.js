var mal_id = null;
var search_term = decodeURIComponent(window.location.pathname.split('search/')[1]);
var search_term_simple = search_term.replace(/[^a-zA-Z 0-9!]/g, "");
var urlParams = new URLSearchParams(window.location.search);
if(urlParams.has('mal_id')) {
    mal_id = urlParams.get('mal_id');
}
if(urlParams.has('manual_search')) {
    search_term = urlParams.get('manual_search');
    search_term_simple = search_term.replace(/[^a-zA-Z 0-9!]/g, "");
}
function logged_in() {
    var get_anime_list = new XMLHttpRequest();
    get_anime_list.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_anime_list.responseText).results;
            //console.log(result);
            if(result.length == 0) document.getElementById('anime_name').innerHTML = "nothing found for '" + search_term + "'<br>try another search: <input id='search' type='text'> <input type='button' onclick='search(mal_id)' value='search'>";
            else {
                document.getElementById('anime_name').innerHTML = "search results for '" + search_term + "'<br>still looking? try another search: <input id='search' type='text'> <input type='button' onclick='search(mal_id)' value='search'>";
                if(mal_id) {
                    for (anime in result) {
                        document.getElementById('anime_list').innerHTML += "<li id='" + result[anime].id + "'><img style='width: 100px' src='" + result[anime].image + "'><a href='/list/" + result[anime].title + "?id=" + result[anime].id + "&mal_id=" + mal_id + "'>" + result[anime].title + "</a></li>";
                    }
                } else {
                    for (anime in result) {
                        document.getElementById('anime_list').innerHTML += "<li id='" + result[anime].id + "'><img style='width: 100px' src='" + result[anime].image + "'><a href='/list/" + result[anime].title + "?id=" + result[anime].id + "'>" + result[anime].title + "</a></li>";
                    }
                }
            }
            if(search_term != search_term_simple) get_anime_list_simple();
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/#error=error";
        }
    };
    get_anime_list.open("GET", "/api/search/" + search_term + "/1", true);
    get_anime_list.send();



}
function search(mal_id) {
    if(mal_id) window.location = '/search/' + document.getElementById('search').value + '?mal_id=' + mal_id;
    else window.location = '/search/' + document.getElementById('search').value;
}
function get_anime_list_simple() {
    var get_anime_list_simple = new XMLHttpRequest();
    get_anime_list_simple.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            result = JSON.parse(get_anime_list_simple.responseText).results;
            console.log(result);
            if(result.length != 0) {
                document.getElementById('anime_name').innerHTML = "search results for '" + search_term + "'<br>still looking? try another search: <input id='search' type='text'> <input type='button' onclick='search()' value='search'>";
                if(mal_id) {
                  for (anime in result) {
                    if(!document.getElementById(result[anime].id)) {
                        document.getElementById('anime_list').innerHTML += "<li id='" + result[anime].id + "'><img style='width: 100px' src='" + result[anime].image + "'><a href='/list/" + result[anime].title + "?id=" + result[anime].id + "&mal_id=" + mal_id + "'>" + result[anime].title + "</a></li>";
                    }
                  }
                } else {
                  for (anime in result) {
                    if(!document.getElementById(result[anime].id)) {
                        document.getElementById('anime_list').innerHTML += "<li id='" + result[anime].id + "'><img style='width: 100px' src='" + result[anime].image + "'><a href='/list/" + result[anime].title + "?id=" + result[anime].id + "'>" + result[anime].title + "</a></li>";
                    }
                  }
                }
            }
        } else if (this.readyState == 4 && this.status == 400) {
            window.location = "/#error=error";
        }
    };
    get_anime_list_simple.open("GET", "/api/search/" + search_term_simple + "/1", true);
    get_anime_list_simple.send();
}
