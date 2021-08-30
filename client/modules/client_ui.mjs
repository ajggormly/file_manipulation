// use full path to make server code happy
import * as File from '../../client/modules/client_file.mjs' 
import * as Util from '../../client/modules/client_util.mjs'

let userName = '';
let fileTree = {};
const expandSymbol = '+'; 
const collapseSymbol = '-'; 
const fileSymbol = '\uD83D\uDCDC';
const closedFolderSymbol = '\uD83D\uDCC1';
const openedFolderSymbol = '\uD83D\uDCC2'
const fileTreeIndentionInt = 10;

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
  fileTree = await File.getFileTree(userName);
  fileTree = JSON.parse(fileTree);
  displayRootNode(fileTree);
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

function displayRootNode(rootNode) {
  const fileTreeDiv = document.createElement('div');
  fileTreeDiv.id = 'fileTreeDiv';
  const fileDiv = document.createElement('div');
  classifyFileDiv(fileDiv);
  fileDiv.textContent = expandSymbol + ' ' + userName + ' ' + closedFolderSymbol;
  fileDiv.dataset.expanded = 'false';
  fileDiv.dataset.children = JSON.stringify(rootNode.children);
  fileDiv.dataset.root = 'true';
  fileDiv.addEventListener('click', fileDivClicked);
  fileTreeDiv.appendChild(fileDiv);
  document.body.appendChild(fileTreeDiv);
}

// remove any symbols from the string
// such as backslash in the path name
// or symbols added
function cleanFileDivString(fileDivString) {
  const cleanRegExp = new RegExp('[^a-zA-Z0-9]', 'g');
  return fileDivString.replace(cleanRegExp, '');
}

function fileDivClicked(event) {
  const cleanedFileString = cleanFileDivString(this.textContent);
  if (this.dataset.expanded === 'true') {
    const childrenFileDivs =
      document.querySelectorAll('.' + cleanFileDivString(this.textContent));
    childrenFileDivs.forEach(function(childFileDiv) {
      childFileDiv.remove();
    });
    this.dataset.expanded = 'false';
    this.textContent = expandSymbol + ' ' + cleanedFileString + ' ' + closedFolderSymbol;
  }
  else {
    const children = JSON.parse(this.dataset.children);
    for (const child of children) {
      const fileDiv = document.createElement('div');
      classifyFileDiv(fileDiv);
      fileDiv.textContent = child.relPath.substring(1 + child.relPath.lastIndexOf('\\'));
      fileDiv.dataset.relPath = child.relPath;
      if (child.children.length > 0) {
        fileDiv.dataset.expanded = 'false';
        fileDiv.textContent = expandSymbol + ' ' + fileDiv.textContent + ' ' + openedFolderSymbol;
      }
      else {
        fileDiv.textContent = fileDiv.textContent + ' ' + fileSymbol;
      }
      fileDiv.dataset.children = JSON.stringify(child.children);
      fileDiv.classList.add(...this.classList);
      fileDiv.classList.add(cleanedFileString);
      fileDiv.addEventListener('click', fileDivClicked);
      let currentIndention = this.style.left.replace(/[^0-9.]/g, '');
      if (currentIndention === '') {
        currentIndention = 0;
      }
      fileDiv.style.left = (parseInt(currentIndention) + fileTreeIndentionInt) + 'px';
      this.after(fileDiv);
    }
    if (children.length > 0) {
      this.dataset.expanded = 'true';
      this.textContent = collapseSymbol + ' ' + cleanedFileString + ' ' + openedFolderSymbol;
    }
  }
}

function classifyFileDiv(div) {
  div.className = 'fileDiv';
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
  setUserName(this.textContent);
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