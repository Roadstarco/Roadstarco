var mongoose = require('mongoose');
const { softDeletePlugin } = require('soft-delete-plugin-mongoose');
var Schema = mongoose.Schema;
 var company = new Schema({
     "companyName":String,
     "companyRegNo":String,
     "totalvehicles":String,
     "companyOwner":{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
       },
     "businessLicense":String,//0
     "TaxIDnumber":String,//1
     "businessOwnersName":String,//2
     "ownerGovernmentissuedID":String,//3
});
company.plugin(softDeletePlugin)
module.exports = mongoose.model('companies', company);