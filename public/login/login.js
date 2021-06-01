"use strict";

(function () {
  const UI = new firebaseui.auth.AuthUI(firebase.auth());
  let adminAccess = false;

  const uiConfig = {
    callbacks: {
      // signInSuccessWithAuthResult: confirmSignIn,
      uiShown: () => {
        document.getElementById('loader').style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: "admin/admin.html",
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
    UI.start('#firebaseui-auth-container', uiConfig);

    id("home").addEventListener("click", goBack);
  }

  function goBack() {
    window.location.href = "../index.html";
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }
})();