
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//request to provider flights
 var vehicle = new Schema({
    
    "vehicleType":String,
    "vehicleName":String,
    "vehicleColor":String,
    "vehicleModel":String,
    "licenseNumber":String,
    "driverId":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "companyId":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    "isApproved":Boolean,
    "vehicleImage":String,//0
    "vehicleLicence":String,//1
    "vehicleInsurance":String,//2
    "vehicleResidenceProof":String,//3
});
module.exports = mongoose.model('vehicles', vehicle);