var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var socket_io = require('socket.io')

var session = require('express-session')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
var passportRouter = require('./routes/passport')

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
app.use(session({secret: 'mySecretKey'
  , store: sessionStore
}))

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(function (user, done) {
  db.users.findById(user, function (err, user) {
    done(null, user)
  })
})

passport.use(new LocalStrategy({
    passReqToCallback: true,
    usernameField: 'login',
    passwordField: 'password'
  },
  function (req, username, password, done) {
    db.users.findByUsername({username: username}, function (err, user) {
      if (err) { return done(err) }
      if (!user) { return done(null, false, req.flash('message', 'Invalid username or password')) }
      if (user.password != password) { return done(null, false, req.flash('message', 'Invalid username or password')) }
      return done(null, user)
    })
  }
))

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
  io.emit('chat message', 'a user ' + nickNames[socket.id] + ' connected')

  socket.on('chat message', function (msg) {
    io.emit('chat message', nickNames[socket.id] + ': ' + msg)
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
