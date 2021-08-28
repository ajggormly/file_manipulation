import * as File from '../../client/modules/client_file.mjs' // use full path to make server code happy
import * as Util from '../../client/modules/client_util.mjs'

let userName = '';
let fileTree = {};

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
  displayFileNode(fileTree);
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

function displayFileNode(node) {
  const fileTreeDiv = document.createElement('div');
  fileTreeDiv.id = 'fileTreeDiv';
  const nodeIsRoot = node.relPath === '\\';
  if (nodeIsRoot) {
    const fileDiv = document.createElement('div');
    classifyFileDiv(fileDiv);
    fileDiv.textContent = userName + '\\';
    fileDiv.dataset.expanded = 'false';
    fileDiv.dataset.children = JSON.stringify(node.children);
    fileDiv.addEventListener('click', fileDivClicked);
    fileTreeDiv.appendChild(fileDiv);
  }
  document.body.appendChild(fileTreeDiv);
}

function fileDivClicked(event) {
  if (this.dataset.expanded === 'true') {
    // have to remove backslashes because they aren't
    // supported correctly in class name
    const childrenFileDivs =
      document.querySelectorAll('.' + this.textContent.replace(/\\/g, ''));
    childrenFileDivs.forEach(function(childFileDiv) {
      childFileDiv.remove();
    });
    this.dataset.expanded = 'false';
  }
  else {
    const children = JSON.parse(this.dataset.children);
    for (const child of children) {
      const fileDiv = document.createElement('div');
      classifyFileDiv(fileDiv);
      fileDiv.textContent = child.relPath;
      fileDiv.dataset.expanded = 'false';
      fileDiv.dataset.children = JSON.stringify(child.children);
      // have to remove any backslashes because they aren't
      // supported correctly in class names
      fileDiv.classList.add(...this.classList);
      fileDiv.classList.add(this.textContent.replace(/\\/g, ''));
      fileDiv.addEventListener('click', fileDivClicked);
    this.after(fileDiv);
    }
    if (children.length > 0) {
      this.dataset.expanded = 'true';
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
  // let sibling = document.createElement('div');
  // sibling.className = 'userNameDiv';
  // sibling.textContent = 'sibling';
  // this.parentNode.insertBefore(sibling, this.nextSibling);
  // this.after(sibling);
  // addEventListenersToUserNameDivs();
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