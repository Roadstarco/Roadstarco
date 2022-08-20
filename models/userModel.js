var mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
var Schema = mongoose.Schema;
var user = new Schema({
   "firstname": String,
   "lastname": String,
   "email": {
      type: String,
      unique: false
   },
   "countrycode": {
      type: Number,
      required: true
   },
   "phoneno": {
      type: Number,
      required: true
   },
   "address": String,
   "resetPasswordOtp": String,
   "role": String,
   "secondaryRole": String,
   "isDeactivated": Boolean,
   "profilepic": String,
   "playerID": String,
   "isApproved": Boolean,
   "promocodes": [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'promocodes'
   }],
   "companyId": {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
   },
   "vehicles":[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vehicles'
   }]
});
user.plugin(softDeletePlugin)
module.exports = mongoose.model('users', user);