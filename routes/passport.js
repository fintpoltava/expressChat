var express = require('express');
var router = express.Router();
var passport = require('passport')


router.get('/login', function (req, res, next) {
  res.render('login',{ message: req.flash('message')})
})

router.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
)


module.exports = router;