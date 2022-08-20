var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var complain = new Schema({
    "complainTitle":{
        type: String,
        required: true
       },
    "complainDescription":{
        type: String,
        required: true},
    "complainImage":String,
    "complainBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "complainStatus":{
        type: String,
        default:"Pending"
    },
    "date":{
        type: Date,
		default: Date.now,
    }
});
module.exports = mongoose.model('complains', complain);