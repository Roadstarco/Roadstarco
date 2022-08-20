var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//request to all providers to book any flight by his packge
 var postrequest = new Schema({
    "fa_flight_id":String,
    "mmsiNumber":String,
    "acceptedBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "bookingId":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'bookings'
    },
    "requestedBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "isAccepted":{
        type:Boolean,
        default:false
    },
    "type":String,
    "date":Date,
    "airline":String,
    "flightNumber":String,
    "departureAirport":String,
    "destinationAirport":String,
    "pickupIATACityCode":String,
    "dropoffIATACityCode":String,
    "pickupCity":String,
    "dropoffCity":String,
    "pickupPortUnlocode":String,
    "dropoffPortUnlocode":String,
    "departurePort":String,
    "destinationPort":String,
    "flightarrivalDate":Date,
    "shipArrivaldate":Date
});
module.exports = mongoose.model('postrequests', postrequest);