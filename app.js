// vendor libraries
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bcrypt = require('bcrypt-nodejs');
var ejs = require('ejs');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var moment = require('moment');

// custom libraries
// routes
var route = require('./route');
// model
var Model = require('./model');

var app = express();

passport.use(new LocalStrategy(function(username, password, done) {
   new Model.User({username: username}).fetch().then(function(data) {
      var user = data;
      if(user === null) {
         return done(null, false, {message: 'Invalid username or password'});
      } else {
         user = data.toJSON();
         if(!bcrypt.compareSync(password, user.password)) {
            return done(null, false, {message: 'Invalid password'});
         } else {
            if(user.active ==1){
               return done(null, user);
            }else{
               return done(null, false, {message: 'Please check your email to activate account'});
            }
         }
      }
   });
}));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
   new Model.User({username: username}).fetch().then(function(user) {
      done(null, user);
   });
});

app.set('port', process.env.PORT || 3124);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser());
app.use(session({secret: '48849084988429'}));
app.use(passport.initialize());
app.use(passport.session());

// GET Method for Home page
app.get('/', route.index);

// login page
app.get('/login', route.logIn);
// Check login
app.post('/login', route.getLoginPost);

// Register page
app.get('/register', route.getRegister);
// Save user details
app.post('/register', route.getRegisterPost);
app.get('/activate/:id', route.activateUser);

// Add new project
app.get('/addproject/:id', route.addProject);
app.post('/addproject', route.addProjectPost);

// Delete project
app.get('/deleteproject/:id', route.deleteproject);

// Edit Project
app.get('/editproject/:id', route.editproject);
app.post('/editproject', route.editprojectPost);

// logout
app.get('/logout', route.logOut);


/********************************/

/********************************/
// 404 not found
app.use(route.notFound404);

var server = app.listen(app.get('port'), function(err) {
   //if(err) throw err;

   var message = 'Server is running @ http://localhost:' + server.address().port;
   console.log(message);
});

