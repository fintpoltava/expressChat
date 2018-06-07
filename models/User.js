const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


var User = new Schema({
  username: String,
  password: String,
  displayName: String,
  google: {
    id: String,
  }
}, { timestamps: true });

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);