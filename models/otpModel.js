var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var otp = new Schema({
    "countrycode":{
        type: Number,
        required: true
       },
    "phoneno":{
        type: Number,
        required: true},
    "otp":String,
    "createdAt": {
        type: Date,
        default: Date.now,
        expires: 60*60*24*2,// this is the expiry time in seconds
      }
});
module.exports = mongoose.model('otps', otp);