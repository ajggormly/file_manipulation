const Http = require('http');
const Fs = require('fs');
const fsp = require('fs/promises');
const port = process.env.PORT || 3000;
const path = require('path');
const util = require('./modules/server_util.js')
const server = Http.createServer(function(request, response) {
  console.log(`${request.method} ${request.url}`)
  if (request.method === 'GET') {
    let filePath = '';
    switch (true) {
      case (request.url === '/'):
      case (request.url === '/index.html'):
        filePath = path.join(__dirname, '..', 'public', 'index.html');
        respondWithFile(filePath, response);
        break;
      case (request.url.match(/^\/client\/modules\/.+.mjs/) !== null):
        filePath = path.join(__dirname, '..', request.url);
        respondWithFile(filePath, response);
        break;
      case (request.url.match(/^\/client\/.+.js/) !== null):
        filePath = path.join(__dirname, '..', 'client', 
          request.url.substring(request.url.lastIndexOf('/')));
        respondWithFile(filePath, response);
        break;
      case (request.url === '/favicon.ico'):
        filePath = path.join(__dirname, '..', 'public', 'favicon.ico');
        respondWithFile(filePath, response);
        break;
      case (request.url === '/userList'):
        respondWithUserNames(response);
        break;
      case (request.url === '/style.css'):
        filePath = path.join(__dirname, '..', 'client', 'style.css')
        respondWithFile(filePath, response);
        break;
      case (request.url.match(/^\/fileTree\/.+/) !== null):
        let userName = request.url.substring(request.url.lastIndexOf('/'));
        respondWithFileTree(userName, response);
        break;
      default:
        response.setStatus = 404;
        response.write(`no resource found at ${request.url}`);
        response.end();
    }
  }
});
server.listen(port);
console.log(`Listening on port ${port}`);
 
async function respondWithFileTree(userName, response) {
 async function createFileTree(rootFullPath) {
    const root = {
      relPath: '\\',
      children: []
    };
    async function createFileTreeRecursive(tree, rootFullPath) {
      try {
        const files = await fsp.readdir(path.join(rootFullPath, tree.relPath), {
          encoding: 'utf8',
          withFileTypes: true
        });
        for (const file of files) {
          const branch = {
            relPath: path.join(tree.relPath, file.name),
            children: []
          };
          if (file.isDirectory()) {
            let branchChild = await createFileTreeRecursive(branch, rootFullPath);
            tree.children.push(branchChild);
          }
          else {
            tree.children.push(branch);
          }
        }
      }
      catch (err) {
        console.log(err);
      }
      return tree;
    }
    let tree = await createFileTreeRecursive(root, rootFullPath);
    return JSON.stringify(tree);
  }
  response.setHeader('Content-Type', 'text/plain');
  try {
    dir = path.join(__dirname, '..', 'public', 'users', userName);
    let fileTree = await createFileTree(dir);
    response.setStatus = 200;
    response.write(fileTree);
    response.end();
  }
    catch (err) {
    console.log(err);
  }
}

async function respondWithUserNames(response) {
  response.setHeader('Content-Type', 'text/plain');
  try {
    const files = await fsp.readdir(path.join(__dirname, '..', 'public', 'users'), {
      encoding: 'utf8',
    });
    response.setStatus = 200;
    response.write(JSON.stringify(files));
    response.end();
  }
    catch (err) {
    console.log(err);
  }
}

function respondWithFile(filePath, response) {
  filePath = path.normalize(filePath);
  response.setHeader('Content-Type', util.mimeType(filePath));
  const readStream = Fs.createReadStream(filePath);
  readStream.on('open', function() {
    readStream.pipe(response);
  });
  readStream.on('error', function(err) {
    response.end(err);
  });
}