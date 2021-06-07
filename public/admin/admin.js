"use strict";

(function () {
  window.addEventListener("load", init);

  function init() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        confirmSignIn(user);
      } else {
        window.location.href = "../login/login.html";
      }
    });

    id("back").addEventListener("click", goBack);
    id("home").addEventListener("click", goBack);

    id("back-to-login").addEventListener("click", goToLogin);

    id("request").addEventListener("click", requestAdmin);
  }

  function enableTools() {
    id("exitTools").addEventListener("click", exitTools);

    enableRequestManager();
    enableClassManager();
    enableSchoolManager();
    enableAboutMeManager();
    enableLangManager();
  }

  /*********************************************************************/
  /************************* Login Manager *****************************/
  /*********************************************************************/
  function error() {
    id("err").classList.remove("hidden");
    id("err").classList.add("flex");
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

  /*********************************************************************/
  /************************* About Me Manager **************************/
  /*********************************************************************/
  function enableAboutMeManager() {
    id("about-me-launch").addEventListener("click", launchAboutMeTool);

    id("reset-about-me").addEventListener("click", () => {
      firebase.database().ref("about-me/text").on("value", snapshot => {
        id("about-me-tool").children[0].children[0].value = snapshot.toJSON();
      });
    });

    id("save-about-me").addEventListener("click", () => {
      var updates = {};
      updates["about-me/hidden"] = id("hide-true").checked;
      updates["about-me/text"] = id("about-me-tool").children[0].children[0].value;
      return firebase.database().ref().update(updates);
    })
  }

  function launchAboutMeTool() {
    id("about-me-tool").classList.remove("hidden");
    toggleView();

    firebase.database().ref("about-me/text").on("value", snapshot => {
      id("about-me-tool").children[0].value = snapshot.toJSON();
    });
  }

  /*********************************************************************/
  /************************* School Manager ****************************/
  /*********************************************************************/
  function enableSchoolManager() {
    id("school-launch").addEventListener("click", launchSchoolTool);
    id("exit-school-form").addEventListener("click", addNewSchoolToggle);

    qs("#new-school-form form").addEventListener("submit", form => {
      form.preventDefault();
      if (id(id("school-name").value)) {
        //TODO:
        console.error("ACTIVATE ERROR");
      } else {
        firebase.database().ref('school/' + id("school-name").value).set({
          "color": id("color").value,
        });
        addNewSchoolToggle();
      }
    });

    firebase.database().ref("school").on("child_added", snapshot => {
      let data = snapshot.toJSON();
      id("school-view").appendChild(genSchool(data.color, snapshot.key));

      let newSchoolOption = gen("option");
      newSchoolOption.value = snapshot.key;
      newSchoolOption.textContent = snapshot.key;
      newSchoolOption.id = snapshot.key + "-option";

      id("uni").appendChild(newSchoolOption);
    });

    firebase.database().ref("school").on("child_removed", snapshot => {
      id(snapshot.key).remove();
      id(snapshot.key + "-option").remove();
    });
  }

  function launchSchoolTool() {
    id("school-tool").classList.remove("hidden");
    toggleView();
    setUpAddButton(addNewSchoolToggle);
  }

  function addNewSchoolToggle() {
    id("new-school-form").classList.toggle("hidden");
    id("new-school-form").classList.toggle("flex");
    id("school-view").classList.toggle("hidden");
    qs("#new-school-form form").reset();
  }

  /**
   * Creates a new container for a school.
   *
   * <section>
   *  <p>Name: PSU</p>
   *  <p>School Color: #657</p>
   *  <div class="hexColor"></div>
   *  <img src="../img/cancel.svg" alt="cancel">
   * </section>
   * @param {String} color - the school color
   * @param {String} name - the school name
   * @returns {Object} - the container object
   */
  function genSchool(color, name) {
    let newSchool = gen("section");

    newSchool.appendChild(generateText("Name: " + name));
    newSchool.appendChild(generateText("School Color Hex: " + color));

    let colorPreview = gen("div");
    colorPreview.classList.add("hexColor");
    colorPreview.style.backgroundColor = color;

    newSchool.appendChild(colorPreview);

    let cancel = gen("img");
    cancel.src = "../img/cancel.svg";
    cancel.alt = "cancel";
    cancel.addEventListener("click", removeSchool);
    newSchool.appendChild(cancel);

    newSchool.setAttribute("id", name);
    return newSchool;
  }

  function removeSchool() {
    firebase.database().ref('school/' + this.parentNode.id).remove();
  }

  /*********************************************************************/
  /************************* Class Manager *****************************/
  /*********************************************************************/

  function launchClassTool() {
    id("class-tool").classList.remove("hidden");
    toggleView();
    setUpAddButton(addANewClassToggle);
  }

  function enableClassManager() {
    id("class-launch").addEventListener("click", launchClassTool);
    id("exitClassForm").addEventListener("click", addANewClassToggle);

    qs("#new-class-form form").addEventListener("submit", form => {
      form.preventDefault();

      if (id(id("course-num").value)) {
        //TODO:
        console.error("ACTIVATE ERROR");
      } else {
        firebase.database().ref('class/' + id("course-num").value).set({
          "done": id("done").value === "true",
          "name": id("name").value,
          "university": id("uni").value,
          "instructor": id("instructor").value,
          "website": id("website").value
        });

        addANewClassToggle();
      }
    });

    firebase.database().ref("class").on("child_added", snapshot => {
      let data = snapshot.toJSON();
      id("class-view").appendChild(genClass(data, snapshot.key));
    });

    firebase.database().ref("class").on("child_removed", snapshot => {
      id(snapshot.key).remove();
    });
  }

  function genClass(classInfo, id) {
    let newClass = gen("section");

    newClass.appendChild(generateText("Name: " + classInfo.name));
    newClass.appendChild(generateText("Course Num: " + id));
    newClass.appendChild(generateText("University: " + classInfo.university));
    newClass.appendChild(generateText("Done: " + classInfo.done));
    newClass.appendChild(generateText("Instructor: " + classInfo.instructor));

    let website = gen("a");
    website.href = classInfo.website;
    website.textContent = "Course Website";

    newClass.appendChild(website);

    let cancel = gen("img");
    cancel.src = "../img/cancel.svg";
    cancel.alt = "cancel";
    cancel.addEventListener("click", removeClass);
    newClass.appendChild(cancel);

    newClass.setAttribute("id", id);
    return newClass;
  }

  function removeClass() {
    firebase.database().ref('class/' + this.parentNode.id).remove();
  }

  function addANewClassToggle() {
    id("new-class-form").classList.toggle("hidden");
    id("new-class-form").classList.toggle("flex");
    id("class-view").classList.toggle("hidden");
    qs("#new-class-form form").reset();
  }

  /*********************************************************************/
  /************************* Request Manager ***************************/
  /*********************************************************************/
  function enableRequestManager() {
    id("bell").addEventListener("click", launchRequestTool);
    setUpRequestDatabase();
  }

  function launchRequestTool() {
    id("requests").classList.remove("hidden");
    toggleView();
  }

  function requestAdmin() {
    const user = firebase.auth().currentUser;

    firebase.database().ref("request/" + user.uid).set({
      "name": user.displayName,
      "email": user.email,
      "verified": user.emailVerified
    });
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
    checkMark.src = "../img/white-heavy-check-mark.svg";
    checkMark.alt = "check mark";
    checkMark.addEventListener("click", confirmRequest);
    request.appendChild(checkMark);

    let cancel = gen("img");
    cancel.src = "../img/cancel.svg";
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
    return firebase.database().ref().update(updates);
  }

  function rejectRequest() {
    removeRequest(this.parentNode.id);
  }

  function removeRequest(uid) {
    firebase.database().ref("request/" + uid).remove();
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

  /*********************************************************************/
  /************************* Prog Lang Manager *************************/
  /*********************************************************************/

  function enableLangManager() {
    id("prog-lang-launch").addEventListener("click", launchLangTool);
    id("exit-lang-form").addEventListener("click", addANewLangToggle);

    qs("#new-lang-form form").addEventListener("submit", form => {
      form.preventDefault();

      if (id(id("lang-name").value)) {
        //TODO:
        console.error("ACTIVATE ERROR");
      } else {
        firebase.database().ref("lang/" + id("lang-name").value).set({
          "url": id("lang-url").value
        });

        addANewLangToggle();
      }
    });

    firebase.database().ref("lang/").on("child_added", snapshot => {
      let data = snapshot.toJSON();
      id("prog-lang-view").appendChild(genLang(data, snapshot.key));
    });

    firebase.database().ref("lang/").on("child_removed", snapshot => {
      id(snapshot.key).remove();
    });
  }

  function launchLangTool() {
    id("prog-lang-tool").classList.remove("hidden");
    toggleView();
    setUpAddButton(addANewLangToggle);
  }

  function genLang(langInfo, id) {
    let newLang = gen("section");

    newLang.appendChild(generateText("Name: " + id));
    newLang.appendChild(generateText("URL: " + langInfo.url));

    let website = gen("img");
    website.src = langInfo.url;
    website.alt = id;

    newLang.appendChild(website);

    let cancel = gen("img");
    cancel.src = "../img/cancel.svg";
    cancel.alt = "cancel";
    cancel.addEventListener("click", removeLang);
    newLang.appendChild(cancel);

    newLang.setAttribute("id", id);
    return newLang;
  }

  function removeLang() {
    firebase.database().ref('lang/' + this.parentNode.id).remove();
  }

  function addANewLangToggle() {
    id("new-lang-form").classList.toggle("hidden");
    id("new-lang-form").classList.toggle("flex");
    id("prog-lang-view").classList.toggle("hidden");
    qs("#new-lang-form form").reset();
  }

  /*********************************************************************/
  /************************* Helper Functions **************************/
  /*********************************************************************/

  function exitTools() {
    hideAllTools();
    toggleView();
    resetAddButton();

    if (!id("add").classList.contains("hidden")) {
      id("add").classList.add('hidden');
    }
  }

  /**
   * This function clones the add button and replaces it.
   * The reason we need to do this is to clear all event listeners
   * of the button.
   */
  function resetAddButton() {
    let oldAddButton = id("add");
    var newAddButton = oldAddButton.cloneNode(true);
    oldAddButton.parentNode.replaceChild(newAddButton, oldAddButton);
  }

  function goToLogin() {
    firebase.auth().signOut();
    window.location.href = "../login/login.html";
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

  function goBack() {
    window.location.href = "/index.html";
  }

  /**
   * Toggles view from tools to main admin sight
   */
  function toggleView() {
    id("admin-sight").classList.toggle("hidden")
    id("tool-app").classList.toggle("hidden");
    id("tool-app").classList.toggle("flex");
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

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

})();