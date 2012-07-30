var GmailOAuth = require('./lib/index');
var client = GmailOAuth.createClient();

process.stdin.setEncoding('utf8');
process.stdin.resume();
process.stdout.write('Enter email address: ');

process.stdin.once('data', function (text) {
  var user = text.trim();

  client.getRequestToken(user, function (error, results) {
    if (error) 
      throw new Error (error);

    console.log('Please visit the following URL and grant permission');
    console.log(results.authorizeUrl);

    process.stdin.resume();
    process.stdout.write('Enter verification code: ');

    process.stdin.once('data', function (text) {
      var verifier = text.trim();
      client.getAccessToken(results, verifier, function(error, results) {
        if (error) { 
          console.log(error);
          process.exit(1);
        } else {
          console.log(results);
        }
        process.exit(0);
      });
    });
  });

});
