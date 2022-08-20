var mongoose = require('mongoose');
const Double = require('@mongoosejs/double');
var Schema = mongoose.Schema;
var shiplocation = new Schema({
   "mmsinumber": Number,
   "location": {
      "lat": Double,
      "lng": Double
   },
}, {
   timestamps: true,
});
module.exports = mongoose.model('shiplocations', shiplocation);