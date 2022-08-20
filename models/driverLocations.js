var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var location = new Schema({
     "location":{
        "lat":Number,
        "lng":Number
     }, 
     "driverId":{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'users'
        },
},{ timestamps: true });
module.exports = mongoose.model('locations', location);