import * as File from '../../client/modules/client_file.mjs' // use full path to make server code happy
import * as Util from '../../client/modules/client_util.mjs'


let userName = '';

export
async function selectUser() {
  const usersCSV = await getUserList();
  displayUserList(usersCSV);
}

function displayUserList(usersCSV) {
  const userListDiv = document.createElement('div');
  const usersArr = usersCSV.split(',');
  for (let i = 0; i < usersArr.length; i++) {
    const userDiv = document.createElement('div');
    userDiv.textContent = usersArr[i];
    userListDiv.appendChild(userDiv);
  }
  document.body.appendChild(userListDiv);
}

async function getUserList() {
  try {
    const response =  await fetch('/userList', {
      method: 'GET'
    })
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.text();
  }
  catch (err) {
    console.log(err);
  }
}

export
function testClientUI() {
  let testDiv = document.createElement('div');
  testDiv.textContent = 'client_ui.mjs successfully loaded';
  document.body.appendChild(testDiv);

  File.testClientFile();
  Util.testClientUtil();
}