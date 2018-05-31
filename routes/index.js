var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('room', { title: 'ExpressChat', placeholder: 'Message', submitText: 'Send',nickPlaceholder: 'NickName', submitNick: 'Change name' });
});

module.exports = router;


