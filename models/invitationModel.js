var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var invitation = new Schema({
    "companyId": {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "countrycode": {
        type: Number,
        required: true
    },
    "phoneno": {
        type: Number,
        required: true
    }
});
module.exports = mongoose.model('invitations', invitation);