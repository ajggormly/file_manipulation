export
function testClientFile() {
  let testDiv = document.createElement('div');
  testDiv.textContent = 'client_file.mjs successfully loaded';
  document.body.appendChild(testDiv);
}