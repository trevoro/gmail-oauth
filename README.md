# gmail-oauth

OAuth for Gmail

## Example (Command-line)

    var GmailOAuth = require(__dirname + '../lib/index');

    GmailOAuth.getRequestToken(function (error, results) {
      if (error) {
        console.log(error);
        process.exit(1);
      }

      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdout.write('Enter verification code: ');

      process.stdin.on('data', function (text) {
        var verifier = text.trim();
        GmailOAuth.getAccessToken(results, verifier, function(error, results) {
          if (error) { 
            console.log(error);
          } else {
            console.log(results);
          }
        });
      });
    });
