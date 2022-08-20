var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var ship = new Schema({
    "isProvider":{
        type: Boolean,
        required: true
    },
    "pickupCity":String,
    "dropoffCity":String,
    "pickupPortUnlocode":String,
    "dropoffPortUnlocode":String,
    "departurePort":String,
    "destinationPort":String,
    "shipDate":Date,
    "eta":Date,
    "departureTime":String,
    "destinationTime":String,
    "mmsiNumber":String,
    "ticketImage":String,
    "provider":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
});
module.exports = mongoose.model('ships', ship);