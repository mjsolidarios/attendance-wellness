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
  var coursesDBString = "https://attdnc-app.firebaseio.com/courses/";
  var usersDBString = "https://attdnc-app.firebaseio.com/users/root/";

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
  app.active_class = null;
  app.stud_col_status = false;
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

  app.openDialog = function(name){
    var elementSelector = "#"+name;
    var d = Polymer.dom(document).querySelector(elementSelector);
    d.fit();
    d.open();
  };

  app.openToast = function(msg){
    app.$.toast.text = msg;
    app.$.toast.show();
  }

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
    app.openDialog("addStudentDiag");

    var studentAddOptionDiag = Polymer.dom(document).querySelector('#addStudentOptions');
    studentAddOptionDiag.close();
  };

  app.onSelectStudentAddingOption = function() {
    app.openDialog("addStudentOptions");
  };

  app.onChangeProfileImg = function() {
    app.openToast('Changing Profile Image');
  };

  app.onRemoveStudentDiag = function(e) {
    var deleteElement = e;
    var createElement = e.previousElementSibling;
    var viewElement = createElement.previousElementSibling;
    var target = viewElement.previousElementSibling.value;


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

    app.openDialog("removeStudentDiag");
  };

  app.removeStudent = function() {
    var studentID = Polymer.dom(document).querySelector('#student_id_to_remove').getAttribute("value");
    var studentsRef = new Firebase(studentsDBString + studentID);
    var recordsRef = new Firebase(recordsDBString + studentID);
    var membersRef = new Firebase(membersDBString + app.active_class);
    var membersRefChild = membersRef.child(studentID);

    studentsRef.remove();
    recordsRef.remove();
    membersRefChild.remove();

    app.openToast('Student record removed.')
  };

  app.onPowerOptions = function() {
    app.openDialog('powerOptions');
  };

  app.onAddCourseDiag = function(){
    app.openDialog('addCourseDiag');
  };

  app.onUpdateStudentList = function() {
    var studentIDInput = Polymer.dom(document).querySelector('#input_student_id').value;
    var studentNameInput = Polymer.dom(document).querySelector('#input_student_name').value;
    var studentFbId = Polymer.dom(document).querySelector('#input_student_fb').value;
    var studentHPInputVal = Polymer.dom(document).querySelector('#slider_hp').value;
    var studentLPInputVal = Polymer.dom(document).querySelector('#slider_lp').value;


    var studentIDInputVal = studentIDInput.toLowerCase();
    var studentNameInputVal = studentNameInput.toLowerCase();


    // Update student details and class membership
    var studentsRef = new Firebase(studentsDBString);
    var studentsRefChild = studentsRef.child(studentIDInputVal);
    var membersRef = new Firebase(membersDBString + app.active_class);
    var memberClassRef = membersRef.child(studentIDInputVal);
    var classStatusRef = new Firebase(studentsDBString + studentIDInputVal + "/" + app.active_class);

    studentsRefChild.set({
      "name": studentNameInputVal,
      "fbid": studentFbId,
      "profimg": "robot.jpg"
    });

    classStatusRef.child('hp').set(studentHPInputVal);
    classStatusRef.child('lp').set(studentLPInputVal);
    classStatusRef.child('xp').set(0);

    memberClassRef.set(true);

    app.openToast('Student added to the list.');

  };

  app.onUpdateCourseList = function(){
    var courseNumberInput = Polymer.dom(document).querySelector('#input_course_number').value;
    var courseDescVal = Polymer.dom(document).querySelector('#input_course_desc').value;
    var key = courseNumberInput.toLowerCase().replace(/\s/g, '');

    var coursesRef = new Firebase(coursesDBString + key);

    coursesRef.set({
      "description": courseDescVal,
      "title": courseNumberInput
    });

    var classListRef = new Firebase(usersDBString + "class_list");
    var classListChild = classListRef.child(key);

    classListChild.set(true);

    app.openToast('Course list updates.');

  };


  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.onViewRecord = function(e) {
    var target= e.previousElementSibling.getAttribute("value");

    // Set user's global active class
    app.active_class = target;
    var active_class_ref = new Firebase(usersDBString+"active_class");
    active_class_ref.set(target);

    // Add student collection element
    $("#student_collection").empty();
    var dynamicEl = document.createElement("student-collection");
    dynamicEl.setAttribute("member-location", "https://attdnc-app.firebaseio.com/members/"+app.active_class);
    $("#student_collection").append(dynamicEl);

    app.route="demo_list";
    app.scrollPageToTop();
  }


})(document);
