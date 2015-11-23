/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  var studentsDBString = "https://attdnc-app.firebaseio.com/students/";
  var recordsDBString = "https://attdnc-app.firebaseio.com/records/";
  var membersDBString = "https://attdnc-app.firebaseio.com/members/";
  var usersDBString = "https://attdnc-app.firebaseio.com/users/root/";

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
  app.active_class = null;
  // Sets app default base URL
  app.baseUrl = '/';
  if (window.location.port === '') { // if production
    // Uncomment app.baseURL below and
    // set app.baseURL to '/your-pathname/' if running from folder in production
    // app.baseUrl = '/polymer-starter-kit/';
  }

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  window.addEventListener('paper-header-transform', function(e) {
    var appName = Polymer.dom(document).querySelector('#mainToolbar .app-name');
    var middleContainer = Polymer.dom(document).querySelector('#mainToolbar .middle-container');
    var bottomContainer = Polymer.dom(document).querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    // appName max size when condensed. The smaller the number the smaller the condensed size.
    var maxMiddleScale = 0.50;
    var auxHeight = heightDiff - detail.y;
    var auxScale = heightDiff / (1 - maxMiddleScale);
    var scaleMiddle = Math.max(maxMiddleScale, auxHeight / auxScale + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onDataRouteClick = function() {
    var drawerPanel = Polymer.dom(document).querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

  app.onStudentAddClick = function() {
    var diag = Polymer.dom(document).querySelector('#addStudentDiag');
    diag.fit();
    diag.open();

    var studentAddOptionDiag = Polymer.dom(document).querySelector('#addStudentOptions');
    studentAddOptionDiag.close();
  };

  app.onSelectStudentAddingOption = function() {
    var diag = Polymer.dom(document).querySelector('#addStudentOptions');
    diag.fit();
    diag.open();
  };

  app.onChangeProfileImg = function() {
    app.$.toast.text = 'Changing Profile Image';
    app.$.toast.show();
  };

  app.onRemoveStudentDiag = function(e) {
    var deleteElement = e;
    var createElement = e.previousElementSibling;
    var viewElement = createElement.previousElementSibling;
    var target = viewElement.previousElementSibling.value;

    var diag = Polymer.dom(document).querySelector('#removeStudentDiag');
    var studentID = Polymer.dom(document).querySelector('#student_id_to_remove');
    var studentName = Polymer.dom(document).querySelector('#student_name_to_remove');

    // Set student id on dialog
    studentID.setAttribute("value", target);
    // Set student name on dialog
    var addDB = new Firebase(studentsDBString + target + '/name');
    addDB.on("value", function(snapshot) {
      studentName.innerHTML = snapshot.val() + "&apos;s";
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    // var student_name = e.
    diag.fit();
    diag.open();
  };

  app.removeStudent = function() {
    var studentID = Polymer.dom(document).querySelector('#student_id_to_remove').getAttribute("value");
    var studentsRef = new Firebase(studentsDBString + studentID);
    var recordsRef = new Firebase(recordsDBString + studentID);
    var membersRef = new Firebase(membersDBString + studentID);

    studentsRef.remove();
    recordsRef.remove();
    membersRef.remove();

    app.$.toast.text = 'Student record removed.';
    app.$.toast.show();
  };

  app.onPowerOptions = function() {
    var diag = Polymer.dom(document).querySelector('#powerOptions');
    diag.fit();
    diag.open();
  }

  app.onUpdateStudentList = function() {
    var studentIDInput = Polymer.dom(document).querySelector('#input_student_id').value;
    var studentNameInput = Polymer.dom(document).querySelector('#input_student_name').value;
    var studentFbId = Polymer.dom(document).querySelector('#input_student_fb').value;
    var studentHPInputVal = Polymer.dom(document).querySelector('#slider_hp').value;
    var studentLPInputVal = Polymer.dom(document).querySelector('#slider_lp').value;


    var studentIDInputVal = studentIDInput.toLowerCase();
    var studentNameInputVal = studentNameInput.toLowerCase();


    // Update student details and class membership
    var studentsRef = new Firebase(studentsDBString + studentIDInputVal);
    var membersRef = new Firebase(membersDBString + studentIDInputVal);
    var memberClassRef = membersRef.child(app.active_class);
    var classStatusRef = new Firebase(studentsDBString + studentIDInputVal + "/" + app.active_class);

    studentsRef.set({
      "name": studentNameInputVal,
      "fbid": studentFbId,
      "profimg": "robot.jpg"
    });

    classStatusRef.child('hp').set(studentHPInputVal);
    classStatusRef.child('lp').set(studentLPInputVal);
    classStatusRef.child('xp').set(0);

    memberClassRef.set(true);

    app.$.toast.text = 'Student added to the list.';
    app.$.toast.show();
  };

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.onViewRecord = function(e) {
    var target= e.previousElementSibling.getAttribute("value");

    // Set global active class
    app.active_class = target;
    var active_class_ref = new Firebase(usersDBString+"active_class");
    active_class_ref.set(target);

    app.scrollPageToTop();
  }


})(document);
