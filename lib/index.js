var OAuth = require('oauth').OAuth;
var querystring = require('querystring');

var Client = function(opts) {
  if (!opts) 
    throw new TypeError('opts (object) is required');

  this._consumerKey = opts.consumerKey;
  this._consumerSecret = opts.consumerSecret;
  this._callbackUrl = opts.callbackUrl;
}

var SCOPES = [
  querystring.escape('https://mail.google.com/')
];

Client.prototype._requestTokenUrl = function() {
  return 'https://www.google.com/accounts/OAuthGetRequestToken';
}

Client.prototype._authorizeTokenUrl = function(user) {
  var domain;

  if (user) 
    domain = user.split(/@/)[1];

  // console.log('domain is: %s', domain);

  if (domain && domain !== 'gmail.com' && domain !== 'googlemail.com') {
    return 'https://www.google.com/a/' + domain + '/OAuthAuthorizeToken';
  } else {
    return 'https://www.google.com/accounts/OAuthAuthorizeToken';
  }
}

Client.prototype._accessTokenUrl = function() {
  return 'https://www.google.com/accounts/OAuthGetAccessToken';
}

Client.prototype.callbackUrl = function() {
  return this.callbackUrl;
}

Client.prototype.xoauthString = function(user, accessToken, accessSecret) {
  var url, toEncode, params = [], oa;
  
  if (typeof(user) !== 'string') 
    throw new TypeError('user (string) is required');
  if (typeof(accessToken) !== 'string') 
    throw new TypeError('accessToken (string) is required');
  if (typeof(accessSecret) !== 'string') 
    throw new TypeError('accessSecret (string) is required');
  
  url = 'GET https://mail.google.com/mail/b/' + user + '/imap/';

  oa = new OAuth(
    this._requestTokenUrl() + '?scope=' + SCOPES.join('+'),
    this._accessTokenUrl,
    this._consumerKey,
    this._consumerSecret,
    '1.0',
    this._callbackUrl,
    'HMAC-SHA1');

  oa._prepareParameters(
    accessToken, 
    accessSecret, 
    'GET',
    url
  )
  .map(function(ele, idx, arr) {
    var k = ele[0];
    var v = ele[1];
    params.push(k + '="' + v + '"');
  });

  toEncode = url + ' ' + params.join(',');

  return new Buffer(toEncode).toString('base64');
}


Client.prototype.getRequestToken = function(user, callback) {
  var oa;
  var self = this;
  
  if (typeof(user) !== 'string')
    throw new TypeError('user (string) is required');

  oa = new OAuth(
    this._requestTokenUrl() + '?scope=' + SCOPES.join('+'),
    this._accessTokenUrl(),
    this._consumerKey,
    this._consumerSecret,
    '1.0', // oauth version
    this._callbackUrl,
    'HMAC-SHA1');

  oa.getOAuthRequestToken(function(error, token, secret, results) { 
    var redirectUrl, toReturn;

    if (error) 
      return callback(error, null);

    toReturn = {
      _request: oa,
      requestToken: token,
      requestTokenSecret: secret,
      requestResults: results,
      authorizeUrl: self._authorizeTokenUrl(user) + '?oauth_token=' + token
    };

    callback(null, toReturn)

  });

}

Client.prototype.getAccessToken = function(request, oauthVerifier, callback) {
  var _req, oa;
  
  if (typeof(request) !== 'object')
    throw new TypeError('request (object) is required');
  if (typeof(oauthVerifier) !== 'string')
    throw new TypeError('oauthVerifier (string) is required');

  _req = request._request;

  oa = new OAuth(
    _req._requestUrl,
    _req._accessUrl,
    _req._consumerKey,
    _req._consumerSecret,
    _req._version,
    _req._authorize_callback,
    _req._signatureMethod
  );
  
  oa.getOAuthAccessToken(
    request.requestToken,
    request.requestTokenSecret,
    oauthVerifier,
    
    function (error, token, secret, results) {
      var toReturn;
    
      if (error) 
        return callback(error, null);

      toReturn = {
        accessToken: token,
        accessTokenSecret: secret,
      };

      callback(null, toReturn);
    }
  );
}

var createClient = function(opts) {
  var args = {}, defaultOptions;

  if (!opts) 
    opts = {};

  defaultOptions = {
    consumerKey: 'anonymous',
    consumerSecret: 'anonymous',
    callbackUrl: 'oob' 
  };

  for (k in defaultOptions) {
    args[k] = opts[k] || defaultOptions[k];
  }

  return new Client(args);

}

module.exports = {
  createClient: createClient
}
