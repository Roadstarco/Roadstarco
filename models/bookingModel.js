var mongoose = require('mongoose');
const Double = require('@mongoosejs/double');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
var Schema = mongoose.Schema;
var booking = new Schema({
   "pickupAddress": {
      "lat": Double,
      "lng": Double
   },
   "dropAddress": {
      "lat": Double,
      "lng": Double
   },
   "pickupAddressText": String,
   "dropAddressText": String,
   "vehicleType": String,
   "category": String,
   "productType": String,
   "pickupType": String,
   "fromdate": Date,
   "todate": Date,
   "productWeight": String,
   "productImage": String,
   "productImage2": String,
   "productDistribution": String,
   "instructions": String,
   "recieverName": String,
   "recieverPhoneno": {
      "countrycode": {
         type: Number,
         required: true
      },
      "phoneno": {
         type: Number,
         required: true
      }
   },
   "bookedBy": {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
   }
});
booking.plugin(softDeletePlugin)
module.exports = mongoose.model('bookings', booking);