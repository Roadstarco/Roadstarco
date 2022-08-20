var userModel = require('../models/userModel')
var companyModel = require('../models/companyModel');
const invitationModel = require('../models/invitationModel');
const vehicleModel = require('../models/vehicleModel');
const requestModel = require('../models/requestModel');
var driverModel = require('../models/driverModel');
const { createNotification } = require('../helpers/pushNotification');
var ObjectId = require('mongodb').ObjectID;
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { vehicleSchemaForCompany } = require('../helpers/vehicleValidationSchema')
const createCompany = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //saving user to DB
    /*console.log("req.files: ",req.files)
     const businessLicense = req.files['businessLicense'][0].filename
    const TaxIDnumber = req.files['TaxIDnumber'][0].filename
    const businessOwnersName = req.files['businessOwnersName'][0].filename
    const ownerGovernmentissuedID = req.files['ownerGovernmentissuedID'][0].filename */
    //creating company object
    const newcompany = await new companyModel({
      companyName: req.body.companyName,
      companyRegNo: req.body.companyRegNo,
      totalvehicles: req.body.totalvehicles,
      companyOwner: req.body.user,
      businessLicense: "/src/" + req.body.businessLicense,
      TaxIDnumber: "/src/" + req.body.TaxIDnumber,
      businessOwnersName: "/src/" + req.body.businessOwnersName,
      ownerGovernmentissuedID: "/src/" + req.body.ownerGovernmentissuedID,
    }).save();
    if (newcompany) {
      //creating company
      console.log("You are now company", newcompany)
      const updatedUser = await userModel.updateOne(
        { _id: req.body.user },
        {
          $set: {
            role: "Company",
          }
        }
      );
      res.status(200).send({
        success: true,
        message: "You are now company"
      });
    } else {
      //sending failure if company doesn't get created
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Request Failed"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }



}
const updateCompany = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    console.log("req.body is", req.body);
    //Finding user who is being updated
    const company = await companyModel.findOne({ "companyOwner": ObjectId(req.params.id) });
    console.log(company)
    if (!company) {
      res.status(404).send({
        success: false,
        message: "company Don't Exists!"
      })
    }
    //Checking if we got any image
    if (req.files) {
      console.log("we getting image")
      console.log(req.files.length)
    } else {
      console.log("we not getting image")
    }
    //Updating user fields with new values
    const updatedCompany = await companyModel.updateOne(
      { companyOwner: req.params.id },
      {
        $set: {
          companyName: req.body.companyName?req.body.companyName:company.companyName,
          companyRegNo: req.body.companyRegNo?req.body.companyRegNo:company.companyName,
          totalvehicles: req.body.totalvehicles?req.body.totalvehicles:company.totalvehicles,
          businessLicense: req.body.businessLicense?"/src/" + req.body.businessLicense:company.businessLicense,
          TaxIDnumber: req.body.TaxIDnumber?"/src/" + req.body.TaxIDnumber:company.TaxIDnumber,
          businessOwnersName: req.body.businessOwnersName?"/src/" + req.body.businessOwnersName:company.businessOwnersName,
          ownerGovernmentissuedID: req.body.ownerGovernmentissuedID?"/src/" + req.body.ownerGovernmentissuedID:company.ownerGovernmentissuedID,
        }
      }
    );


    if (updatedCompany) {
      //Sending success if user updated 
      return res.status(200).json({
        success: true,
        message: "Company Updated!",
        updatedCompany
      })
    } else {
      //Sending failure if user not updated 
      return res.status(400).json({
        success: false,
        message: "the company cannot be updated!"
      })
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }

}
const singlePicture = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //get images data
    console.log("req.files: ", req.files)
    //saving image if we get image from frontend
    const image = req.files['image'] ? req.files['image'][0].filename : null


    if (image) {
      console.log("Image Url", image)

      res.status(200).send({
        success: true,
        imageUrl: image
      });
    } else {
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Image Upload Failed"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }
}
const getCompanyInfo = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //getting user by ID
    const company = await companyModel.findOne({ "companyOwner": ObjectId(req.params.id) });
    //sending user to client if recieved
    if (company) {
      return res.status(200).send({
        success: true,
        message: 'Correct Details',
        companyDetails: company
      });
    } else {
      //sending Error to client if not recieved
      return res.status(404).send({
        success: false,
        message: 'Company Not Found'
      });
    }
  }
  catch (err) {
    console.log("err ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }

}
const getDrivers = async (req, res) => {
  try {
    console.log("req.params is", req.params);
    var filter = {
      companyId: req.params.companyid,
      role: "Driver"
    }
    var invitationFilter = {
      companyId: req.params.companyid
    }
    var allcompanyDrivers = await userModel.find(filter).populate('vehicles');
    console.log("allcompanyDrivers ", allcompanyDrivers);
    var allinvitatedDrivers = await invitationModel.find(invitationFilter).populate('');
    console.log("allinvitatedDrivers ", allinvitatedDrivers);
    if (allcompanyDrivers.length > 0) {
      //Sending success if all company drivers get found
      return res.status(200).send({
        success: true,
        message: "Drivers Found Against Your Company",
        allcompanyDrivers: allcompanyDrivers.reverse(),
        allinvitatedDrivers: allinvitatedDrivers.reverse()
      });
    } else {
      if (allinvitatedDrivers.length > 0) {
        return res.status(200).send({
          success: true,
          message: "Only Invited Drivers Found Against Your Company",
          allcompanyDrivers: [],
          allinvitatedDrivers: allinvitatedDrivers.reverse()
        });
      }
      //Sending failure if all company drivers don't get found
      res.status(404).send({
        success: false,
        message: "No Drivers Found Against Your Company"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }
}
const deleteDriver = async (req, res) => {
  try {
    console.log("get driverId: ", req.params.driverId)
    //soft deleting user by ID 
    const user = await userModel.findOne({ "_id": ObjectId(req.params.driverId), "companyId": req.params.companyId });
    const company = await companyModel.findOne({ "companyOwner": ObjectId(req.params.companyId) });
    if (user) {
      //Removing company from user if user exists
      const updatedUser = await userModel.updateOne(
        { _id: req.params.driverId },
        {
          $set: {
            companyId: null,
            vehicles: null
          }
        }
      );
      const updatedVehicle = await vehicleModel.updateMany(
        { driverId: req.params.driverId },
        {
          $set: {
            driverId: null,
          }
        }
      );
      if (updatedUser.nModified > 0) {
        //Sending success if user does get updated
        var message = "You've Been Removed From Company " + company.companyName + " As Driver"
        var playerID = user.playerID ? user.playerID : "a811c3dd-be0f-4f3b-87c1-676bf931a64d"
        const response = await createNotification(message, company._id, "driverRemoved", playerID)
        return res.status(200).send({
          success: true,
          message: 'User Has Been Removed From Company'
        });
      } else {
        //Sending Failure if user doesn't get updated
        return res.status(400).send({
          success: false,
          message: 'Something went wrong'
        });
      }
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Driver By Given ID'
      });
    }
  }
  catch (err) {
    console.log("err", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }
}
const inviteDriver = async (req, res) => {
  try {
    //Checking If User Already Been Invited
    const ifinvited = await invitationModel.findOne({ "phoneno": req.body.phoneno });
    if (ifinvited) {
      return res.status(422).json({
        success: false,
        message: "User Has Already Been Invited By Your Company"
      })
    }
    //Checking If User Already Been Registered As Driver
    const ifalreadyDriver = await userModel.findOne({ "phoneno": req.body.phoneno });
    if (ifalreadyDriver) {
      return res.status(422).json({
        success: false,
        message: "User Has Already Been Registered In Our Platform"
      })
    }
    //Finding company information
    const company = await companyModel.findOne({ "companyOwner": ObjectId(req.body.companyId) });
    //Validating Number
    var length = req.body.phoneno.toString().length
    if (length >= 6 && length <= 12) {

    } else {
      res.status(422).json({
        success: false,
        message: "Number digits should be 6-12"
      })
    }
    //Twilio SMS Started
    console.log("countrycode: ", req.body.countrycode + "Phone", req.body.countrycode)
    const number = req.body.countrycode + '' + req.body.phoneno
    console.log("numberrr: ", number)
    //Sending registration invitation to certain number
    client.messages.create({
      body: `You Have Been Invited By Company ${company.companyName} To Register As Driver On Our Crowdshipping APP https://dynamiclinkcrowdshipping.page.link/invitedriver`,
      to: `+${number}`,
      from: '(989) 403-0559'
    }).then(async message => {
      console.log(message)
      const newInvitation = await new invitationModel({
        countrycode: req.body.countrycode,
        phoneno: req.body.phoneno,
        companyId: req.body.companyId,
      }).save();
      if (newInvitation) {
        res.status(200).json({
          success: true,
          message: "Invitation Has Been Sent"
        })
      }
    })
      .catch(error => {
        console.log(error)
        res.status(404).json({
          success: false,
          message: "Number Not Valid"
        })
      })
    //Twilio SMS Ended
  }
  catch (err) {
    console.log(err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
    console.log(err)
  }


}
const getVehicles = async (req, res) => {
  try {
    console.log("req.params is", req.params);
    var filter = {
      companyId: req.params.companyid
    }
    var allCompanyVehicles = await vehicleModel.find(filter).populate('driverId');
    console.log("allCompanyVehicles ", allCompanyVehicles);
    if (allCompanyVehicles.length > 0) {
      //Sending success if all company Vehicles get found
      res.status(200).send({
        success: true,
        message: "Vehicles Found Against Your Company",
        allCompanyVehicles: allCompanyVehicles.reverse()
      });
    } else {
      //Sending failure if all company Vehicles don't get found
      res.status(404).send({
        success: false,
        message: "No Vehicles Found Against Your Company"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }
}
const addVehicle = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //validating if vehicle information validated
    var validationObject = {
      vehicleType: req.body.vehicleType,
      vehicleName: req.body.vehicleName,
      vehicleColor: req.body.vehicleColor,
      vehicleModel: req.body.vehicleModel,
      licenseNumber: req.body.licenseNumber,
      companyId: req.body.companyId
    }
    const result = await vehicleSchemaForCompany.validateAsync(validationObject)
    //saving vehicle to DB
    const newvehicle = await new vehicleModel({
      vehicleType: req.body.vehicleType,
      vehicleName: req.body.vehicleName,
      vehicleColor: req.body.vehicleColor,
      vehicleModel: req.body.vehicleModel,
      licenseNumber: req.body.licenseNumber,
      vehicleImage: "src" + req.body.vehicleImage,
      vehicleLicence: "src" + req.body.vehicleLicence,
      vehicleInsurance: "src" + req.body.vehicleInsurance,
      vehicleResidenceProof: "src" + req.body.vehicleResidenceProof,
      companyId: req.body.companyId,
      isApproved: false
    }).save();
    //sending success if vehicle gets created
    if (newvehicle) {
      console.log("Vehicle has been added yo", newvehicle)

      res.status(200).send({
        success: true,
        message: "Vehicle has been added",
        vehicle: newvehicle
      });
    } else {
      //sending failure if vehicle doesn't get added
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Request Failed"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }



}
const editVehicle = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    console.log("req.params is", req.params);
    const vehicle = await vehicleModel.findOne({ "_id": ObjectId(req.params.vehicleid) });
    if (!vehicle) {
      return res.status(400).send({
        success: false,
        message: "Vehicle doesn't exist"
      });
    } else {
      console.log("vehicle ", vehicle)
    }
    //updating vehicle to DB
    const updatedVehicle = await vehicleModel.updateOne(
      { "_id": ObjectId(req.params.vehicleid) },
      {
        $set: {
          vehicleType: req.body.vehicleType ? req.body.vehicleType : vehicle.vehicleType,
          vehicleName: req.body.vehicleName ? req.body.vehicleName : vehicle.vehicleName,
          vehicleColor: req.body.vehicleColor ? req.body.vehicleColor : vehicle.vehicleColor,
          vehicleModel: req.body.vehicleModel ? req.body.vehicleModel : vehicle.vehicleModel,
          licenseNumber: req.body.licenseNumber ? req.body.licenseNumber : vehicle.licenseNumber,
          vehicleImage: req.body.vehicleImage ? "/src/" + req.body.vehicleImage : vehicle.vehicleImage,
          vehicleLicence: req.body.vehicleLicence ? "/src/" + req.body.vehicleLicence : vehicle.vehicleLicence,
          vehicleInsurance: req.body.vehicleInsurance ? "/src/" + req.body.vehicleInsurance : vehicle.vehicleInsurance,
          vehicleResidenceProof: req.body.vehicleResidenceProof ? "/src/" + req.body.vehicleResidenceProof : vehicle.vehicleResidenceProof
        }
      }
    );
    console.log("updatedVehicle ", updatedVehicle)
    //sending success if vehicle gets updated
    if (updatedVehicle.nModified > 0) {
      console.log("Vehicle has been modified")

      res.status(200).send({
        success: true,
        message: "Vehicle has been modified"
      });
    } else {
      //sending failure if vehicle doesn't get updated
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Request Failed"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }



}
const deleteVehicle = async (req, res) => {
  try {
    console.log("get driverId: ", req.params.vehicleid)
    //Finding if vehicle really exists
    const vehicle = await vehicleModel.findOne({ "_id": ObjectId(req.params.vehicleid), "companyId": req.params.companyId });
    if (vehicle) {
      //Deleting vehcile if exists
      const deletedVehicle = await vehicleModel.deleteOne({ "_id": ObjectId(req.params.vehicleid), "companyId": req.params.companyId });
      //Checking if vehicle has any driver
      if (vehicle.driverId) {
        //Removing vehicle from driver doc as well
        const updatedUser = await userModel.updateOne(
          { _id: vehicle.driverId },
          {
            $pull: {
              vehicles: vehicle._id
            }
          }
        );
      }
      if (deletedVehicle.deletedCount > 0) {
        return res.status(200).send({
          success: true,
          message: 'Vehicle Has Been Removed From Company'
        });
      }

    } else {
      //Sending failure if Vehicle don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Vehicle By Given ID'
      });
    }
  }
  catch (err) {
    console.log("err", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }
}
const assignDriver = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //Checking if vehicle really exists
    const vehicle = await vehicleModel.findOne({ "_id": ObjectId(req.params.vehicleid) });
    if (!vehicle) {
      return res.status(400).send({
        success: false,
        message: "Vehicle doesn't exist"
      });
    }
    //Checking if vehicle has driver already
    if (vehicle.driverId) {
      //Sending failure if vehicle has driver already
      return res.status(400).send({
        success: false,
        message: "Vehicle Has Driver Already"
      });
    }
    //Assigning driver to vehicle
    const updatedVehicle = await vehicleModel.updateOne(
      { "_id": ObjectId(req.params.vehicleid) },
      {
        $set: {
          driverId: req.params.driverId
        }
      }
    );
    //Assigning vehicle to driver
    const updatedDriver = await userModel.updateOne(
      { "_id": ObjectId(req.params.driverId) },
      {
        $push: {
          vehicles: req.params.vehicleid
        }
      }
    );
    //sending success if driver has been assigned to vehicle
    if (updatedVehicle.nModified > 0 && updatedDriver.nModified > 0) {
      console.log("Driver has been assigned to Vehicle")

      res.status(200).send({
        success: true,
        message: "Driver has been assigned to Vehicle"
      });
    } else {
      //sending failure if driver hasn't been assigned to vehicle somehow
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Request Failed"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }



}
const assignVehicle = async (req, res) => {
  try {
    console.log("req.body is", req.params);
    //Checking if vehicle really exists
    const vehicle = await vehicleModel.findOne({ "_id": ObjectId(req.params.vehicleid) });
    if (!vehicle) {
      return res.status(400).send({
        success: false,
        message: "Vehicle doesn't exist"
      });
    }
    //Checking if driver really exists
    const driver = await userModel.findOne({ "_id": ObjectId(req.params.driverId) });
    if (!driver) {
      return res.status(400).send({
        success: false,
        message: "Driver doesn't exist"
      });
    }
    //Checking if vehicle has driver already
    if (vehicle.driverId) {
      //Sending failure if vehicle has driver already
      return res.status(400).send({
        success: false,
        message: "Vehicle Has Driver Already"
      });
    }
    //Assigning driver to vehicle
    const updatedVehicle = await vehicleModel.updateOne(
      { "_id": ObjectId(req.params.vehicleid) },
      {
        $set: {
          driverId: req.params.driverId
        }
      }
    );
    //Assigning vehicle to driver
    const updatedDriver = await userModel.updateOne(
      { "_id": ObjectId(req.params.driverId) },
      {
        $push: {
          vehicles: req.params.vehicleid
        }
      }
    );
    //sending success if driver has been assigned to vehicle
    if (updatedVehicle.nModified > 0 && updatedDriver.nModified > 0) {
      console.log("Driver has been assigned to Vehicle");

      res.status(200).send({
        success: true,
        message: "Driver has been assigned to Vehicle"
      });
    } else {
      //sending failure if driver hasn't been assigned to vehicle somehow
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Request Failed"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }



}
const getBookingHistory = async (req, res) => {
  try {
    console.log("req.body is", req.params);
    //Checking if vehicle really exists
    const companyUsers = await userModel.find({ "companyId": ObjectId(req.params.companyid), role: "Driver" });
    if (!companyUsers.length > 0) {
      return res.status(404).send({
        success: false,
        message: "No Bookings Exists"
      });
    }
    var companyUsers2 = companyUsers.map(o => o._id);
    console.log("companyUsers2 ", companyUsers2)
    //Checking if driver really exists
    const requests = await requestModel.find({ "provider": { $in: companyUsers2 }, type: "Land" }).populate('requestedBy bookingId provider');
    console.log("requests ", requests)

    //sending success if company's Booking History found
    if (requests.length > 0) {
      console.log("Booking History Of Company")

      res.status(200).send({
        success: true,
        requests: requests,
        message: "Booking History Of Company Found"
      });
    } else {
      //sending success if company's Booking History not found
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Booking History Of Company Not Found"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }



}
const searchDriver = async (req, res) => {
  try {
    console.log("query: ", req.params.query)
    const filter = { $or: [{ "firstname": { "$regex": req.params.query, "$options": "i" } }, { "lastname": { "$regex": req.params.query, "$options": "i" } }, { "role": "Driver" }] };
    //Finding all users based on search query 
    var searchedDrivers = await userModel.find(filter).populate('')
    console.log(searchedDrivers.reverse())
    if (searchedDrivers.length > 0) {
      //Sending success if all Drivers get found
      res.status(200).send({
        success: true,
        message: "Drivers Found Against Your Query",
        searchedDrivers: searchedDrivers.reverse()
      });
    } else {
      //Sending failure if all Drivers don't get found
      res.status(404).send({
        success: false,
        message: "No Drivers Found Against Your Query"
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    if (err.isJoi) {
      res.status(422).json({
        success: false,
        message: err.details[0].message
      })
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      })
    }
  }
}
module.exports = {
  createCompany,
  singlePicture,
  getDrivers,
  deleteDriver,
  inviteDriver,
  getVehicles,
  addVehicle,
  editVehicle,
  deleteVehicle,
  assignDriver,
  assignVehicle,
  getBookingHistory,
  searchDriver,
  getCompanyInfo,
  updateCompany
};