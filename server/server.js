const Http = require('http');
const Fs = require('fs');
const port = process.env.PORT || 3000;
const Path = require('path');
const Util = require('./modules/server_util.js')
const server = Http.createServer(function(request, response) {
  console.log(`${request.method} ${request.url}`)
  if (request.method === 'GET') {
    let filePath = '';
    switch (true) {
      case (request.url === '/'):
      case (request.url === '/index.html'):
        filePath = Path.join(__dirname, '..', 'public', 'index.html');
        break;
      case (request.url.match(/^\/client\/modules\/.+.mjs/) !== null):
        filePath = Path.join(__dirname, '..', request.url);
        break;
      case (request.url.match(/^\/client\/.+.js/) !== null):
        filePath = Path.join(__dirname, '..', 'client', request.url.substring(request.url.lastIndexOf('/')));
        break;
      case (request.url === '/favicon.ico'):
        filePath = Path.join(__dirname, '..', 'public', 'favicon.ico');
        break;
    }
    filePath = Path.normalize(filePath);
    console.log(`filePath: ${filePath}`);
    console.log(`mimeType: ${Util.mimeType(filePath)}`)
    response.setHeader('Content-Type', Util.mimeType(filePath));
    const readStream = Fs.createReadStream(filePath);
    readStream.on('open', function() {
      readStream.pipe(response);
    });
    readStream.on('error', function(err) {
      response.end(err);
    });
  }
});
server.listen(port);
console.log(`Listening on port ${port}`);