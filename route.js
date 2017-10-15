// vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport("SMTP",{
    service: 'Gmail',
    auth: {
        user: "vanithasundaramg@gmail.com",
        pass: "SecureMe"
    }
});
console.log('SMTP Configured');
// custom library
// model
var Model = require('./model');

// Home page
var index = function(req, res, next) {
   if(!req.isAuthenticated()) {
      res.redirect('/login');
   } else {

      var user = req.user;
      
      if(user !== undefined) {
         user = user.toJSON();
      }

      new Model.Project().fetchAll({userid: user.userId}).then(function(project_info) {
          var project_data=project_info.toJSON();
          res.render('index', {title: 'Home', data: {user:user,project :project_data,moment: moment}});
        });
      
   }
};

// Login page
var logIn = function(req, res, next) {
   if(req.isAuthenticated()) res.redirect('/');
   res.render('login', {title: 'Login form'});
};

// Check user account
var getLoginPost = function(req, res, next) {
   passport.authenticate('local', { successRedirect: '/',
                          failureRedirect: '/login'}, function(err, user, info) {
      if(err) {
         return res.render('login', {title: 'Login Form', errorMessage: err.message});
      } 

      if(!user) {
         return res.render('login', {title: 'Login Form', errorMessage: info.message});
      }
      return req.logIn(user, function(err) {
         if(err) {
            return res.render('login', {title: 'Login Form', errorMessage: err.message});
         } else {
            return res.redirect('/');
         }
      });
   })(req, res, next);
};

// Register form
var getRegister = function(req, res, next) {
   if(req.isAuthenticated()) {
      res.redirect('/');
   } else {
      res.render('register', {title: 'Registeration'});
   }
};

// Save user details
var getRegisterPost = function(req, res, next) {
   var user = req.body;
   //console.log(req.body);
   var usernamePromise = null;
   usernamePromise = new Model.User({username: user.username}).fetch();

   return usernamePromise.then(function(model) {
      if(model) {
         res.render('register', {title: 'Registeration', errorMessage: 'username already exists'});
      } else {
         
         var password = user.password;
         var hash = bcrypt.hashSync(password);

         var registerUser = new Model.User({username:user.username,name:user.name,password:hash});

          registerUser.save().then(function(model) {
            console.log("User details : ", model.attributes.userId);
            var message = {
              from : 'Vanitha <vanithasundaramg@gmail.com>',
              to : user.username,
              subject : 'Account Activation Email',
              text : 'Hello',
              html : '<p>Your account has been registered successfully. Please <a href=http://localhost:3124/activate/'+model.attributes.userId+'>click here</a> to activate your account</p>'
            };
            console.log('Sending Mail');
            transporter.sendMail(message, function(error){
              if(error){
                  console.log('Error occured');
                  console.log(error.message);
                  return;
              }
              console.log('Message sent successfully!');
            });
            getLoginPost(req, res, next);
         });	
      }
   });
};
// Activate User Acount

var activateUser = function(req, res, next) {
  var activateUser = new Model.User({userId:req.params.id,active: 1});
    activateUser.save().then(function(model) {
      return res.redirect('/');
    });
};

// add new project form
var addProject = function(req, res, next) {
  if(req.isAuthenticated()){
    res.render('addproject', {title: 'Add New Project',userid:req.params.id});
   }else{
     res.redirect('/');
   }
};

// Add new project
var addProjectPost = function(req, res, next) {
  if(req.isAuthenticated()){
    var project = req.body;
    var newProject = new Model.Project({name:project.name,description:project.description,start_date:project.start_date,end_date:project.end_date,userid: project.userid});
    newProject.save().then(function(model) {
      return res.redirect('/');
    });
  }else{
    res.redirect('/');
  }
};


//Get edit project details by id
var editproject = function(req, res, next) {
  if(req.isAuthenticated()) {
    var projectPromise = null;
    console.log("Id :",req.params.id);
    projectPromise = new Model.Project({id: req.params.id}).fetch();
    return projectPromise.then(function(model) {
      res.render('editproject', {title: 'Edit Project', data: model,moment: moment});
    });
  } 
};

// Edit project details
var editprojectPost = function(req, res, next) {
  if(req.isAuthenticated()){
    var project = req.body;
    var newProject = new Model.Project({name:project.name,description:project.description,start_date:project.start_date,end_date:project.end_date,id: project.id});
    newProject.save().then(function(model) {
      return res.redirect('/');
    });
  }else{
    res.redirect('/');
  }
};

// Delete project details
var deleteproject = function(req, res, next) {
  if(req.isAuthenticated()) {
    new Model.Project({id: req.params.id})
    .destroy()
    .then(function(model) {
      return res.redirect('/');
    });
  } 
};
// sign out
var logOut = function(req, res, next) {
   if(!req.isAuthenticated()) {
      notFound404(req, res, next);
   } else {
      req.logout();
      res.redirect('/login');
   }
};

// 404 not found
var notFound404 = function(req, res, next) {
   res.status(404);
   res.render('404', {title: '404 Not Found'});
};


// export functions
/**************************************/
// Home page
module.exports.index = index;

// Login page
module.exports.logIn = logIn;
// Check login
module.exports.getLoginPost = getLoginPost;

// Register page
module.exports.getRegister = getRegister;
// Save user details
module.exports.getRegisterPost = getRegisterPost;
//Activate user
module.exports.activateUser = activateUser;

// Project
module.exports.addProject = addProject;
module.exports.addProjectPost = addProjectPost;
//Delete project
module.exports.deleteproject = deleteproject;
//Edit project
module.exports.editproject = editproject;
module.exports.editprojectPost = editprojectPost;

// Logout
module.exports.logOut = logOut;

// 404 not found
module.exports.notFound404 = notFound404;
