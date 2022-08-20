var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var claim = new Schema({
    "claimTitle":{
        type: String,
        required: true
       },
    "claimDescription":{
        type: String,
        required: true},
    "claimImage":String,
    "claimBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "claimStatus":{
        type: String,
        default:"Pending"
    },
    "claimResolvedMessage":String,
    "date":{
        type: Date,
		default: Date.now,
    }
});
module.exports = mongoose.model('claims', claim);