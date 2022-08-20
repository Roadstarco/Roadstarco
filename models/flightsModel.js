var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var flight = new Schema({
    "fa_flight_id":String,
    "isProvider":{
        type: Boolean,
        required: true
    },
    "pickupIATACityCode":String,
    "dropoffIATACityCode":String,
    "pickupCity":String,
    "dropoffCity":String,
    "departureAirport":String,
    "destinationAirport":String,
    "flightDate":Date,
    "flightarrivalDate":Date,
    "departureTime":String,
    "destinationTime":String,
    "flightNumber":String,
    "flightAirline":String,
    "ticketImage":String,
    "provider":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
});
module.exports = mongoose.model('flights', flight);