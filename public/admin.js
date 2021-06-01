"use strict";

(function () {
  const UI = new firebaseui.auth.AuthUI(firebase.auth());

  const uiConfig = {
    callbacks: {
      // signInSuccessWithAuthResult: confirmSignIn,
      uiShown: () => {
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID
    ],
  };

  window.addEventListener("load", init);

  function init() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        confirmSignIn(user);
      } else {
        UI.start('#firebaseui-auth-container', uiConfig);
      }
    });

    id("back").addEventListener("click", () => {
      window.history.back();
    });
    id("home").addEventListener("click", () => {
      window.history.back();
    });

    id("back-to-login").addEventListener("click", () => {
      signOut();
      goToSignIn();
    });

    id("request").addEventListener("click", requestAdmin);

    enableTools();
  }

  function toggleView() {
    id("admin-sight").classList.toggle("hidden")
    id("tool-app").classList.toggle("hidden");
    id("tool-app").classList.toggle("flex");
  }

  function enableTools() {
    id("exitTools").addEventListener("click", () => {
      hideAllTools();
      toggleView();

      if (!id("add").classList.contains("hidden")) {
        id("add").classList.add('hidden');
      }
    });

    enableRequestManager();
    enableClassManager();
  }

  function enableRequestManager() {
    id("bell").addEventListener("click", () => {
      id("requests").classList.remove("hidden");
      toggleView();
    });
    setUpRequestDatabase();
  }

  function enableClassManager() {
    id("class-launch").addEventListener("click", () => {
      id("class-tool").classList.remove("hidden");
      toggleView();
    });

    setUpAddButton(addANewClass);
    firebase.database().ref("class").on("child_added", snapshot => {
      let data = snapshot.toJSON();
    });
  }

  function addANewClass() {
    console.log("HELLO");
  }

  function setUpAddButton(callback) {
    id("add").classList.remove("hidden");
    id("add").addEventListener("click", callback);
  }

  function hideAllTools() {
    for (let child of id("tool-app").children) {
      if (child.id !== "tool-buttons") {
        if (!child.classList.contains("hidden")) {
          child.classList.add("hidden");
        }
      }
    }
  }

  function setUpRequestDatabase() {
    firebase.database().ref("request/").on("child_added", (snapshot) => {
      let uid = snapshot.key;
      snapshot = snapshot.toJSON();
      id("requests").appendChild(genRequest(snapshot, uid));
    });

    firebase.database().ref("request/").on("child_removed", snapshot => {
      id(snapshot.key).remove();
    });
  }

  function requestAdmin() {
    const user = firebase.auth().currentUser;

    firebase.database().ref("request/" + user.uid).set({
      "name": user.displayName,
      "email": user.email,
      "verified": user.emailVerified
    });
  }

  function signOut() {
    firebase.auth().signOut();
  }

  function error() {
    id("err").classList.remove("hidden");
    id("err").classList.add("flex");
    id("signin").classList.add("hidden");
  }

  function goToSignIn() {
    if (!id("err").classList.contains("hidden")) {
      id("err").classList.add("hidden");
      id("err").classList.remove("flex");
    }
    if (id("signin").classList.contains("hidden")) {
      id("signin").classList.remove("hidden")
    }

    if (!id("admin-sight").classList.contains("hidden")) {
      id("admin-sight").classList.add("hidden")
    }
    UI.start('#firebaseui-auth-container', uiConfig);
  }

  function confirmSignIn(user) {
    firebase.database().ref(`users/${user.uid}/access`).once("value", snapshot => {
      if (snapshot.exists()){
        const userData = firebase.database().ref("users/" + user.uid);
        userData.on("value", snapshot => {
          let data = snapshot.toJSON();
          if (!data.access) {
            error();
          } else {
            goToAdmin();
          }
        });
      } else {
        firebase.database().ref('users/' + user.uid).set({
          "access": false
        });
        error();
      }
   });
  }

  function goToAdmin() {
    if (!id("err").classList.contains("hidden")) {
      id("err").classList.add("hidden");
      id("err").classList.remove("flex");
    }
    if (!id("signin").classList.contains("hidden")) {
      id("signin").classList.add("hidden")
    }

    if (id("admin-sight").classList.contains("hidden")) {
      id("admin-sight").classList.remove("hidden")
    }

    const user = firebase.auth().currentUser;
    id("user-name").textContent = "Hello " + user.displayName;
  }

  /**
   * Generates a new request:
   *   <section>
   *     <p>Name: Daniel Gorbatov</p>
   *     <p>Email: dzgorbatov@gmail.com</p>
   *     <p>Verified: True</p>
   *     <img src="img/white-heavy-check-mark.svg" alt="check mark">
   *     <img src="img/cancel.svg" alt="cancel">
   *   </section>
   * @param {Object} userInfo - the info of the user
   * @returns {Object} - the user container
   */
  function genRequest(userInfo, uid) {
    let request = gen("section");

    request.appendChild(generateText("Name: " + userInfo.name));
    request.appendChild(generateText("Email: " + userInfo.email));
    request.appendChild(generateText("Verified: " + userInfo.verified));

    let checkMark = gen("img");
    checkMark.src = "img/white-heavy-check-mark.svg";
    checkMark.alt = "check mark";
    checkMark.addEventListener("click", confirmRequest);
    request.appendChild(checkMark);

    let cancel = gen("img");
    cancel.src = "img/cancel.svg";
    cancel.alt = "cancel";
    cancel.addEventListener("click", rejectRequest);
    request.appendChild(cancel);

    request.setAttribute("id", uid);
    return request;
  }

  function confirmRequest() {
    removeRequest(this.parentNode.id);

    var updates = {};
    updates["users/" + this.parentNode.id + "/access"] = true;

    console.log(updates);
    return firebase.database().ref().update(updates);
  }

  function rejectRequest() {
    removeRequest(this.parentNode.id);
  }

  function removeRequest(uid) {
    firebase.database().ref("request/" + uid).remove();
  }

  /**
   * Generates a new p tag.
   * @param {String} textValue - the text that will occupy the p tag
   * @returns {Object} - the new p tag
   */
  function generateText(textValue) {
    let text = gen("p");
    text.textContent = textValue;
    return text;
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();