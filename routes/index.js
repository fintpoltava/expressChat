var express = require('express')
var router = express.Router()
var passport = require('passport')

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
}

// ROOM
router.get('/',
  isAuthenticated,
  function (req, res, next) {
    res.render('room', {
      title: 'ExpressChat',
      placeholder: 'Message',
      submitText: 'Send',
      nickPlaceholder: 'NickName',
      submitNick: 'Change name'
    })
  })

module.exports = router


