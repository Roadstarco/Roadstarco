const axios = require("axios");
var accountSid = "AC2e14b90858d682e1722dd66abdb1f927";
var authToken = "17c9fa4f08fcb4e5182e220e3ecbd7f3";
const client = require('twilio')(accountSid, authToken);
var deg2rad = require('deg2rad')
const fs = require('fs');
var parser = require('fast-xml-parser');
var parseString = require('xml2js');
var n = require('country-js');
var requestModel = require('../models/requestModel')
/*
function GetScheduledFlights(departCode,arrivalCode){
    console.log(departCode,arrivalCode)
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/schedules/2022-04-21/2022-04-27?origin=${departCode}&destination=${arrivalCode}`,
      headers: { 
        'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
      }
    };
    
    axios(config)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
}

  
  
  client.messages.create({
    body: `Dear Codistan Employee Haris Abbasi, your account 18-70***45-01 has been credited with amount PKR 50000.00 from account 22-53*****-59903 CODISTAN PVT LT from 60064800000 on 30/04/22. Avail.`,
    to: `+923359037389`,
    from: '(989) 403-0559'
  }).then(async message => {console.log(message)})
  
  function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = lon1-lon2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit=="K") { dist = dist * 1.609344 }
      if (unit=="N") { dist = dist * 0.8684 }
      return dist;
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
  miles=distance(33.6799,73.0125,33.6573,73.0572)
  var kilometers = miles * 1.6;
  console.log(kilometers + " Kilometers");
  console.log(miles + " miles");
  console.log("new in KM",_getDistanceFromLatLonInKm(33.6799,73.0125,33.6573,73.0572))
  */
/*
 function distance(lat1, lon1, lat2, lon2, unit) {
   
 }
 
 console.log(n.search('TH'));
 
function convertxml(){
   fs.readFile('textxml.xml', 'utf8', function(err, data) {
     if (err) throw err;
       console.log("data",data)
        // parsing xml data
        parseString(data, function (err, results) {
          // parsing to json
          let data = JSON.stringify(results)
          // display the json data
          console.log("results",data);
         });
 
 });
 }
 convertxml()*/
// async function cancelRequestsAutomatically() {
//   var currentDate = new Date();
//   console.log(currentDate)
//   var requests = await requestModel.find({ status: 'Pending' }).populate('flight')
//   //console.log(requests)
//   var operation = await requests.forEach(async request => {
//     //console.log(request)
//     if (request.type=="Flight") {
//       console.log("request",request)
//     }
//     if (request.type=="Ship") {

//     }
//     if (request.type=="Land") {

//     }

//   })
//   /*
//   await requestModel.find({ requestedBy: id }).populate('flight ship provider requestedBy bookingId').then((data)=>{
//     //console.log("Requests after promise in cancelRequest ",data)
//   })*/

// }
// cancelRequestsAutomatically()
// const OSPoint = require('ospoint');
// // Create a new OSPoint instance, with Northings & Eastings
// const point = new OSPoint(3505,13832);

// // Retrieve OSGB coordinates
// console.log(point.toOSGB36());

// // Retrieve ETRS89 coordinates
// console.log(point.toETRS89());

// // Retrieve WGS84 coordinates
// ;
// console.log(point.toWGS84())
const options = {
  method: 'GET',
  url: 'https://ocean-toolbox.p.rapidapi.com/unlocode_timezone.json',
  params: {unlocode: 'THBKK'},
  headers: {
    'X-RapidAPI-Key': '40838189e4mshb5ffc5960cde754p1c2078jsn5b6a894a4513',
    'X-RapidAPI-Host': 'ocean-toolbox.p.rapidapi.com'
  }
};

axios.request(options).then(function (response) {
	console.log(response.data);
}).catch(function (error) {
	console.error(error);
});