require('dotenv').config();
const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('cookie-encrypter');
const fs = require('fs');
const http = require('http');
const https = require('https');
const bodyparser = require('body-parser');
const privateKey  = fs.readFileSync(process.env.PRIVKEYPATH, 'utf8');
const certificate = fs.readFileSync(process.env.CERTPATH, 'utf8');

const credentials = {key: privateKey, cert: certificate};

const cookie_secret = process.env.COOKIE_SECRET; // secret for cookie_encypter
const client_id = process.env.CLIENT_ID; //Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = 'https://2dgirls.tech/callback'; // Your redirect uri

const generateRandomString = function(length) {
  var text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const app = express();
const pubdir = process.env.PUBDIR;

app.use(express.static(pubdir))
   .use(cors())
   .use(cookieParser(cookie_secret))
   .use(cookieEncrypter(cookie_secret))
   .use(bodyparser.json())
   .use(bodyparser.text())
   .use(bodyparser.urlencoded({ extended: true }));
app.get('/', function(req, res) {
    res.sendFile(pubdir + 'index.html');
});
app.get('/loginstatus', function(req, res) {
  if(req.signedCookies['access_token']) res.send('access_token');
  else if(req.signedCookies['refresh_token']) res.send('refresh_token');
  else res.send('no_login');
});
app.get('/logout', function(req, res) {
  if(req.signedCookies['access_token']) res.cookie('access_token', null, {httpOnly: true, signed: true, maxAge: 0});
  if(req.signedCookies['refresh_token']) res.cookie('refresh_token', null, {httpOnly: true, signed: true, maxAge: 0});
  if(req.signedCookies['code_challenge']) res.cookie('code_challenge', null, {httpOnly: true, signed: true, maxAge: 0});
  res.redirect('/');
});
app.get('/update', function(req, res) {
    var referer = req.header('Referer');
    var mal_id = req.query.mal_id || null;
    var ep = req.query.ep || null;
    var max_ep = req.query.max_ep || null;
    var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
    if(mal_id && ep && access_token && max_ep) {
        var status = (ep == max_ep) ? 'completed' : 'watching';
        var options = {
                method: 'PATCH',
                url: 'https://api.myanimelist.net/v2/anime/' + mal_id + '/my_list_status',
                headers: {
                    Authorization: 'Bearer ' + access_token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: "status=" + status + "&num_watched_episodes=" + ep
        }
        request(options, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                res.redirect(referer);
            } else {
                res.status(400).send('error: ' + body);
            }
        });
    } else {
        res.status(400).send('error');
    }

});
app.get('/progress/*', function(req, res) {
  var anime = decodeURIComponent(req.path.split('/progress/')[1]);
  var mal_id = req.query.mal_id || null;
  var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
  if (!access_token) {
    res.status(403);
    res.send('not logged in');
  } else if (access_token) {
    var options = {
      url: 'https://api.myanimelist.net/v2/anime/' + mal_id + '?fields=my_list_status',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + access_token
      }
    };
    if(!mal_id) {
       options.url = 'https://api.myanimelist.net/v2/anime?fields=my_list_status&q=' + anime;
       request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var anime1 = JSON.parse(body).data[0].node;
          if(anime1.my_list_status) var episodes = (anime1.my_list_status.num_episodes_watched);
          else var episodes = 0;
          res.send({episodes_seen: episodes});
        } else {
          res.send({episodes_seen: 0});
        }
       });
    } else {
      request.get(options, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          var anime = JSON.parse(body);
          if(anime.my_list_status) var episodes = (anime.my_list_status.num_episodes_watched);
          else var episodes = 0;
          res.send({episodes_seen: episodes});
        } else {
          res.send({episodes_seen: 0});
        }
    });
  }

}
});

function post_db(mal_id, id) {
  var animedb = JSON.parse(fs.readFileSync('animedb.json'));
  animedb[mal_id] = {id: id};
  var options = {
      url: 'https://2dgirls.tech/api/details/' + id
    }; //this api is a different node.js server
  request.get(options, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      animedb[mal_id].animex = JSON.parse(body).results[0];
      var dbdata = JSON.stringify(animedb, null, 2);
      fs.writeFileSync('animedb.json', dbdata);
    } else {
      animedb[mal_id].animex = {error : body};
    }
  });
}

app.get('/db/*', function(req, res) {
  var key = req.path.split('/db/')[1];
  var animedb = JSON.parse(fs.readFileSync('animedb.json'));
  if(animedb[key]) {
    res.send(animedb[key]);
  } else {
    res.status(404).send('not found in database');
  }
});
app.get('/list', function(req, res) {
  res.sendFile(pubdir + 'list.html');
});
app.get('/list/*', function(req, res) {
  res.sendFile(pubdir + 'animex.html');
  var id = req.query.id || null;
  var mal_id = req.query.mal_id || null;
  if(id && mal_id) {
    post_db(mal_id, id);
  }
});
app.get('/search/*', function(req, res) {
  res.sendFile(pubdir + 'searchresults.html');
});
app.get('/search', function(req, res) {
  res.sendFile(pubdir + 'search.html');
});
app.get('/watch/*', function(req, res) {
  if(req.signedCookies['access_token']) res.sendFile(pubdir + 'watch_logged_in.html');
  else res.sendFile(pubdir + 'watch.html');
});
app.get('/watching', function(req, res) {
  var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
  if (!access_token) {
    res.status(400);
    res.send('not logged in');
  } else if (access_token) {
    var options = {
      url: 'https://api.myanimelist.net/v2/users/@me/animelist?status=watching&limit=1000&nsfw=true',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + access_token
      }
    };
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body);
      } else {
        res.send(error);
      }
    });
  }
});
app.get('/plan_to_watch', function(req, res) {
  var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
  if (!access_token) {
    res.status(400);
    res.send('not logged in');
  } else if (access_token) {
    var options = {
      url: 'https://api.myanimelist.net/v2/users/@me/animelist?status=plan_to_watch&limit=1000&nsfw=true',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + access_token
      }
    };
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body);
      } else {
        res.send(error);
      }
    });
  }
});
app.get('/dropped', function(req, res) {
  var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
  if (!access_token) {
    res.status(400);
    res.send('not logged in');
  } else if (access_token) {
    var options = {
      url: 'https://api.myanimelist.net/v2/users/@me/animelist?status=dropped&limit=1000&nsfw=true',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + access_token
      }
    };
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body);
      } else {
        res.send(error);
      }
    });
  }
});
app.get('/on_hold', function(req, res) {
  var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
  if (!access_token) {
    res.status(400);
    res.send('not logged in');
  } else if (access_token) {
    var options = {
      url: 'https://api.myanimelist.net/v2/users/@me/animelist?status=on_hold&limit=1000&nsfw=true',
      headers: {
        Accept: 'application/json',
        Authorization: 'Bearer ' + access_token
      }
    };
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body);
      } else {
        res.send(error);
      }
    });
  }
});
app.get('/completed', function(req, res) {
  var access_token = req.signedCookies['access_token'] ? req.signedCookies['access_token'] : null;
  if (!access_token) res.send({error: 'not logged in'});
  else if (access_token) {
    var options = {
      url: 'https://api.myanimelist.net/v2/users/@me/animelist?status=completed&limit=1000&nsfw=true',
      headers: {
        Authorization: 'Bearer ' + access_token
      }
    };
    request.get(options, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        res.send(body);
      } else {
        res.send(error);
      }
    });
  }
});
app.get('/login', function(req, res) {
var referer = req.header('Referer');

if(req.signedCookies['access_token']) {
    res.redirect(referer);
  }
else if(req.signedCookies['refresh_token']) {
    res.redirect('/refresh_token');
  }
else {
  var code_challenge = generateRandomString(128);
  var cookieParams = {
    signed: true,
    httpOnly: true,
    maxAge: 120000,
  };
  res.cookie('code_challenge', code_challenge, cookieParams);
  // your application requests authorization
  res.redirect('https://myanimelist.net/v1/oauth2/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      code_challenge: code_challenge,
      state: referer
  }));
}
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var verifier = req.signedCookies ? req.signedCookies['code_challenge'] : null;
  if(!verifier) res.redirect('/login');
  else {
    var authOptions = {
      url: 'https://myanimelist.net/v1/oauth2/token',
      form: {
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        code_verifier: verifier,
        grant_type: 'authorization_code'
      }
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = JSON.parse(body).access_token,
            refresh_token = JSON.parse(body).refresh_token,
            expires_in = JSON.parse(body).expires_in;
        var refresh_age = expires_in - 300;
        var cookieParams = {
          signed: true,
          httpOnly: true,
          maxAge: 2678340000, // 31 days - 60 seconds
        };
        var accessCookieParams = {
          signed: true,
          httpOnly: true,
          maxAge: expires_in * 1000 - 60000, // 1 hour - 60 seconds
        };
        res.cookie('refresh_token', refresh_token, cookieParams);
        res.cookie('access_token', access_token, accessCookieParams);
        if (state) res.redirect(state);
        else res.redirect('/list');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {
  var referer = req.header('Referer');
  if(req.signedCookies['access_token']) {
    res.redirect(referer);
  }
  // requesting access token from refresh token
  var refresh_token = req.signedCookies ? req.signedCookies['refresh_token'] : null;
  var authOptions = {
    url: 'https://myanimelist.net/v1/oauth2/token',
    form: {
      client_id: client_id,
      client_secret: client_secret,
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token,
            refresh_token = body.refresh_token,
            expires_in = body.expires_in;

        var cookieParams = {
          signed: true,
          httpOnly: true,
          maxAge: expires_in * 1000 - 60000, // 31 days - 60 seconds (according to mal docs (bogus)) actual value 1 month - 60 secs
        };
        var accessCookieParams = {
          signed: true,
          httpOnly: true,
          maxAge: expires_in * 1000 - 60000, // 1 hour - 60 seconds (according to mal docs (bogus)) actual value 1 month - 60 secs
        };
        res.cookie('refresh_token', refresh_token, cookieParams);
        res.cookie('access_token', access_token, accessCookieParams);

        res.redirect(referer);
    } else{
      res.send(response.body);
    }
  });
});


//404 handling:
app.use(function (req, res, next) {
  res.status(404).sendFile(pubdir + '404.html');
})
//var httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
//console.log('Listening on 8080 and 8443');
//httpServer.listen(8080);
httpsServer.listen(8443);
