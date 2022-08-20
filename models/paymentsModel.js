var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var payment = new Schema({
    "amount": {
        type: Number,
        required: true
    },
    "paidBy": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "requestId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'requests'
    },
    "paidTo":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, { timestamps: true });
module.exports = mongoose.model('payments', payment);