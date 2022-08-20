var mongoose = require('mongoose');
var Schema = mongoose.Schema;
 var rating = new Schema({
    "requestId":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'requests'
    },
    "ratedBy":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "ratedTo":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "rate":Number
});
module.exports = mongoose.model('ratings', rating);