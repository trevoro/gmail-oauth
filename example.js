var GmailOAuth = require('./lib/index');
var client = GmailOAuth.createClient();

process.stdin.setEncoding('utf8');

process.stdin.resume();
process.stdout.write('Enter email address: ');
process.stdin.on('data', function (text) {
  var user = text.trim();

  client.getRequestToken(user, function (error, results) {
    if (error) 
      throw new Error (error);

    console.log('Please visit the following URL and grant permission');
    console.log(results.authorizeUrl);

    process.stdin.resume();
    process.stdout.write('Enter verification code: ');

    process.stdin.on('data', function (text) {
      var verifier = text.trim();
      client.getAccessToken(results, verifier, function(error, results) {
        if (error) { 
          console.log(error);
        } else {
          console.log(results);
        }
      });
    });
  });

});
