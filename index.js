/* global Vue, VueRouter, axios */

var LoginPage = {
  template: "#login-page",
  data: function() {
    return {
      uid: ""
    };
  },
  created: function() {},
  methods: {},
  computed: {}
};

var SignInRedirectPage = {
  template: "#sign-in-redirect-page",
  data: function() {
    return {};
  },
  created: function() {
    var uid = firebase.auth().currentUser.uid;
    router.push("/" + uid + "/home");
    console.log(uid);
  },
  methods: {},
  computed: {}
};

var HomePage = {
  template: "#home-page",
  data: function() {
    return {
      uid: this.$route.params.id,
      displayName: "",
      profiles: []
    };
  },
  created: function() {
    var profiles = firebase.database().ref("/profiles/");
    var arr = [];

    profiles.on("value", snap => {
      snap.forEach(function(child) {
        var obj = [];
        var key = child.key;
        obj = child.exportVal();
        obj["userId"] = key;
        arr.push(obj);
      });
      this.profiles = arr;
      this.displayName = firebase.auth().currentUser.displayName;
    });
  },
  methods: {
    test: function() {
      console.log(this.profiles);
    }
  },
  computed: {}
};

var UpdateProfilePage = {
  template: "#update-profile-page",
  data: function() {
    return {
      uid: this.$route.params.id,
      age: "",
      test: "",
      bday: "",
      gender: "",
      orientation: "",
      bio: ""
    };
  },
  created: function() {
    firebase
      .database()
      .ref("/user-profiles/")
      .orderByChild("uid")
      .equalTo(this.uid)
      .once("value")
      .then(function(snapshot) {
        if (snapshot.val() == null) {
          console.log("Making new profile");
          document.getElementById("profile-form").id = "profile-form new";
        } else {
          console.log("Already has a profile");
          // updateUserProfile(params);
          document.getElementById("profile-form").id = "profile-form update";
        }
      });
  },
  methods: {
    hasProfilePic: function() {
      var file = document.getElementById("userProfilePic").files[0];
      if (file) {
        // console.log(file.name);
        this.uploadProfilePic(file);
        return true;
      } else {
        console.log("No file selected yet");
        return false;
      }
    },

    uploadProfilePic: function(file) {
      // Create a root reference
      var storageRef = firebase.storage().ref();

      // Create a reference to 'images/file'
      var fileImagesRef = storageRef.child("images/profilePics/" + this.uid);

      //save the picture to storage
      fileImagesRef.put(file).then(function(snapshot) {
        //get downloadURL, and then create firebase/database slot to get the pic
        var progress = 0;
        while (progress < 100) {
          document
            .getElementById("upload-progress")
            .setAttribute("style", "width: " + progress + "%");
          progress++;
        }
        fileImagesRef.getDownloadURL().then(function(url) {
          document.getElementById("profile-pic").src = url;
        });
        console.log(snapshot);
      });
    },

    profileInfo: function() {
      var params = {
        age: this.age,
        bday: this.bday,
        gender: this.gender,
        orientation: this.orientation,
        bio: this.bio
      };
      if (document.getElementById("profile-form update")) {
        this.updateProfile(params);
      } else {
        this.createProfile(params);
      }
      // console.log(test);
    },

    updateProfile: function(params) {
      var profileId = firebase
        .database()
        .ref("/user-profiles/")
        .orderByChild("uid")
        .equalTo(this.uid);

      profileId.once("value", function(snapshot) {
        snapshot.forEach(function(child) {
          console.log(child.val().profileId);
          console.log(params);

          var updates = {};
          updates["/profiles/" + child.val().profileId] = params;

          return firebase
            .database()
            .ref()
            .update(updates);
        });
      });
    },

    createProfile: function(params) {
      var newProfileKey = firebase
        .database()
        .ref()
        .child("profiles")
        .push(params).key;

      var userProfileData = { profileId: newProfileKey, uid: this.uid };
      var newUserProfileKey = firebase
        .database()
        .ref()
        .child("user-profiles")
        .push(userProfileData).key;
      console.log(newUserProfileKey);
    },

    checkProfileExists: function(params) {
      // console.log(params);
    },

    setOrient: function() {
      var orients = document.getElementsByName("orientation");
      var trueOrient = "";

      orients.forEach(function(orient) {
        if (orient.checked === true) {
          trueOrient = orient.value;
          // console.log(trueOrient);
        }
      });
      this.orientation = trueOrient;
    },

    setGender: function() {
      var genders = document.getElementsByName("gender");
      var trueGender = "";

      genders.forEach(function(gender) {
        if (gender.checked === true) {
          trueGender = gender.value;
          // console.log(trueGender);
        }
      });
      this.gender = trueGender;
    },

    changeOrientRadio: function() {
      var radio = document.getElementById("other-orientation-radio");
      radio.checked = true;
    },
    changeGenderRadio: function() {
      var radio = document.getElementById("other-gender-radio");
      radio.checked = true;
    }
  },
  computed: {}
};

var router = new VueRouter({
  routes: [
    { path: "/", component: LoginPage },
    { path: "/signInRedirect", component: SignInRedirectPage },
    { path: "/:id/updateProfile", component: UpdateProfilePage },
    { path: "/:id/home", component: HomePage }
  ],
  scrollBehavior: function(to, from, savedPosition) {
    return { x: 0, y: 0 };
  }
});

var app = new Vue({
  el: "#vue-app",
  router: router
});
