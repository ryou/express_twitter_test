var twitterAPI = require('node-twitter-api');

var twitter = new twitterAPI({
  consumerKey: process.env.API_KEY,
  consumerSecret: process.env.API_SECRET,
  callback: process.env.CALLBACK_URL
});

module.exports = twitter;
