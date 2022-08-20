var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var type = new Schema({
    "type":{
        type: String,
        required: true
       },
    "fare":String,
    "distance":String,
    "createdAt": {
        type: Date,
        default: Date.now,
        expires: 60*60*24*2,// this is the expiry time in seconds
      }
});
module.exports = mongoose.model('vehicletypes', type);