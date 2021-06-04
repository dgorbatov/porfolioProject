"use strict";

(function () {
  const DB = firebase.database().ref("class");

  window.addEventListener("load", init);

  function init() {

    id("email").addEventListener("click", () => {
      window.location.href = "mailto:dzgorbatov@gmail.com";
    });

    id("github").addEventListener("click", () => {
      window.location.href = "https://github.com/dgorbatov";
    });

    DB.on("child_added", (snapshot) => {
      console.log('HELLO');
      let data = snapshot.toJSON();

      id("class").appendChild(genClass(data, snapshot.key));
    });

    id("log-in").addEventListener("click", () => {
      console.log("UPDATE");
      window.location.href = "login/login.html";
    });
  }

  /**
   * Creates a new class container
   * @param {Object} data - the data of the new class
   * @returns {Object} - the new class container
   */
  function genClass(data, courseNum) {
    let section = gen("section");

    let courseName = gen("h3");
    console.log(courseNum);
    courseName.textContent = courseNum;
    section.appendChild(courseName);

    let courseInfo = gen("section");
    courseInfo.classList.add("info");

    courseInfo.appendChild(generateText("Name: " + data.name));
    courseInfo.appendChild(generateText("School: " + data.university));
    courseInfo.appendChild(generateText("Done: " + data.done));
    courseInfo.appendChild(generateText("Instructor: " + data.instructor));
    courseInfo.appendChild(generateText("Website: " + data.website));

    section.appendChild(courseInfo);

    firebase.database().ref("/school/" + data.university).on("value", snapshot => {
      section.style.backgroundColor = snapshot.toJSON().color;
    })

    return section;
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
   * Generates a new p tag.
   * @param {String} textValue - the text that will occupy the p tag
   * @returns {Object} - the new p tag
   */
  function generateText(textValue) {
    let text = gen("p");
    text.textContent = textValue;
    return text;
  }
})();