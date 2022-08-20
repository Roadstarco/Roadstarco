var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var requestDriver = new Schema({
     "pickupAddress":{
         "lat":Number,
         "lng":Number
        },
     "dropAddress":{
        "lat":Number,
        "lng":Number
    },
     "vehicleType":String,
     "category": String, 
     "productType":String,
     "productWeight":String,
     "productDate":Date,
     "productTime":String,
     "productImage":String,
     "instructions":String,
     "recieverName":String,
     "recieverPhoneno":Number,
     "requestedBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
       }
});
module.exports = mongoose.model('requestDrivers', requestDriver);