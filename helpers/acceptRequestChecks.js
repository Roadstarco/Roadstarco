var requestModel = require('../models/requestModel')
var locationsModel = require('../models/driverLocations')
var ObjectId = require('mongodb').ObjectID;
var deg2rad = require('deg2rad')
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
async function findLocation(driverID) {
    const location = await locationsModel.findOne({ driverId: driverID });
    return location
}
async function checkIfMax3(driverId) {
    let max3, closetodestination;
    console.log("driverId ", driverId)
    var requests = await requestModel.find({ status: 'Accepted', provider: ObjectId(driverId), state: { $in: ["Transit", "Pickedup"] }, type: "Land" }).populate('flight ship bookingId')
    var userLocation = await findLocation(driverId)
    console.log("userLocation ", userLocation)
    if (userLocation == null) {
        return {
            noLocation:true,
            Message: "Kindly Allow Location Share Before Accepting Request"
        }
    }
    userLocation = userLocation.location;

    console.log(requests.length)
    if (requests.length >= 3) {
        console.log("true")
        max3 = false;
        closetodestination = true;
    } else {
        closetodestination = true
        max3 = true
        var operation = await requests.forEach(async request => {
            if (request.type == "Land" && request._id != "62d6a0eed04e850004bfc246") {
                console.log("Request: ", request)
                if (request.bookingId) {
                    if (request.bookingId.dropAddress) {
                        console.log(_getDistanceFromLatLonInKm(request.bookingId.dropAddress.lat, request.bookingId.dropAddress.lng, userLocation.lat, userLocation.lng));
                        var distance = _getDistanceFromLatLonInKm(request.bookingId.dropAddress.lat, request.bookingId.dropAddress.lng, userLocation.lat, userLocation.lng);
                        if (distance > 3) {
                            closetodestination = false;
                        }

                    }
                }
            }

        })
    }
    console.log("max3 ", max3, "closetodestination ", closetodestination);
    return {
        max3, closetodestination
    }
}
module.exports = {
    checkIfMax3
}