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
      let data = snapshot.toJSON();

     if (!data.done) {
        id("class").appendChild(genClass(data));
      } else {
        id("prev-class").appendChild(genClass(data));
      }
    });

    id("log-in").addEventListener("click", () => {
      console.log("UPDATE");
      window.location.href = "login.html";
    })
  }

  function genClass(data) {
    /*
      Example html class:
      <section class="uw">
        <p>CSE 154</p>
      </section>
     */
    let section = gen("section");
    let courseName = gen("p");

    courseName.textContent = data.name;

    section.appendChild(courseName);

    if (data.done) {
      // TODO: Expand institution availability
      if (data.university === "PSU") {
        section.classList.add("psu");
      } else if (data.university === "UW") {
        section.classList.add("uw");
      }
    }

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
})();