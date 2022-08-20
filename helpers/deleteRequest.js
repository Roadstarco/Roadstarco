var requestModel = require('../models/requestModel')
var ObjectId = require('mongodb').ObjectID;
async function deleteRequestsAutomatically() {
    var currentDate = new Date();
    console.log(currentDate)
    var requests = await requestModel.find({ status: 'Pending' }).populate('flight ship bookingId')
    //console.log(requests)
    var operation = await requests.forEach(async request => {
      //console.log(request)
      if (request.type=="Flight") {
        
        if(request.flight){
          if(request.flight.flightDate<currentDate){
            console.log("It should be Deleted: ",request)
            const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
          }
        }else{
          console.log("request with null flight",request)
          const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
        }
      }
      if (request.type=="Ship") {
        //console.log("Request: ",request)
        if(request.ship){
          if(request.ship.eta<currentDate){
            console.log("It should be deleted: ",request)
            const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
          }
        }else{
          console.log("request with null ship",request)
          const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
        }
      }
      if (request.type=="Land") {
        console.log("Request: ",request)
        if(request.bookingId){
          if(request.bookingId.pickupType=="Instant"){
            if(request.createdAt){
              //Creating one week before date
              onedayafter=request.createdAt
              onedayafter.setDate(onedayafter.getDate() + 1);
              //console.log(onedayafter);
              if(onedayafter<currentDate){
                console.log("It should be deleted: ",request);
                const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
              }
            }
          }else if(request.bookingId.pickupType=="Schedule"){
            if(request.bookingId.todate<currentDate){
              console.log("It should be deleted: ",request)
              const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
            }
          }
        }else{
          console.log("request with null booking",request)
          const deletedRequest=await requestModel.deleteOne({"_id": ObjectId(request._id)});
        }
      }
  
    })
}
module.exports = {
    deleteRequestsAutomatically
}