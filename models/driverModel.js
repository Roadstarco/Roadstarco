var mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
var Schema = mongoose.Schema;
 var driver = new Schema({
     "vehicletype": String, 
     "vehiclename":String,
     "vehiclecolor":String,
     "vehicleimage":String,//0
     "vehiclelicence":String,//1
     "vehicleLicenceRegno":String,//2
     "vehicleInsurance":String,//3
     "vehicleResidenceProof":String,//4
     "user":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
       },
});
driver.plugin(softDeletePlugin)
module.exports = mongoose.model('drivers', driver);