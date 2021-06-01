"use strict";

(function () {
  let adminAccess = false;

  window.addEventListener("load", init);

  function init() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        confirmSignIn(user);
      } else {
        window.location.href = "../login.html";
      }
    });

    id("back").addEventListener("click", goBack);
    id("home").addEventListener("click", goBack);

    id("back-to-login").addEventListener("click", goToLogin);

    id("request").addEventListener("click", requestAdmin);
  }

  function goBack() {
    window.location.href = "/index.html";
  }

  function goToLogin() {
    firebase.auth().signOut();
    window.location.href = "../login/login.html";
  }

  function toggleView() {
    id("admin-sight").classList.toggle("hidden")
    id("tool-app").classList.toggle("hidden");
    id("tool-app").classList.toggle("flex");
  }

  function enableTools() {
    id("exitTools").addEventListener("click", exitTools);

    enableRequestManager();
    enableClassManager();
  }

  function exitTools() {
    hideAllTools();
    toggleView();

    if (!id("add").classList.contains("hidden")) {
      id("add").classList.add('hidden');
    }
  }

  function enableRequestManager() {
    id("bell").addEventListener("click", launchRequestTool);
    setUpRequestDatabase();
  }

  function launchRequestTool() {
    id("requests").classList.remove("hidden");
    toggleView();
  }

  function enableClassManager() {
    id("class-launch").addEventListener("click", launchClassTool);


    firebase.database().ref("class").on("child_added", snapshot => {
      let data = snapshot.toJSON();
    });
  }

  function launchClassTool() {
    id("class-tool").classList.remove("hidden");
    toggleView();
    setUpAddButton(addANewClass);
  }

  function addANewClass() {
    id("new-class-form").classList.remove("hidden");
    id("class-view").classList.add("hidden");
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

  function error() {
    id("err").classList.remove("hidden");
    id("err").classList.add("flex");
    id("signin").classList.add("hidden");
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
            enableTools();
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

  function genClass(classInfo, id) {
    let newClass = gen("section");

    newClass.appendChild(generateText("Name: " + classInfo.name));
    newClass.appendChild(generateText("University: " + classInfo.university));
    newClass.appendChild(generateText("Done: " + classInfo.done));
    newClass.appendChild(generateText("Instructor: " + classInfo.instructor));

    let website = gen("a");
    website.href = classInfo.website;
    website.textContent = "Course Website";

    newClass.appendChild(website);

    let checkMark = gen("img");
    checkMark.src = "img/white-heavy-check-mark.svg";
    checkMark.alt = "check mark";
    checkMark.addEventListener("click", confirmRequest);
    newClass.appendChild(checkMark);

    let cancel = gen("img");
    cancel.src = "img/cancel.svg";
    cancel.alt = "cancel";
    cancel.addEventListener("click", rejectRequest);
    newClass.appendChild(cancel);

    newClass.setAttribute("id", id);
    return newClass;
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