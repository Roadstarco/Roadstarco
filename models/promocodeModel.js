var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var promocode = new Schema({
    "promoName":{
        type: String,
        required: true
    },
    "discountPercent":{
        type: Number,
        required: true
    },
    "availableTill":{
        type: Date,
        required: true
    }
});
module.exports = mongoose.model('promocodes', promocode);