const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  roles: {
    User: {type: Number, default: 2023},
    Editor: Number, //every user as user role by default but no all of them are editors or admin
    Admin: Number,
  },
  refreshToken: String, //shortcut for {type:String} when no nested object
})
//
module.exports = mongoose.model('User', userSchema)
