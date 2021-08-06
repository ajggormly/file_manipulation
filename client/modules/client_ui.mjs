import * as File from '../../client/modules/client_file.mjs' // use full path to make server code happy
import * as Util from '../../client/modules/client_util.mjs'

export
function testClientUI() {
  let testDiv = document.createElement('div');
  testDiv.textContent = 'client_ui.mjs successfully loaded';
  document.body.appendChild(testDiv);

  File.testClientFile();
  Util.testClientUtil();
}