var GmailOAuth = require('./lib/index');
var client = GmailOAuth.createClient();


var _stdin = process.stdin;
var _stdout = process.stdout;

_stdin.setEncoding('utf8');

var ask = function(question, callback) {
  process.stdout.write(question + ': ');
  process.stdin.resume();
  
  process.stdin.once('data', function (text) {
    var answer = text.trim();
    process.stdin.pause();
    callback(answer);
  });
};

ask('enter your email address', function(user) {
  client.getRequestToken(user, function (error, results) {

    if (error) 
      throw new Error (error);
    
    console.log('--------------------------------');
    console.log('Please visit the following URL and grant permission');
    console.log(results.authorizeUrl);

    ask('Enter verification code', function(code) {
      client.getAccessToken(results, code, function(error, results) {
        if (error) { 
          console.log(error);
          process.exit(1);
        } else {
          var xoauthString = client.getXoauthString(
            user, 
            results.accessToken, 
            results.accessTokenSecret);

          console.log('\n--------------------------------');
          console.log("access token:  %s", results.accessToken);
          console.log("access secret: %s", results.accessTokenSecret);
          console.log("xoauth string: %s", xoauthString);
          process.exit(0);
        }
      });
    });

  });
});
