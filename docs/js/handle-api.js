gapi.load("client:auth2", start);

// need to hide as secret in github repo (restricted keys)
const API_KEY = "AIzaSyD8lQGXDe3ayR4t4yqCUrIsnVLjD9IhY30";

// need to be web application with origin url added
// need to setup localhost
// enable apis, setup request screen
const CLIENT_ID = "740760182006-9v4fsvhk222ts9lvlsbpqaq4aovcpcej.apps.googleusercontent.com";
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest", "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
const SCOPES = "https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/calendar";

var authorizeButton = document.getElementById("authorize-button");
var signoutButton = document.getElementById("signout-button");
var executeButton = document.getElementById("execute-button");



function start() {
  gapi.client.init({
    "apiKey": API_KEY,
    "discoveryDocs": DISCOVERY_DOCS,
    "clientId": CLIENT_ID,
    "scope": SCOPES,
  }).then(function () {

    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleSignin;
    signoutButton.onclick = handleSignout;

  }).catch(function (reason) {
    console.log(reason);
  });
};


function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    executeButton.style.display = "block";

  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
    executeButton.style.display = "none";
  }
}


function handleSignin() {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignout() {
  gapi.auth2.getAuthInstance().signOut();
}