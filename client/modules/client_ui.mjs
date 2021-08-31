// use full path to make server code happy
import * as File from '../../client/modules/client_file.mjs' 
import * as Util from '../../client/modules/client_util.mjs'

let userName = '';
let fileTree = {};
const expandSymbol = '+'; 
const collapseSymbol = '-'; 
const fileSymbol = '\uD83D\uDCDC';
const collapsedFolderSymbol = '\uD83D\uDCC1';
const expandedFolderSymbol = '\uD83D\uDCC2'
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
  fileDiv.textContent = expandSymbol + ' ' + userName + ' ' + collapsedFolderSymbol;
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

function destroyFolderChildren(folder) {
  const childrenFileDivs =
  document.querySelectorAll('.' + cleanFileDivString(folder.textContent));
  childrenFileDivs.forEach(function(childFileDiv) {
    childFileDiv.remove();
  });
}

function collapseFolder(folder, cleanedFileString) {
  destroyFolderChildren(folder);
  folder.textContent = expandSymbol + ' ' + cleanedFileString + ' ' + collapsedFolderSymbol;
  folder.dataset.expanded = 'false';
}

function initFolder(fileDiv) {
  fileDiv.textContent = expandSymbol + ' ' + fileDiv.textContent + ' ' + expandedFolderSymbol;
  fileDiv.dataset.expanded = 'false';
}

function initFile(fileDiv) {
  fileDiv.textContent = fileDiv.textContent + ' ' + fileSymbol;
}

function nameFileDiv(fileDiv, fileObject) {
  fileDiv.textContent = 
  fileObject.relPath.substring(1 + fileObject.relPath.lastIndexOf('\\'));
}

function addRelPathToFileObject(fileDiv, fileObject) {
  fileDiv.dataset.relPath = fileObject.relPath;
}

function addChildrenToFileObject(fileDiv, fileObject) {
  fileDiv.dataset.children = JSON.stringify(fileObject.children);
}

function indentFileDiv(fileDiv, parent) {
  let currentIndention = parent.style.left.replace(/[^0-9.]/g, '');
  if (currentIndention === '') {
    currentIndention = 0;
  }
  fileDiv.style.left = (parseInt(currentIndention) + fileTreeIndentionInt) + 'px';
}

function createFolderChildren(folder, cleanedFileString, children) {
  for (const child of children) {
    const fileDiv = document.createElement('div');
    nameFileDiv(fileDiv, child);
    addRelPathToFileObject(fileDiv, child);
    addChildrenToFileObject(fileDiv, child);
    if (child.children.length > 0) {
      initFolder(fileDiv);
    }
    else {
      initFile(fileDiv);
    }
    classifyFileDiv(fileDiv, folder, child, cleanedFileString);
    fileDiv.addEventListener('click', fileDivClicked);
    indentFileDiv(fileDiv, folder);
    folder.after(fileDiv);
  }
}

function createFileEditorDiv() {
  const fileEditorDiv = document.createElement('div');
  fileEditorDiv.id = 'fileEditorDiv';
  document.body.append(fileEditorDiv);
}

function destroyFileEditorDiv(fileEditorDiv) {
  fileEditorDiv.remove();
}

function displayFile(fileText, fileEditorDiv) {
  fileEditorDiv.textContent = fileText;
}

function openFile(fileDiv) {
  let fileEditorDiv = document.querySelector('#fileEditorDiv');
  if (fileEditorDiv) {
    destroyFileEditorDiv(fileEditorDiv);
  }
  createFileEditorDiv();
  fileEditorDiv = document.querySelector('#fileEditorDiv'); 
  const fileName = cleanFileDivString(fileDiv.textContent);
  const fileText = fileName; // fetchFileFromServer();
  displayFile(fileText, fileEditorDiv);
}

function expandFolder(folder, cleanedFileString, children) {
  createFolderChildren(folder, cleanedFileString, children);
  folder.textContent = collapseSymbol + ' ' + cleanedFileString + ' ' + expandedFolderSymbol;
  folder.dataset.expanded = 'true';
}

function fileDivClicked(event) {
  const cleanedFileString = cleanFileDivString(this.textContent);
  const children = JSON.parse(this.dataset.children);
  if (children.length > 0) {
    if (this.dataset.expanded === 'true') {
      collapseFolder(this, cleanedFileString);
    }
    else {  
      expandFolder(this, cleanedFileString, children);
    }
  }
  else {
    openFile(this);
  }
}

function classifyFileDiv(fileDiv, parent = null, fileObject = null, cleanedFileString = null) {
  fileDiv.className = 'fileDiv';
  if (fileObject) {
    fileDiv.classList.add(...parent.classList);
  }
  if (cleanedFileString) {
    fileDiv.classList.add(cleanedFileString);
  }
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