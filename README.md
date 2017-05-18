# ExpressでTwitterAPIを扱う

あくまでテストプログラムなのでエラー処理とかほとんどしてぬ。

## はじめに

このサンプルでは[node-twitter-api]()を使っているが、リポジトリを見に行けば分かる通り既にメンテナンスされていない。  
（ワンパッケージでOAuth認証からAPIを叩くまで出来るパッケージがこれしか見当たらなかったので残念では有る。）

中身はそこまで長くないし難しくもなさそうなので、何かあった時に自分で直せそうだしプライベートで使う分にはまぁ。


## 事前準備

### dotenvのインストール

consumer_keyとかをプログラムにベタ書きするのはあれなので、dotenvを使用して.envファイルに書くようにする。

```
npm i -D dotenv
```

### express-sessionのインストール

Expressはデフォだとsessionが扱えない。

```
npm i -D express-session
```

```
# app.js

~

app.use(express.static(path.join(__dirname, 'public')));

// sessionのuseはこの位置に記述すること
// あとオプションは適当なので実際使う時は適宜書き換えること
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat'
}));

app.use('/', index);
app.use('/users', users);
```


## 本題

### node-twitter-apiのインストール

```
npm i -D node-twitter-api
```


### 認証の流れ

1. リクエストトークンの取得
1. 認証ページへユーザーをリダイレクト
1. コールバックURLへ必要なパラメータが付与された状態でGETリクエストが来るので、それを利用してアクセストークンを取得
1. 取得したアクセストークンをセッションへ保存してAPIにアクセスすればいい

#### リクエストトークンの取得&認証ページへのリダイレクト

`routes/users.js`の`router.get('/login', ~)`内

```
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
```

取得したrequestTokenSecretは後から使うのでセッションで保存しておく。


#### コールバック&アクセストークン取得

`routes/users.js`の`router.get('/login/callback', ~)`内

```
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
```

#### API叩く

```
twitter.getTimeline('home_timeline', {}, req.session.auth.accessToken, req.session.auth.accessTokenSecret, function(error, data, response) {
  if (error) {
    console.log('index error: ' + JSON.stringify(error));
    return;
  }
  res.send(data);
});
```
