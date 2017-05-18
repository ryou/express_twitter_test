var express = require('express');
var router = express.Router();

var twitter = require('../libs/twitter');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.auth || !req.session.auth.accessToken) {
    res.send('<a href="/users/login">login</a>');
    return;
  }

  twitter.getTimeline('home_timeline', {}, req.session.auth.accessToken, req.session.auth.accessTokenSecret, function(error, data, response) {
    if (error) {
      console.log('index error: ' + JSON.stringify(error));
      return;
    }
    res.send(data);
  });
});

module.exports = router;
