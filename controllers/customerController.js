var flightsModel = require('../models/flightsModel')
var userModel = require('../models/userModel')
var shipsModel = require('../models/shipsModel')
var requestModel = require('../models/requestModel')
var postflightRequestModel = require('../models/postflightRequest')
var ObjectId = require('mongodb').ObjectID;
var axios = require('axios');
var deg2rad = require('deg2rad')
var parser = require('fast-xml-parser');
const moment = require('moment-timezone');
const fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
const { getflightsSchema, getshipsSchema } = require('../helpers/flightshipValidationSchema');
const { createNotification } = require('../helpers/pushNotification');
const { cancelRequestsAutomatically } = require('../helpers/cancelResuest');
const { getDepartureDate } = require('../helpers/getDepartureDate');
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const OneSignal2 = require('onesignal-node');
const otpGenerator = require('otp-generator')
//console.log("STRIPE_SECRET_KEY: ", process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// With default options
const client2 = new OneSignal2.Client(ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
var { GetNextScheduledFlights,
  GetNextScheduledFlightsPagination,
  get_fa_flight_id_info,
  getairportInfo, convertUTCDateToLocalDate } = require('../middlewares/customerMiddleware');
const paymentsModel = require('../models/paymentsModel');
const ratingsModel = require('../models/ratingsModel');
const shipsLatestLocationModel = require('../models/shipsLatestLocationModel');
var travelapiairports
var config = {
  method: 'get',
  url: 'https://api.travelpayouts.com/data/en/airports.json',
  headers: {}
};

axios(config)
  .then(function (response) {
    //console.log("airoo",response.data)
    travelapiairports = (response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
var travelcities
//getting all travel cities for search apis
var config = {
  method: 'get',
  url: 'https://api.travelpayouts.com/data/en/cities.json',
  headers: {}
};

axios(config)
  .then(function (response) {

    travelcities = response.data
  })
  .catch(function (error) {
    console.log(error);
  });

//Flight related contollers started
const searchCity = async (req, res) => {
  try {
    console.log(req.params)
    //converting search query to lowercase
    const mySentence = req.params.city;
    const result = mySentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

    var cities = (travelcities.filter(item => item.name.startsWith(result)));
    //sending searched cities to frontend
    res.send({
      cities: cities
    })
  }
  catch (err) {
    console.log("err ", err)
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
const getFlights = async (req, res) => {
  try {
    console.log(req.body)
    //validating get flights fields
    const result = await getflightsSchema.validateAsync(req.body)
    const departCode = req.body.departCode
    const arrivalCode = req.body.arrivalCode
    const startingDate = new Date(req.body.startingDate)
    var endingDate = new Date(req.body.endingDate)
    endingDate = endingDate.setDate(endingDate.getDate() + 1)
    endingDate = new Date(endingDate)
    console.log(startingDate, endingDate, departCode, arrivalCode, process.env.FLIGHTAWARE_API_KEY)
    //finding flights between 2 cities
    var flights = await flightsModel.find(
      {
        pickupIATACityCode: departCode,
        dropoffIATACityCode: arrivalCode,
        flightDate: { $lte: req.body.endingDate }
      }
    ).populate('provider');
    flights = flights.filter(flight => flight.flightDate >= startingDate);
    //finding flight aware flights betwen 2 cities
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/schedules/${startingDate}/${endingDate}?origin=${departCode}&destination=${arrivalCode}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };

    axios(config)
      .then(async function (response) {
        console.log(`Flights from ${departCode} to ${arrivalCode}`, response.data.scheduled);
        console.log(flights.length, response.data.scheduled.length)
        //getting next flights after 15 results
        if (response.data.links) {
          //var nextFLights=await GetNextScheduledFlights(response.data.links.next)
          //console.log("nextFLights: ",nextFLights)
          //var responseFAFlights=response.data.scheduled
          //var scheduled=responseFAFlights.concat(nextFLights);
          var finalflights = response.data
          //finalflights.scheduled=scheduled

          //sending both provider flights and flightaware flights with next flights
          res.status(200).send({
            success: true,
            message: "Flights Found",
            flights: flights,
            flightawareflights: finalflights
          })
        } else {
          //sending both provider flights and flightaware flights
          res.status(200).send({
            success: true,
            message: "Flights Found",
            flights: flights,
            flightawareflights: response.data
          })
        }

      })
      .catch(function (error) {
        console.log(error.response);
        res.status(422).json({
          success: false,
          message: "Please select 3 weeks span"
        })
      });


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
const getNextFlights = async (req, res) => {
  try {
    console.log(req.body.next)
    //var nextFLights=await GetNextScheduledFlightsPagination(req.body.next)
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi${req.body.next}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        res.status(200).send({
          success: true,
          message: "Flights Found",
          flightawareflights: response.data
        })
      })
      .catch(function (error) {
        console.log(error);
      });

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
const requestProvider = async (req, res) => {
  try {
    //checking if request exists
    console.log("req.body: ", req.body)
    const ifrequest = await requestModel.find({ bookingId: ObjectId(req.body.bookingId), flight: ObjectId(req.body.flightId), provider: ObjectId(req.body.providerId), requestedBy: ObjectId(req.body.customerId) })

    console.log("ifrequest", ifrequest)
    if (ifrequest.length > 0) {
      res.status(409).send({
        success: false,
        message: "You Already Requested This Provider To Take Your Booking"
      });
    } else {
      console.log("Request not exists")
      var newRequest;
      //adding request to provider for ship
      if (req.body.type == "Ship") {
        newRequest = await new requestModel({
          ship: req.body.shipId,
          type: "Ship",
          provider: req.body.providerId,
          requestedBy: req.body.customerId,
          bookingId: req.body.bookingId
        }).save();

      } else {
        //adding request to provider for flight
        newRequest = await new requestModel({
          flight: req.body.flightId,
          type: "Flight",
          provider: req.body.providerId,
          requestedBy: req.body.customerId,
          bookingId: req.body.bookingId
        }).save();
      }

      if (newRequest) {
        console.log("Request Done", newRequest)
        var message = "Request has been made against your " + req.body.type.toLowerCase()
        //if request gets created sending success
        //Creating notification against request
        /*
        const notification = {
          contents: {
            en: "Request has been made against your "+req.body.type.toLowerCase(),
          },
          data:{
            id:newRequest._id,
            type:"requestCreated"
          },
          include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
        };*/
        const user = await userModel.findOne({ "_id": ObjectId(req.body.customerId) });
        var playerID=user.playerID?user.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
        const response = await createNotification(message, newRequest._id, "requestCreated", playerID)
        console.log("noti response: ", response);
        res.status(200).send({
          success: true,
          request: newRequest,
          message: "Request Sent"
        });
      } else {
        console.log("Request Failed")
        //if request doesn't get created sending success
        res.status(404).send({
          success: false,
          message: "Request Not Sent"
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
const getUserrequests = async (req, res) => {
  try {
    //checking if request exists
    console.log("req.params: ", req.params)
    const allrequests = await requestModel.find({ requestedBy: ObjectId(req.params.userid) }).populate('ship flight provider requestedBy bookingId')
    res.status(200).send({
      success: true,
      bookinghistory: allrequests,
      message: "Booking History found"
    });
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
const deleteUserrequests = async (req, res) => {
  try {
    //checking if request exists
    console.log("req.params: ", req.params)
    //deleting request based on id
    const deletedrequest = await requestModel.deleteOne({ _id: ObjectId(req.params.requestid) })
    if (deletedrequest) {
      res.status(200).send({
        success: true,
        deletedrequest: deletedrequest,
        message: "Booking/Request has been deleted!"
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
const postFlightRequest = async (req, res) => {
  try {
    //checking if user already post requested with this booking
    const ifrequest = await postflightRequestModel.findOne({ $and: [{ requestedBy: req.body.requestedBy }, { bookingId: req.body.bookingId }] })
    console.log(ifrequest)

    if (ifrequest) {
      if (ifrequest.length > 0) {
        console.log(ifrequest)
        res.status(409).send({
          success: false,
          message: "You Already Requested All Providers To Take Your This Booking"
        });
      }
    }
    var newPostRequest;
    if (req.body.type == "Ship") {
      //creating post request of ship to all provider
      newPostRequest = await new postflightRequestModel({
        mmsiNumber: req.body.mmsiNumber,
        type: "Ship",
        bookingId: req.body.bookingId,
        requestedBy: req.body.requestedBy,
        pickupPortUnlocode: req.body.pickupPortUnlocode,
        dropoffPortUnlocode: req.body.dropoffPortUnlocode,
        departurePort: req.body.departurePort,
        shipArrivaldate: req.body.ETA,
        destinationPort: req.body.destinationPort
      }).save();

    } else {
      console.log("req.body: ",req.body)
      //creating post request of flight to all provider
      var flightinfo = await get_fa_flight_id_info(req.body.fa_flight_id)
      var departureAirport = await getairportInfo(flightinfo.origin.code)
      var destinationAirport = await getairportInfo(flightinfo.destination.code)
      var pickupAirport = travelapiairports.filter(item => item.code==req.body.pickupIATACityCode)
      var destinationAirport2 = travelapiairports.filter(item => item.code==req.body.dropoffIATACityCode)
      //Sending searched airports
      console.log("pickupAirport destinationAirport2 ",pickupAirport,destinationAirport2)
      newPostRequest = await new postflightRequestModel({
        fa_flight_id: req.body.fa_flight_id,
        type: "Flight",
        bookingId: req.body.bookingId,
        requestedBy: req.body.requestedBy,
        pickupIATACityCode: req.body.pickupIATACityCode,
        dropoffIATACityCode: req.body.dropoffIATACityCode,
        pickupCity: req.body.pickupCity,
        dropoffCity: req.body.dropoffCity,
        airline: flightinfo.operator,
        flightNumber: flightinfo.ident_iata,
        flightarrivalDate: flightinfo.scheduled_in,
        date: flightinfo.scheduled_out,
        departureAirport: pickupAirport[0].name,
        destinationAirport: destinationAirport2[0].name
      }).save();

    }

    if (newPostRequest) {
      console.log("Request Done", newPostRequest)
      //sending success if new post gets created
      var message = `Post Request has been made against your ${req.body.type.toLowerCase()} `
      /*const notification = {
        contents: {
          en: `Post Request has been made against your ${req.body.type.toLowerCase()} `,
        },
        data:{
          id:newPostRequest._id,
          type:`postrequestCreated`
        },
        include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
      };*/
      // const user = await userModel.findOne({ "_id": ObjectId(req.body.customerId) });
      // var playerID=user.playerID?user.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
      // const response = await createNotification(message, newPostRequest._id, "postrequestCreated", playerID)
      res.status(200).send({
        success: true,
        postrequest: newPostRequest,
        message: "Post Request Sent To All Providers"
      });
    } else {
      console.log("Post Request Failed")
      //sending failure if new post doesn't get created
      res.status(404).send({
        success: false,
        message: "Post Request Not Sent"
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
const staticInfoByfaFlightid = async (req, res) => {
  try {
    console.log(req.params)
    //getting static flightaware information of certain flight
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/flights/${req.params.fa_flight_id}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };

    axios(config)
      .then(function (response) {
        console.log(response.data);
        //sending error if flight doesn't get found
        if (response.data) {
          res.status(200).send({
            success: true,
            flightInfo: response.data.flights[0],
            message: "Information For Flight Aware"
          });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
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
const flightLatestPosition = async (req, res) => {
  try {
    console.log(req.params)
    //getting latest location of certain flight
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/flights/${req.params.fa_flight_id}/position`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
    axios(config)
      .then(async function (response) {
        console.log(JSON.stringify(response.data));
        if (response.data.last_position) {
          res.status(200).send({
            success: true,
            flightlatestPosition: response.data.last_position,
            message: "Flight Latest Position Found"
          });
        } else {
          var flightinfo = await get_fa_flight_id_info(req.params.fa_flight_id)
          console.log("flightinfo ", flightinfo)
          if (flightinfo.status === 'Scheduled') {
            res.status(404).send({
              success: false,
              message: "Flight has not departed"
            });
          } else if (flightinfo.status === 'Cancelled') {
            res.status(404).send({
              success: false,
              message: "Flight has been cancelled"
            });
          } else {
            res.status(404).send({
              success: false,
              message: "Flight is reached to its destination"
            });
          }

        }
      })
      .catch(function (error) {
        console.log(error);
        res.status(404).json({
          success: false,
          message: "Flight is reached to its destination"
        })
      });
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
//Flight related controllers Ended
//Ship related controllers started
const getShips = async (req, res) => {
  try {
    console.log(req.body)
    //validating if required information is getting for get flights
    const result = await getshipsSchema.validateAsync(req.body)
    const pickupPortUnlocode = req.body.pickupPortUnlocode
    const dropoffPortUnlocode = req.body.dropoffPortUnlocode
    const startingDate = new Date(req.body.startingDate)
    const endingDate = new Date(req.body.endingDate)
    console.log(startingDate, endingDate, pickupPortUnlocode, dropoffPortUnlocode)
    //finding ships between 2 cities and 2 dates
    var ships = await shipsModel.find(
      {
        pickupPortUnlocode: pickupPortUnlocode,
        dropoffPortUnlocode: dropoffPortUnlocode,
        shipDate: { $lte: req.body.endingDate }
      }
    ).populate('provider');
    var filteredships = [];
    console.log("ships ", ships);
    ships = ships.filter(ship => ship.shipDate >= startingDate);
    sortedShips = await ships.reverse();
    //finding ships between 2 ports and 2 dates from marinetraffic
    var config = {
      method: 'get',
      url: `https://services.marinetraffic.com/api/expectedarrivals/v:3/87ce5e0b43f408213c2973b6a5fbde3df607717e/portid:${dropoffPortUnlocode}/fromportid:${pickupPortUnlocode}/fromdate:${req.body.startingDate}/todate:${req.body.endingDate}/protocol:xml`,
      headers: {}
    };
    let marineships = await axios(config)
      .then(async function (response) {
        console.log("response.data", response.data);
        var marineshipsxml = response.data
        var onedaybefore = new Date();
        var today = new Date();
        //Creating one month before date
        onedaybefore.setDate(onedaybefore.getDate() - 1);
        console.log("onedaybefore: ", onedaybefore);
        parser.parseStringPromise(marineshipsxml).then(async function (results) {
          // parsing to json
          console.log("results.ETA.VESSEL_ETA: ", results.ETA.VESSEL_ETA)
          var filteredships = []
          if (results.ETA.VESSEL_ETA) {
            for (let step = 0; step < results.ETA.VESSEL_ETA.length; step++) {
              console.log("ship ", results.ETA.VESSEL_ETA[step].$)
              var mmsi = results.ETA.VESSEL_ETA[step].$.MMSI;
              var eta = results.ETA.VESSEL_ETA[step].$.ETA;
              //var departureDate = await getDepartureDate(ship.$.MMSI, pickupPortUnlocode, ship.$.ETA);
              //Find all the ships added by single provider
              console.log(mmsi)
              console.log(pickupPortUnlocode)
              console.log(eta)
              var fromdate = fromdate ? fromdate : '2022-05-29'
              var todate = eta ? eta.slice(0, 10) : '2022-06-07'
              console.log("todate ", todate)
              var vdate = new Date(todate)
              console.log(vdate)
              var dd = String(vdate.getDate() + 1).padStart(2, '0');
              var mm = String(vdate.getMonth() + 1).padStart(2, '0');
              var yyyy = vdate.getFullYear();
              console.log(parseInt(mm))
              if (parseInt(mm) > 3) {
                console.log("it got here")
                var tmonth = parseInt(mm) - 3
                var tsmonth = "0" + String(tmonth)
                console.log("tsmonth", tsmonth)
                mm = tsmonth
              } else {
                console.log("it got here")
                var tmonth = 12 + parseInt(mm) - 3
                var tsmonth
                if (tmonth < 10) {
                  tsmonth = "0" + String(tmonth)
                } else {
                  var tsmonth = String(tmonth)
                }
                yyyy = yyyy - 1
                console.log("tsmonth", tsmonth)
                mm = tsmonth
              }
              var threemonth = yyyy + '-' + mm + '-' + dd;
              var fromdate = threemonth;
              console.log("threemonth ", threemonth)

              var config = {
                method: 'get',
                url: `https://services.marinetraffic.com/api/portcalls/v:4/${process.env.MARINE_TRAFFIC_EV01}/portid:${pickupPortUnlocode}/mmsi:${mmsi}/fromdate:${threemonth}/todate:${todate}/movetype:1/protocol:xml`,
                headers: {}
              };
              var departuredate;
              let data1 = await axios(config)
              console.log("data1.data ", await data1.data)
              var ss = await parser.parseStringPromise(await data1.data)
              console.log(ss);
              console.log("results.PORTCALLS ", ss.PORTCALLS)
              if (ss.PORTCALLS) {
                console.log("results", ss.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC);
                departuredate = ss.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC
                //return results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC

              } else {
                departuredate = null
                //return null;
              }
              console.log("departureDate ", departuredate);
              console.log("departureDate 2", new Date(departuredate));
              departuredate = new Date(departuredate);
              departuredate = await convertUTCDateToLocalDate(departuredate)
              console.log("onedaybefore ", onedaybefore);
              console.log("departureDate 3", departuredate);
              if (departuredate > onedaybefore) {
                console.log("push ships");
                filteredships.push(results.ETA.VESSEL_ETA[step])
                //return true
              } else {
                console.log("ignore ship");
                //return false
              }
            }




          }
          console.log("filteredships ", filteredships)
          return res.status(200).send({
            success: true,
            ships: sortedShips,
            marinetrafficships: filteredships,
            message: "Marine Traffic Ships And Ships Found"
          });
        })


      })
      .catch(function (error) {
        console.log("error", error);
        res.status(404).send({
          success: false,
          message: "Invalid Ports Selected"
        });
      });
    console.log("marineships ", marineships)




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
const shipLatestPosition = async (req, res) => {
  try {
    if (req.params.isindevelopment === "true") {
      var shipposition = [{
        $: {
          LAT: 37.728515,
          LON: -122.514848
        }
      }];
      shipposition[0].$.LAT = 37.728515;
      shipposition[0].$.LON = -122.514848;
      return res.status(200).send({
        success: true,
        shipposition: shipposition,
        message: "Marine Traffic Ship Position Found"
      });

    }
    console.log(req.params)
    //getting latest location of certain ship
    var config = {
      method: 'get',
      url: `https://services.marinetraffic.com/api/exportvessel/v:5/${process.env.MARINE_TRAFFIC_PS07}/timespan:20/mmsi:${req.params.mmsinumber}`,
      headers: {}
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        var xmlresponse = response.data
        parser.parseString(xmlresponse, async function (err, results) {
          console.log(results)
          if (results.POS.row) {
            console.log(results.POS.row[0].$.LAT)
            var shipposition = results.POS.row
            shipposition[0].$.LAT = parseFloat(shipposition[0].$.LAT)
            shipposition[0].$.LON = parseFloat(shipposition[0].$.LON)
            const ifLocation = await shipsLatestLocationModel.findOne({ mmsinumber: req.params.mmsinumber })
            if (ifLocation) {
              const updatedLocation = await shipsLatestLocationModel.updateOne(
                { mmsinumber: req.params.mmsinumber },
                {
                  $set: {
                    location: {
                      lat: parseFloat(shipposition[0].$.LAT),
                      lng: parseFloat(shipposition[0].$.LON)
                    }
                  }
                }
              );
              return res.status(200).send({
                success: true,
                shipposition: shipposition,
                message: "Marine Traffic Ship Position Found"
              });
            } else {
              const newLocation = await new shipsLatestLocationModel({
                location: {
                  lat: parseFloat(shipposition[0].$.LAT),
                  lng: parseFloat(shipposition[0].$.LON)
                },
                mmsinumber: req.params.mmsinumber
              }).save();
              res.status(200).send({
                success: true,
                shipposition: shipposition,
                message: "Marine Traffic Ship Position Found"
              });
            }

          } else {
            const ifLocation = await shipsLatestLocationModel.findOne({ mmsinumber: req.params.mmsinumber })
            console.log("ifLocation ", ifLocation)
            if (ifLocation) {
              var shipposition = [{
                $: {
                  LAT: ifLocation.location.lat,
                  LON: ifLocation.location.lng
                }
              }];
              return res.status(200).send({
                success: true,
                shipposition: shipposition,
                message: "Marine Traffic Ship Position Found"
              });
            }
            res.status(404).send({
              success: false,
              message: "Ship Can't be tracked right now, Please try later"
            });
          }

        })
      })
      .catch(function (error) {
        console.log(error);
        res.status(404).send({
          success: false,
          message: "Wrong MMSI Number"
        });
      });
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
//Ship related controllers ended
//Request Driver Related APIs Started
const createDriverrequest = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //creating request to all drivers
    /*
    const newrequestdriver = await new requestdriverModel({
        pickupAddress: req.body.pickupAddress,
        dropAddress: req.body.dropAddress,
        vehicleType: req.body.vehicleType,
        category:req.body.category,
        productType:req.body.productType,
        productWeight:req.body.productWeight,
        productDate:req.body.productDate,
        productTime:req.body.productTime,
        productImage:req.body.productImage,
        instructions:req.body.instructions,
        recieverName:req.body.recieverName,
        recieverPhoneno:req.body.recieverPhoneno,
        requestedBy:req.body.requestedBy
    }).save();*/
    var newRequest = await new requestModel({
      type: "Land",
      requestedBy: req.body.customerId,
      bookingId: req.body.bookingId
    }).save();
    if (newRequest) {
      console.log("Request Driver Done", newRequest)
      //sending success if request gets created
      res.status(200).send({
        success: true,
        request: newRequest,
        message: "Request Driver Successful"
      });
    } else {
      console.log("Request Driver Failed")
      //sending failure if request doesn't gets created
      res.status(404).send({
        success: false,
        message: "Request Driver Failed"
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
const cancelDriverrequest = async (req, res) => {
  try {
    console.log(req.body)
    const request = await requestModel.findOne({ "_id": req.body.requestId }).populate('requestedBy');
    console.log("request", request)
    let date = new Date();
    console.log(date, request.createdAt);
    let date1 = moment.tz(date, "YYYY-MM-DDTHH:mm:ss", "America/Chicago").local();
    let date2 = moment.tz(request.createdAt, "YYYY-MM-DDTHH:mm:ss", "America/Chicago").local();
    var x = moment.duration(date1.diff(date2));
    console.log("x", x._data)
    if (request.type === "Land") {
      if (x._data.minutes > 10 || x._data.hours > 0 || x._data.days > 0) {
        console.log("it's greater")
        res.status(404).send({
          success: false,
          message: "You can't cancel request after 10 minutes"
        });
      } else {
        console.log("it's less than 5 minutes")
        if (request.state) {
          res.status(400).send({
            success: false,
            message: "You request has already been accepted and initiated by Driver"
          })
        } else {
          //Updating status of customer flight request
          const updatedRequest = await requestModel.updateOne(
            { _id: req.body.requestId },
            {
              $set: {
                status: "Cancelled",
              }
            }
          );
          if (updatedRequest) {
            console.log("Request Status Updated", updatedRequest)
            //Sending success if updating request status get successful
            var message = `Your request has been cancelled by the driver`
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


    } else {
      if (x._data.days > 0) {
        console.log("it's greater")
        res.status(404).send({
          success: false,
          message: "You can't cancel request after 1 Day"
        });
      } else {
        console.log("it's less than 1 day")
        if (request.state) {
          res.status(400).send({
            success: false,
            message: "You request has already been accepted and initiated by Driver"
          })
        } else {
          //Updating status of customer flight request
          const updatedRequest = await requestModel.updateOne(
            { _id: req.body.requestId },
            {
              $set: {
                status: "Cancelled",
              }
            }
          );
          if (updatedRequest) {
            console.log("Request Status Updated", updatedRequest)
            //Sending success if updating request status get successful
            var message = `Your request has been cancelled by the driver`
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
const calculateDistance = async (req, res) => {
  try {
    console.log("req.body is", req.body);
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
    var distanceInKM = _getDistanceFromLatLonInKm(req.body.pickupAddress.lat, req.body.pickupAddress.lng, req.body.dropAddress.lat, req.body.dropAddress.lng)
    console.log("new in KM", distanceInKM)
    res.status(200).send({
      success: true,
      distanceInKM: distanceInKM,
      message: "Distance Between 2 Latitude and Longitude Has Been Calculated"
    });
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
const convertXml = async (req, res) => {
  try {

    var xmldata = '<?xml version=”1.0" encoding=”UTF-8"?>' +
      '<Student>' +
      '<PersonalInformation>' +
      '<FirstName>Sravan</FirstName>' +
      '<LastName>Kumar</LastName>' +
      '<Gender>Male</Gender>' +
      '</PersonalInformation>' +
      '<PersonalInformation>' +
      '<FirstName>Sudheer</FirstName>' +
      '<LastName>Bandlamudi</LastName>' +
      '<Gender>Male</Gender>' +
      '</PersonalInformation>' +
      '</Student>';
    parser.parseString(xmldata, function (err, results) {
      // parsing to json
      let data = JSON.stringify(results)
      // display the json data
      console.log("results", data);
      res.status(200).send({
        success: true,
        convertedXml: data,
        message: "XML has been converted"
      });
    });

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
const customerOrderhistory = async (req, res) => {
  try {

    await cancelRequestsAutomatically(req.params.customerId).then(async (data) => {
      console.log("data", data)
      //Find all the requests against single provider
      console.log(req.params.customerId)
      var onemonthbefore = new Date();
      //Creating one month before date
      onemonthbefore.setDate(onemonthbefore.getDate() - 25);
      console.log(onemonthbefore);
      var requests = await requestModel.find({
        requestedBy: req.params.customerId, createdAt: {
          $gte: onemonthbefore
        }
      }).populate('flight ship provider requestedBy bookingId')
      var updatedRequests = requests

      //console.log("requests ",requests)
      if (requests.length > 0) {
        var dueDates = []
        //console.log("results ",results)
        await updatedRequests.forEach(request => {
          console.log("request hceck here ", request)
          let date = new Date();
          console.log(date, request.createdAt);
          var editDue = request.createdAt;
          if (request.type === "Land") {
            console.log("editDue ", editDue)
            var editDueChanged = moment(editDue).add(10, 'm').toDate();
            console.log("editDueChanged ", editDueChanged);
            Object.defineProperty(request, "shouldEditTill", {
              value: editDueChanged
            })
            request["shouldEditTill"] = editDueChanged;
            console.log("request after update ", request)
            dueDates.push({
              request,
              shouldEditTill: editDueChanged
            })

          } else {
            console.log("editDue ", editDue)
            var editDueChanged = moment(editDue).add(1, 'days').toDate();
            console.log("editDueChanged ", editDueChanged);
            Object.defineProperty(request, "shouldEditTill", {
              value: editDueChanged
            })
            request["shouldEditTill"] = editDueChanged;
            console.log("request after update ", request)
            dueDates.push({
              request,
              shouldEditTill: editDueChanged
            })
          }
        });


        //console.log("initialArr", requests);
        //Sending success if requests get found
        res.status(200).send({
          success: true,
          message: "Order History Of Customers Found",
          requests: dueDates.reverse()
        });
      } else {
        //Sending success if requests don't get found
        res.status(404).send({
          success: false,
          message: "Order History Of Customers Not Found"
        });
      }
    })

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
const postRequestOrderhistory = async (req, res) => {
  try {
    //Find all the requests against single provider
    console.log(req.params.customerId)
    var postrequests = await postflightRequestModel.find({ requestedBy: req.params.customerId }).populate('flight ship provider requestedBy bookingId')
    console.log("postrequests ", postrequests)
    //console.log("postrequests ",requests)
    if (postrequests.length > 0) {
      //Sending success if postrequests get found
      res.status(200).send({
        success: true,
        message: "Post Requests Of Customers Found",
        postrequests: postrequests.reverse()
      });
    } else {
      //Sending success if postrequests don't get found
      res.status(404).send({
        success: false,
        message: "Post Requests Of Customers Not Found"
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
const securePayment = async (req, res) => {
  try {
    console.log(req.body);
    let email = req.body.email;
    let existingCustomers = await stripe.customers.list({ email: email });
    console.log("existingCustomers", existingCustomers)
    if (existingCustomers.data.length) {
      // don't create customer if already exists
      console.log("Dont create", existingCustomers.data[0].id)
      // create charge
      const charge = await stripe.charges.create({
        amount: req.body.amount * 100,
        currency: "USD",
        customer: existingCustomers.data[0].id,
        description: "Crowdshipping Customer Payment 2",
        source: existingCustomers.data[0].default_source
      })
      console.log(charge)
    } else {
      console.log("create customer");
      //create customer first against email
      const customer = await stripe.customers
        .create({
          name: req.body.name,
          email: req.body.email,
          source: req.body.stripeToken,
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          },
        })
      console.log(customer)
      if (customer) {
        //charge customer after creating customer
        const charge = await stripe.charges.create({
          amount: req.body.amount * 100,
          currency: "USD",
          customer: customer.id,
          description: "Crowdshipping Customer Payment 2",
          source: req.body.source,
          receipt_email: req.body.email
        })
        console.log(charge)
        if (charge) {
          res.status(200).send({
            success: true,
            message: "Payment has been made"
          })
        }
      } else {
        res.status(422).send({
          success: false,
          message: "Error Creating New Customer"
        })
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
const securePayment2 = async (req, res) => {
  try {
    console.log(req.body);
    let email = req.body.email;
    let existingCustomers = await stripe.customers.list({ email: email });
    console.log("existingCustomers", existingCustomers)
    if (existingCustomers.data.length) {
      // don't create customer if already exists
      console.log("Dont create", existingCustomers.data[0].id)
      // create charge
      const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount * 100,
        currency: 'USD',
        customer: existingCustomers.data[0].id,
        description: "Customer Payment"
      });
      res.status(200).send({
        success: true,
        message: "Payment has been made",
        paymentIntent: paymentIntent
      })
    } else {
      console.log("create customer");
      //create customer first against email
      const customer = await stripe.customers
        .create({
          name: req.body.name,
          email: req.body.email,
          address: {
            line1: '510 Townsend St',
            postal_code: '98140',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
          },
        })
      console.log(customer)
      if (customer) {
        //charge customer after creating customer
        const paymentIntent = await stripe.paymentIntents.create({
          amount: req.body.amount * 100,
          currency: 'USD',
          customer: customer.id,
          description: "Customer Payment"
        });
        console.log(paymentIntent)
        if (paymentIntent) {
          res.status(200).send({
            success: true,
            message: "Payment has been made",
            paymentIntent: paymentIntent
          })
        }
      } else {
        res.status(422).send({
          success: false,
          message: "Error Creating New Customer"
        })
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

const createPaymentshistory = async (req, res) => {
  try {
    console.log(req.body);
    //Checking if already paid
    var ifpayment = await paymentsModel.findOne({ paidBy: req.body.paidBy, requestId: req.body.requestId })
    console.log("ifpayment ", ifpayment)
    if (ifpayment) {
      //Sending failure if already paid
      res.status(400).send({
        success: false,
        message: "You already created payment history against this booking"
      });
    } else {

      var request = await requestModel.findOne({ _id: req.body.requestId }).populate('bookingId')
      console.log("request ", request)
      //Creating payment history
      const newPayment = await new paymentsModel({
        amount: req.body.amount,
        paidBy: req.body.paidBy,
        requestId: req.body.requestId,
        paidTo: request.provider
      }).save();
      //Updating Payment check against request
      const updatedRequest = await requestModel.updateOne(
        { _id: req.body.requestId },
        {
          $set: {
            isMakePayment: true,
            paymentDue: null
          }
        }
      );
      if (newPayment) {
        //Creating Reset OTP for SMS
        var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const number = request.bookingId.recieverPhoneno.countrycode +''+ request.bookingId.recieverPhoneno.phoneno
        console.log("numberrr: ", number)
        //Sending Reset OTP to user number
        await client.messages.create({
          body: `Share This OTP ${otp} When You Recieve Parsel`,
          to: `+${number}`,
          from: '(989) 403-0559'
        })
          .then(async (message) => {
            console.log(message)
            //Attaching otp to request document so we could verify on order completion
            const updatedRequest = await requestModel.updateOne(
              { _id: req.body.requestId },
              {
                $set: {
                  completionOtp: otp,
                }
              }
            );
          }).catch(error => { console.log(error) })
        res.status(200).send({
          success: true,
          newPayment: newPayment,
          message: "Payment History Created"
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Something went wrong"
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
const calculateFlightfare = async (req, res) => {
  try {
    console.log("getting all driver requests")
    console.log("req.body: ", req.body)
    const pickupLocation = req.body.pickupLocation;
    const dropoffLocation = req.body.dropoffLocation;
  }
  catch (err) {
    console.log("err ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

}
const calculateShipfare = async (req, res) => {
  try {
    console.log("getting all driver requests")
    console.log("req.body: ", req.body)
    const pickupLocation = req.body.pickupLocation;
    const dropoffLocation = req.body.dropoffLocation;
  }
  catch (err) {
    console.log("err ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

}
const updatepaymentMissed = async (req, res) => {
  try {
    /*
    await cancelRequestsAutomatically().then((err, data) => {
      console.log(err, data)
      res.status(200).send({
        success: true,
        message: "Payment History Created"
      });
    })*/
    var currentDate = new Date();
    console.log(currentDate)
    var requests = await requestModel.find({ status: 'Pending' }).populate('flight ship bookingId')
    //console.log(requests)
    var operation = await requests.forEach(async request => {
      //console.log(request)
      if (request.type == "Flight") {

        if (request.flight) {
          if (request.flight.flightDate < currentDate) {
            console.log("It should be Deleted: ", request)
            const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
          }
        } else {
          console.log("request with null flight", request)
          const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
        }
      }
      if (request.type == "Ship") {
        //console.log("Request: ",request)
        if (request.ship) {
          if (request.ship.eta < currentDate) {
            console.log("It should be deleted: ", request)
            const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
          }
        } else {
          console.log("request with null ship", request)
          const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
        }
      }
      if (request.type == "Land") {
        console.log("Request: ", request)
        if (request.bookingId) {
          if (request.bookingId.pickupType == "Instant") {
            if (request.createdAt) {
              //Creating one week before date
              onedayafter = request.createdAt
              onedayafter.setDate(onedayafter.getDate() + 1);
              //console.log(onedayafter);
              if (onedayafter < currentDate) {
                console.log("It should be deleted: ", request);
                const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
              }
            }
          } else if (request.bookingId.pickupType == "Schedule") {
            if (request.bookingId.todate < currentDate) {
              console.log("It should be deleted: ", request)
              const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
            }
          }
        } else {
          console.log("request with null booking", request)
          const deletedRequest = await requestModel.deleteOne({ "_id": ObjectId(request._id) });
        }
      }

    })
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
const rateRide = async (req, res) => {
  try {
    console.log(req.body);
    //Checking if already rated
    var ifrating = await ratingsModel.findOne({ requestId: req.body.requestId, ratedBy: req.body.ratedBy })
    if (ifrating) {
      //Sending Error If Already Rated
      res.status(400).send({
        success: false,
        message: "You have already rated your delivery"
      });
    } else {
      //Creating New Rating
      const newRating = await new ratingsModel({
        requestId: req.body.requestId,
        ratedBy: req.body.ratedBy,
        rate: req.body.rate,
        ratedTo: req.body.ratedTo
      }).save();
      if (newRating) {
        //Sending Success If New Rating Created
        res.status(200).send({
          success: true,
          newRating: newRating,
          message: "Rating Added"
        });
      } else {
        res.status(400).send({
          success: false,
          message: "Something went wrong"
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
//Request Driver Related APIs Ended
module.exports = {
  searchCity,
  getFlights,
  getNextFlights,
  requestProvider,
  getUserrequests,
  deleteUserrequests,
  postFlightRequest,
  staticInfoByfaFlightid,
  getShips,
  shipLatestPosition,
  createDriverrequest,
  calculateDistance,
  convertXml,
  securePayment,
  securePayment2,
  createPaymentshistory,
  customerOrderhistory,
  postRequestOrderhistory,
  flightLatestPosition,
  calculateFlightfare,
  calculateShipfare,
  cancelDriverrequest,
  updatepaymentMissed,
  rateRide
};