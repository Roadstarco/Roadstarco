var mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
var Schema = mongoose.Schema;
 var password = new Schema({
     "password": String, 
     "user":{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'users'
        },
});
password.plugin(softDeletePlugin)
module.exports = mongoose.model('passwords', password);