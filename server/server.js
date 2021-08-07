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
        respondWithFile(filePath, response);
        break;
      case (request.url.match(/^\/client\/modules\/.+.mjs/) !== null):
        filePath = Path.join(__dirname, '..', request.url);
        respondWithFile(filePath, response);
        break;
      case (request.url.match(/^\/client\/.+.js/) !== null):
        filePath = Path.join(__dirname, '..', 'client', 
          request.url.substring(request.url.lastIndexOf('/')));
        respondWithFile(filePath, response);
        break;
      case (request.url === '/favicon.ico'):
        filePath = Path.join(__dirname, '..', 'public', 'favicon.ico');
        respondWithFile(filePath, response);
        break;
      case (request.url === '/userList'):
        filePath = Path.join(__dirname, 'users', 'users.json');
        respondWithUserNames(filePath, response);
        break;
      case (request.url === '/style.css'):
        filePath = Path.join(__dirname, '..', 'client', 'style.css')
        respondWithFile(filePath, response);
        break;
    }
      
  }
});
server.listen(port);
console.log(`Listening on port ${port}`);
 
function respondWithFile(filePath, response) {
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

async function respondWithUserNames(filePath, response) {
  filePath = Path.normalize(filePath);
  console.log(`filePath: ${filePath}`);
  console.log(`mimeType: ${Util.mimeType(filePath)}`)
  response.setHeader('Content-Type', 'text/plain');
  try {
    const usersJson = JSON.parse(Fs.readFileSync(filePath, 'utf8'));
    let usersCSV = '';
    for (let obj in usersJson) {
      for (let key in usersJson[obj]) {
        if (key == 'userName') {
          usersCSV += `${usersJson[obj][key]},`;
        }
      }
    }
    usersCSV = usersCSV.substring(0, usersCSV.length - 1);
    response.setStatus = 200;
    response.write(usersCSV);
    response.end();
  }
    catch (err) {
    console.log(err);
  }
}