var userModel = require('../models/userModel')
var driverModel = require('../models/driverModel')
var vehicleModel = require('../models/vehicleModel')
const bcrypt = require("bcrypt")
var ObjectId = require('mongodb').ObjectID;
const { vehicleSchema } = require('../helpers/vehicleValidationSchema')
var deg2rad = require('deg2rad')
var requestModel = require('../models/requestModel')
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const OneSignal2 = require('onesignal-node');
var moment = require("moment");
const client2 = new OneSignal2.Client(ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);
const { createNotification } = require('../helpers/pushNotification');
const paymentsModel = require('../models/paymentsModel');
const { deleteRequestsAutomatically } = require('../helpers/deleteRequest');
const { checkIfMax3 } = require('../helpers/acceptRequestChecks');
const createDriver = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //saving user to DB
    /*console.log("req.files: ",req.files)
    const vehicleimage = req.files['vehicleimage']?"/src/"+req.files['vehicleimage'][0].filename:null
    const vehiclelicence = req.files['vehiclelicence']?"/src/"+req.files['vehiclelicence'][0].filename:null
    const vehicleLicenceRegno = req.files['vehicleLicenceRegno']?"/src/"+req.files['vehicleLicenceRegno'][0].filename:null
    const vehicleInsurance = req.files['vehicleInsurance']?"/src/"+req.files['vehicleInsurance'][0].filename:null
    const vehicleResidenceProof = req.files['vehicleResidenceProof']?"/src/"+req.files['vehicleResidenceProof'][0].filename:null
    console.log(vehicleimage,vehiclelicence,vehicleLicenceRegno,
      vehicleInsurance,vehicleResidenceProof)*/
    const newdriver = await new driverModel({
      vehicletype: req.body.vehicletype,
      vehiclename: req.body.vehiclename,
      vehiclecolor: req.body.vehiclecolor,
      user: req.body.user,
      vehicleimage: req.body.vehicleimage,
      vehiclelicence: req.body.vehiclelicence,
      vehicleLicenceRegno: req.body.vehicleLicenceRegno,
      vehicleInsurance: req.body.vehicleInsurance,
      vehicleResidenceProof: req.body.vehicleResidenceProof
    }).save();
    //sending success if driver gets created
    if (newdriver) {
      console.log("You are now driver", newdriver)
      const updatedUser = await userModel.updateOne(
        { _id: req.body.user },
        {
          $set: {
            role: "Driver",
          }
        }
      );

      res.status(200).send({
        success: true,
        message: "You are now driver"
      });
    } else {
      console.log("Request Failed")
      //sending failure if driver doesn't get created
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
    }
  }



}
const getDriver = async (req, res) => {
  try {
    console.log("get driverID: ", req.params.id)
    //getting driver info by ID
    const driver = await driverModel.findOne({ "_id": ObjectId(req.params.id) }).populate('user')
    //sending driver to client if recieved
    if (driver) {
      return res.status(200).send({
        success: true,
        message: 'Correct Details',
        driver: driver
      });
    } else {
      //sending Error to client if not recieved
      return res.status(404).send({
        success: false,
        message: 'Driver Not Found'
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
      driverId: req.body.driverId
    }
    const result = await vehicleSchema.validateAsync(validationObject)
    const driver = await userModel.findOne({ "_id": ObjectId(req.body.driverId) });
    var isApproved;
    if(!driver.isApproved){
      isApproved=false;
    }else{
      isApproved=driver.isApproved
    }
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
      driverId: req.body.driverId,
      isApproved:isApproved
    }).save();
    //sending success if vehicle gets created
    if (newvehicle) {
      console.log("Vehicle has been added yo", newvehicle)
      const updatedUser = await userModel.updateOne(
        { _id: req.body.driverId },
        {
          $push:{"vehicles": newvehicle._id }
        }
      );
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
    }
  }



}
const getAllVehicles = async (req, res) => {
  try {
    console.log("getting all vehicles")
    console.log(req.params.driverid)
    //getting all vehicles
    var allVehicles = await vehicleModel.find({ driverId: req.params.driverid })
      .catch((err) => {
        //sending error to frontend
        res.status(400).json({ message: err.message });
      });
    //sending recieved vehicles to frontend
    res.status(200).send({
      success: true,
      vehicles: await allVehicles.reverse()
    });
  }
  catch (err) {
    console.log("err ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

}
function _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in kilometers
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in KM
  return d;
}
const calculateLandDelivary = async (req, res) => {
  try {
    console.log("getting all driver requests")
    console.log("req.body: ", req.body)

  }
  catch (err) {
    console.log("err ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

}
const getDriverRequests = async (req, res) => {
  try {
    console.log("getting all driver requests")
    await deleteRequestsAutomatically()
    console.log("req.body: ", req.body)
    //getting all driver requests
    var alldriverrequests = await requestModel.find({ type: "Land" }).populate('bookingId requestedBy')
      .catch((err) => {
        //sending error to frontend
        res.status(400).json({ message: err.message });
      });
    console.log(alldriverrequests[alldriverrequests.length - 1])
    var requestedWithIn20KMRadius = await alldriverrequests.filter(function (request) {
      console.log(_getDistanceFromLatLonInKm(request.bookingId.pickupAddress.lat, request.bookingId.pickupAddress.lng, req.body.driverLocation.lat, req.body.driverLocation.lng))
      return _getDistanceFromLatLonInKm(request.bookingId.pickupAddress.lat, request.bookingId.pickupAddress.lng, req.body.driverLocation.lat, req.body.driverLocation.lng) < 20;
    });
    //console.log(requestedWithIn20KMRadius)
    //sending recieved driver requests to frontend
    var sortedGetDriver=await requestedWithIn20KMRadius.reverse();
    console.log("sortedGetDriver ",sortedGetDriver)
    if (requestedWithIn20KMRadius.length < 1) {
      res.status(200).send({
        success: false,
        message: "No requests within your area",
        DriverRequests: requestedWithIn20KMRadius
      });
    } else {
      res.status(200).send({
        success: true,
        DriverRequests: requestedWithIn20KMRadius
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
const changedriverrequestStatus = async (req, res) => {
  try {
    console.log(req.body)
    const request = await requestModel.findOne({ _id: req.body.requestId }).populate('requestedBy')
    if(req.body.newStatus == "Accepted"){
      var checkresults=await checkIfMax3(req.body.driverId)
      console.log("checkresults ",checkresults)
      if(checkresults.noLocation){
        console.log("it got")
        return res.status(400).send({
          success: false,
          message: checkresults.Message
        });
      }
      if(checkresults.max3&&checkresults.closetodestination){

      }else{
        if(!checkresults.max3){
          return res.status(400).send({
            success: false,
            message: "You've Already 3 In-Progress Bookings"
          });
        }
        if(!checkresults.closetodestination){
          return res.status(400).send({
            success: false,
            message: "You Can't Accept New Driver Request Until You Are Close To 3KM To Destination"
          });
        }
        
      }
    }
    if (request.status) {
      if (request.status == "Accepted" && req.body.newStatus == "Accepted") {
        return res.status(400).send({
          success: true,
          message: "Request Has Been Already Accepted"
        });
      }
    }
    

    var minutesToAdd = 10;
    var currentDate = new Date();
    console.log(currentDate)
    var paymentDue = new Date(currentDate.getTime() + minutesToAdd * 60000);
    console.log(paymentDue)
    //Updating status of customer flight request
    const updatedRequest = await requestModel.updateOne(
      { _id: req.body.requestId },
      {
        $set: {
          status: req.body.newStatus,
          provider: req.body.driverId,
        }
      }
    );
    if (req.body.newStatus == "Accepted") {
      const updatedRequest = await requestModel.updateOne(
        { _id: req.body.requestId },
        {
          $set: {
            isMakePayment: false,
            paymentDue: paymentDue
          }
        }
      );
    }
    if (updatedRequest) {
      console.log("Request Status Updated", updatedRequest)
      //Sending success if updating request status get successful
      var message = `Your request has been ${req.body.newStatus.toLowerCase()} by the driver`
      /*const notification = {
        contents: {
          en: `Your request has been ${req.body.newStatus.toLowerCase()} by the driver`,
        },
        data: {
          id: req.body.requestId,
          type: `request${req.body.newStatus}`
        },
        include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
      };*/
      var playerID=request.requestedBy.playerID?request.requestedBy.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
      const response = await createNotification(message, req.body.requestId, `request${req.body.newStatus}`, playerID)
      res.status(200).send({
        success: true,
        updatedRequest: updatedRequest,
        message: "Status Of Request To Flight Changed"
      });
    } else {
      console.log("Post Request Failed")
      //Sending failure if updating request status doesn't get successful
      res.status(404).send({
        success: false,
        message: "Status Of Request To Flight Not Changed"
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
const cancelRequest = async (req, res) => {
  try {
    console.log(req.body)
    const request = await requestModel.findOne({ "_id": req.body.requestId }).populate('requestedBy');
    console.log("request", request)
    let date = new Date();
    console.log(date);
    var timediff = moment.utc(moment(date, "YYYY/MM/DD HH:mm:ss").diff(moment(request.updatedAt, "YYYY/MM/DD HH:mm:ss"))).format("HH:mm")
    var timearray = timediff.split(':')
    console.log(timearray)
    if (timearray[1] > 5) {
      console.log("it's greater")
      res.status(404).send({
        success: false,
        message: "You can't cancel request after 5 minutes of accepting"
      });

    } else {
      //Updating status of customer flight request
      const updatedRequest = await requestModel.updateOne(
        { _id: req.body.requestId },
        {
          $set: {
            status: "Pending",
          }
        }
      );
      if (updatedRequest) {
        console.log("Request Status Updated", updatedRequest)
        //Sending success if updating request status get successful
        var message = `Your request has been cancelled by the driver and has been sent to other drivers`
        /*const notification = {
          contents: {
            en: `Your request has been ${req.body.newStatus.toLowerCase()} by the driver`,
          },
          data: {
            id: req.body.requestId,
            type: `request${req.body.newStatus}`
          },
          include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
        };*/
        var playerID=request.requestedBy.playerID?request.requestedBy.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
        const response = await createNotification(message,req.body.requestId,`requestCancelled`,playerID)
        res.status(200).send({
          success: true,
          updatedRequest: updatedRequest,
          message: "Request To Driver Cancelled"
        });
      } else {
        console.log("Cancel Request Failed")
        //Sending failure if updating request status doesn't get successful
        res.status(404).send({
          success: false,
          message: "Cancel Request Failed"
        });
      }


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
const driverOrderhistory = async (req, res) => {
  try {
    //Find all the requests against single provider
    console.log(req.params.driverId)
    var requests = await requestModel.find({ provider: req.params.driverId, type: "Land" }).populate('flight ship provider requestedBy bookingId')
    if (requests.length > 0) {
      //Sending success if requests get found
      res.status(200).send({
        success: true,
        message: "Order History Of Driver Found",
        requests: requests.reverse()
      });
    } else {
      //Sending success if requests don't get found
      res.status(404).send({
        success: false,
        message: "Order History Of Driver Not Found"
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
const usersEarnings = async (req, res) => {
  try {
    //Find all the requests against single provider
    console.log(req.params.userId)
    var dateTo, oneweekbefore,onemonthbefore
    dateTo = new Date();
    oneweekbefore = new Date();
    //Creating one week before date
    oneweekbefore.setDate(oneweekbefore.getDate() - 7);
    console.log(oneweekbefore);
    onemonthbefore = new Date();
    //Creating one month before date
    onemonthbefore.setDate(onemonthbefore.getDate() - 30);
    console.log(onemonthbefore);
    
    console.log(dateTo, oneweekbefore,onemonthbefore)
    //Finding total earnings of driver/provider
    var result = await paymentsModel.aggregate([
      { $match: { paidTo: ObjectId(req.params.userId) } },
      { $group: { _id: "$paidTo", totalearnings: { $sum: "$amount" } } },
      { $sort: { totalearnings: -1 } }
    ]);
    //Finding last week's earnings of driver/provider
    var result2 = await paymentsModel.aggregate([
      {
        $match: {
          paidTo: ObjectId(req.params.userId), createdAt: {
            $gte: oneweekbefore
          }
        }
      },
      { $group: { _id: "$paidTo", weeklyearnings: { $sum: "$amount" } } },
      { $sort: { weeklyearnings: -1 } }
    ]);
    //Finding last month's earnings of driver/provider
    var result3 = await paymentsModel.aggregate([
      {
        $match: {
          paidTo: ObjectId(req.params.userId), createdAt: {
            $gte: onemonthbefore
          }
        }
      },
      { $group: { _id: "$paidTo", monthlyearnings: { $sum: "$amount" } } },
      { $sort: { monthlyearnings: -1 } }
    ]);
    console.log("Total Earnings ", result)
    console.log("Weekly Earnings ", result2)
    console.log("Monthly Earnings ", result3)
    //Checking if result got created
    if(result&&result2&&result3){
      res.status(200).send({
        success: true,
        totalEarnings:result[0]?result[0]?.totalearnings:null,
        weeklyEarnings:result2[0]?result2[0]?.weeklyearnings:null,
        monthlyEarnings:result3[0]?result3[0]?.monthlyearnings:null,
        message: "Earnings Of Users"
      });
    }
    
    // var payments = await paymentsModel.find({ "paidTo": ObjectId(req.params.userId) })
    // console.log("payments ", payments)
    // var filteredpayments = payments.filter(payment => payment.createdAt > oneweekbefore);
    // console.log("filteredpayments ", filteredpayments)
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
    const vehicle = await vehicleModel.findOne({ "_id": ObjectId(req.params.vehicleid), "driverId": req.params.driverid });
    if (vehicle) {
      //Deleting vehcile if exists
      const deletedVehicle = await vehicleModel.deleteOne({ "_id": ObjectId(req.params.vehicleid), "driverId": req.params.driverid});
      //Checking if vehicle has any driver
      if (vehicle.driverId) {
        //Removing vehicle from driver doc as well
        const updatedUser = await userModel.updateOne(
          { _id: req.params.driverid },
          {
            $pull: {
              vehicles: vehicle._id
            }
          }
        );
      }
      if(deletedVehicle.deletedCount > 0){
        return res.status(200).send({
          success: true,
          message: 'Vehicle Has Been Deleted'
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
module.exports = {
  createDriver,
  getDriver,
  addVehicle,
  getAllVehicles,
  calculateLandDelivary,
  getDriverRequests,
  changedriverrequestStatus,
  cancelRequest,
  driverOrderhistory,
  usersEarnings,
  deleteVehicle
};