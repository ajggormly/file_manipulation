const http = require('http');
const fs = require('fs');
const port = process.env.PORT || 3000;
const path = require('path');
const server = http.createServer(function(request, response) {
  if (request.method === 'GET') {
    console.log(`request.url: ${request.url}`)
    let filePath = '';
    switch (true) {
      case (request.url === '/'):
      case (request.url === '/index.html'):
        filePath = `${__dirname}/public/index.html`;
        filePath = path.normalize(filePath);
    }
  }
})