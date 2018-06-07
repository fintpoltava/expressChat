var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var socket_io = require('socket.io')

var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var passportRouter = require('./routes/passport')

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://mongodb1/expresschat')
  .then(() =>  console.log('MongoDB connection succesful'))
  .catch((err) => console.error(err))

var db = require('./db')
var flash = require('connect-flash')

var app = express()



// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Socket.io
var io = socket_io()
var passportSocketIo = require('passport.socketio')

var MemoryStore = require('memorystore')(session)
var sessionStore =  new MemoryStore;

io.use(passportSocketIo.authorize({
  key: 'connect.sid',
  secret: 'mySecretKey',
  store: sessionStore,
  passport: passport,
  cookieParser: cookieParser
}));

app.io = io

app.use(flash())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
  secret: 'mySecretKey',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}))

var User = require('./models/User');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// passport.serializeUser(function (user, done) {
//   done(null, user.id)
// })
//
// passport.deserializeUser(function (user, done) {
//   db.users.findById(user, function (err, user) {
//     done(null, user)
//   })
// })

// passport.use(new LocalStrategy({
//     passReqToCallback: true,
//     usernameField: 'login',
//     passwordField: 'password'
//   },
//   function (req, username, password, done) {
//     db.users.findByUsername({username: username}, function (err, user) {
//       if (err) { return done(err) }
//       if (!user) { return done(null, false, req.flash('message', 'Invalid username or password')) }
//       if (user.password != password) { return done(null, false, req.flash('message', 'Invalid username or password')) }
//       return done(null, user)
//     })
//   }
// ))

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: '192470968215-pnuj925kr4lfaur5n6cq7muoirt5scg1.apps.googleusercontent.com',
    clientSecret: 'grw4r77LIDx254qSZzwkX_3M',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    User.findOne({ google: {id:profile.id} }, function (err, user) {
      if (err) { return done(err) }
      if (!user) {
        user = new User({
          username: profile.displayName+profile.id,
          displayName: profile.displayName,
          password: profile.displayName+profile.id,
          google: {id: profile.id }
        });
        user.save(function(err) {
          if (err) console.log(err);
          return done(err, user);
        });
      }
      console.log(user)
      return done(err, user);
    });
  }
));

app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/', passportRouter)
app.use('/users', usersRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

var nickNames = []

// socket.io events
io.on('connection', function (socket) {

  nickNames[socket.id] = socket.request.user.displayName
  var data = {
    msg: 'connected',
    user: nickNames[socket.id],
    date: new Date()
  }
  io.emit('chat message', data)

  var uniqueNickNames = [];

  for(var key in nickNames)
  {
    if (uniqueNickNames.indexOf(nickNames[key]) < 0) {
      uniqueNickNames.push(nickNames[key]);
    }
  }

  console.log(uniqueNickNames);
  io.emit('chat users', uniqueNickNames)

  socket.on('chat message', function (msg) {
    var tmp = data
    tmp.msg = msg
    io.emit('chat message', tmp )
  })

  socket.on('change name', function (newName) {
    var oldName = nickNames[socket.id]
    nickNames[socket.id] = newName

    io.emit('chat message', oldName + ' change name to ' + newName)
  })

  socket.on('disconnect', function () {
    console.log('user disconnected')
  })

})

module.exports = app
