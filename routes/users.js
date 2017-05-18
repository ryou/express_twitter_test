var express = require('express');
var router = express.Router();

var twitter = require('../libs/twitter');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var auth = req.session.auth || '';
  res.send(JSON.stringify(auth));
});

router.get('/login', function(req, res, next) {
  twitter.getRequestToken(function(error, requestToken, requestTokenSecret, result) {
    if (error) {
      console.log(error);
    }

    req.session.auth = {};
    req.session.auth.requestToken = requestToken;
    req.session.auth.requestTokenSecret = requestTokenSecret;

    var url = twitter.getAuthUrl(requestToken, {});
    res.redirect(303, url);
  });
});

router.get('/login/callback', function(req, res, next) {
  var query = req.query;

  twitter.getAccessToken(
    query.oauth_token,
    req.session.requestTokenSecret,
    query.oauth_verifier,
    function(error, accessToken, accessTokenSecret, result) {
      if (error) console.log('callback error' + JSON.stringify(error));

      req.session.auth = {};
      req.session.auth.accessToken = accessToken;
      req.session.auth.accessTokenSecret = accessTokenSecret;

      res.redirect(303, '/');
    }
  );
});


module.exports = router;
