import * as UI from './modules/client_ui.mjs'

function init() {
  UI.selectUser();
}

function testClientMain() {
  let testDiv = document.createElement('div');
  testDiv.textContent = 'client.js successfully loaded';
  document.body.appendChild(testDiv);
}

init();

// testClientMain();
// UI.testClientUI();