module.exports = {

  mimeType: 
  function (filePath) {
    const extension = filePath.substring(filePath.lastIndexOf("."));
    switch (extension) {
      case '.js':
      case '.mjs':
        return 'application/javascript';
      case '.html':
        return 'text/html';
      case '.ico':
        return 'image/x-icon';
      case '.css':
        return 'text/css';
      case '.csv':
        return 'text/plain';
      case '.json':
        return 'application/json';
    }
  }

};