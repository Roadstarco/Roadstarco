var requestModel = require('../models/requestModel')
var ObjectId = require('mongodb').ObjectID;
async function cancelRequestsAutomatically(id) {
  var currentDate = new Date();
  console.log(currentDate)
  var requests = await requestModel.find({ status: 'Accepted' }).populate('')
  //console.log(requests)
  var operation = await requests.forEach(async request => {
    //console.log(request)
    if(!request.isMakePayment){
      if (request.paymentDue) {
        if (request.paymentDue < currentDate) {
          console.log("date passed", request._id)
          await requestModel.updateOne(
            { _id: request._id },
            {
              $set: {
                status: "Cancelled",
                isMakePayment: null,
                paymentDue: null
              }
            }
          )
        } else {
          console.log("not passed", request._id)
        }
      }
    }
    

  })
  await requestModel.find({ requestedBy: id }).populate('flight ship provider requestedBy bookingId').then((data)=>{
    //console.log("Requests after promise in cancelRequest ",data)
  })
  
}
module.exports = {
  cancelRequestsAutomatically
}