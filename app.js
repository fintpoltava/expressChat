var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var socket_io    = require( "socket.io" );

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Socket.io
var io           = socket_io();
app.io           = io;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var nickNames =  [] ;

// socket.io events
io.on('connection', function(socket){

  nickNames[socket.id] = 'Name' + parseInt(Object.keys(nickNames).length + 1);
  io.emit('chat message', 'a user '+ nickNames[socket.id] + ' connected');

  socket.on('chat message', function(msg){
    io.emit('chat message', nickNames[socket.id] +': '+ msg);
  });

  socket.on('change name', function(newName){
    var oldName = nickNames[socket.id];
    nickNames[socket.id] = newName;
    io.emit('chat message', oldName + ' change name to '+ newName);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

module.exports = app;