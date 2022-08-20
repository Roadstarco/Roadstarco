var mongoose = require('mongoose');
const Double = require('@mongoosejs/double');
var Schema = mongoose.Schema;
var cancellation = new Schema({
    "requestId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'requests'
    },
    "provider": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "charges": {
        type: Double,
        required: true
    },
    "isPaid": Boolean
},
{
  timestamps: true,
});
module.exports = mongoose.model('cancellations', cancellation);