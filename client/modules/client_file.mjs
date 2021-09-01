export
function testClientFile() {
  const testDiv = document.createElement('div');
  testDiv.textContent = 'client_file.mjs successfully loaded';
  document.body.appendChild(testDiv);
}

export
async function getFileTree(userName) {
  try {
    const response = await fetch(`/fileTree/${userName}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const fileTree = await response.text();
    return fileTree;
  }
  catch(err) {
    console.log(err);
  }
}

export
async function getFile(filePath) {
  try {
    const response = await fetch(`file/${filePath}`, {
      method: 'GET'
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const file = await response.text();
    return file;
  }
  catch(err) {
    console.log(err);
  }
}