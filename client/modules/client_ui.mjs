import * as File from '../../client/modules/client_file.mjs' // use full path to make server code happy
import * as Util from '../../client/modules/client_util.mjs'

let userName = '';

export
async function selectUser() {
  const usersJSON = await getUserList();
  displayUserList(usersJSON);
  addEventListenersToUserNameDivs();
}

function destroyAllDivs() {
  const divs = document.querySelectorAll('div');
  divs.forEach(function(div) {
    div.remove();
  });
}

function switchUser() {
  destroyAllDivs();
  resetUserName();
  selectUser();
}

function resetUserName() {
  userName = '';
}

function destroyUserNameDivs() {
  document.querySelector('#userNameContainer').remove(); 
}

async function initMainPage() {
  let fileTree = await File.getFileTree(userName);
  fileTree = JSON.parse(fileTree);
  displayFileTree(fileTree);
  createGeneralUIWidgets();
}

function createGeneralUIWidgets() {
  createSwitchUserWidget();
}

function createSwitchUserWidget() {
  const switchUserDiv = document.createElement('div');
  switchUserDiv.id = 'switchUserDiv';
  switchUserDiv.textContent = 'Switch User';
  switchUserDiv.addEventListener('click', switchUserDivClicked);
  document.body.appendChild(switchUserDiv);
}

function switchUserDivClicked(event) {
  switchUser();
}

function displayFileTree(fileTree) {
  const root = userName;
  const fileArray = flattenFileTree(fileTree, root);
  const fileTreeDiv = document.createElement('div');
  fileTreeDiv.id = 'fileTreeDiv';
  for (const fileName of fileArray) {
    let fileDisplayString;
    let slashCount = 0;
    for (let i = fileName.length; i > 0; i--) {
      if (fileName[i] === '\\') {
        slashCount++;
      }
      if (slashCount === 2) {
        fileDisplayString = fileName.substring(i);
        break;
      }
    }
    if (!fileDisplayString) {
      fileDisplayString = fileName;
    }
    const fileDiv = document.createElement('div');
    fileDiv.className = 'fileDiv';
    fileDiv.textContent = fileDisplayString;
    fileTreeDiv.appendChild(fileDiv);
  }
  document.body.appendChild(fileTreeDiv); 
}

function flattenFileTree(fileTree, root) {
  let fileArray = [];
  fileArray.push(root + fileTree.relPath);
  function recursiveFlattenFileTree(fileTree, root, fileArray) {
    for (const child of fileTree.children) {
      fileArray.push(root + child.relPath)
      if (child.children.length > 0) {
        recursiveFlattenFileTree(child, root, fileArray);
      }
    }
  }
  recursiveFlattenFileTree(fileTree, root, fileArray);
  return(fileArray);
}

function login() {
  destroyUserNameDivs();
  initMainPage();
}

function setUserName(name) {
  userName = name;
}

function userNameDivClicked(event) {
  // in future, ask for password here
  setUserName(event.target.textContent);
  login();
}

function addEventListenersToUserNameDivs() {
  const userNameDivs = document.querySelectorAll('.userNameDiv');
  userNameDivs.forEach(function(userNameDiv) {
    userNameDiv.addEventListener('click', userNameDivClicked)
  });
}

function displayUserList(usersJSON) {
  const userNameContainer = document.createElement('div');
  userNameContainer.id = 'userNameContainer';
  const userListTitle = document.createElement('div');
  userListTitle.id = 'userListTitle';
  userListTitle.textContent = 'Select user:';
  userNameContainer.appendChild(userListTitle);
  const usersObj = JSON.parse(usersJSON);
  for (const name in usersObj) {
    const userDiv = document.createElement('div');
    userDiv.className = 'userNameDiv';
    userDiv.textContent = usersObj[name];
    userNameContainer.appendChild(userDiv);
  }
  document.body.appendChild(userNameContainer);
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
  const testDiv = document.createElement('div');
  testDiv.textContent = 'client_ui.mjs successfully loaded';
  document.body.appendChild(testDiv);

  File.testClientFile();
  Util.testClientUtil();
}