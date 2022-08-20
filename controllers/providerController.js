var userModel = require('../models/userModel')
var flightsModel = require('../models/flightsModel');
const requestModel = require('../models/requestModel');
var bookingModel = require('../models/bookingModel')
var postflightRequestModel = require('../models/postflightRequest');
var locationsModel = require('../models/driverLocations')
var ObjectId = require('mongodb').ObjectID;
var axios = require('axios');
const shipsModel = require('../models/shipsModel');
var airports2 = require('@nitro-land/airport-codes');
var airportsdata = require('@nitro-land/airport-codes').toJSON();
var ports = require('../APIsPractice/portsdata.json');
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const OneSignal2 = require('onesignal-node');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const otpGenerator = require('otp-generator')
const { createNotification } = require('../helpers/pushNotification');
const { deleteRequestsAutomatically } = require('../helpers/deleteRequest');
const { getDepartureDate } = require('../helpers/getDepartureDate');
// With default options
const client2 = new OneSignal2.Client(ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);
const { flightSchema, postflightSchema, shipSchema, searchflightsSchema } = require('../helpers/flightshipValidationSchema');
var { capitalizeFirstLetter,
  get_fa_flight_id_info,
  checkifcorrectports } = require('../middlewares/providerMiddleware');
const paymentsModel = require('../models/paymentsModel');
const vehicleModel = require('../models/vehicleModel');
const { checkIfMax3 } = require('../helpers/acceptRequestChecks');
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
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
const addFlight = async (req, res) => {
  try {
    console.log("req.files: ", req.files)
    console.log("req.body: ", req.body)
    //Validating flight information
    const result = await flightSchema.validateAsync(req.body)
    var ticketImage
    if (req.files) {
      //setting ticket image
      ticketImage = req.files['ticketImage'] ? "/src/" + req.files['ticketImage'][0].filename : null
    } else {
      ticketImage = null
    }
    const ifflightexists = await flightsModel.find({ fa_flight_id: req.body.fa_flight_id, provider: ObjectId(req.body.providerId) })
    console.log("ifflightexists ", ifflightexists)
    if (ifflightexists.length > 0) {
      res.status(404).send({
        success: false,
        message: "You Have Already Added This Flight As Provider"
      });
    } else {
      //Creating new flight
      var pickupCity = (travelcities.filter(item => item.code === req.body.pickupIATACityCode));
      console.log("pickupCity: ", pickupCity)
      var dropoffCity = (travelcities.filter(item => item.code === req.body.dropoffIATACityCode));
      console.log("dropoffCity: ", dropoffCity)
      const newFlight = await new flightsModel({
        isProvider: true,
        provider: req.body.providerId,
        pickupCity: pickupCity[0].name,
        dropoffCity: dropoffCity[0].name,
        flightDate: req.body.flightDate,
        departureAirport: req.body.departureAirport,
        destinationAirport: req.body.destinationAirport,
        departureTime: req.body.departureTime,
        destinationTime: req.body.destinationTime,
        flightNumber: req.body.flightNumber,
        flightAirline: req.body.flightAirline,
        fa_flight_id: req.body.fa_flight_id,
        flightarrivalDate: req.body.flightarrivalDate,
        pickupIATACityCode: req.body.pickupIATACityCode,
        dropoffIATACityCode: req.body.dropoffIATACityCode,
        ticketImage: ticketImage
      }).save();
      if (newFlight) {
        console.log("You are now flight", newFlight)
        //Sending success if new flight gets created
        res.status(200).send({
          success: true,
          message: "Flight Has Been Added"
        });
      } else {
        console.log("Request Failed")
        //Sending error if new flight doesn't get created
        res.status(404).send({
          success: false,
          message: "Request Failed"
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
const deleteFlight = async (req, res) => {
  try {
    console.log("delete flightId: ", req.params.flightid)
    //soft deleting user by ID 
    const flight = await flightsModel.deleteOne({ "_id": ObjectId(req.params.flightid) });
    if (flight) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'Flight Deleted'
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Flight By Given ID'
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
const getproviderFlights = async (req, res) => {
  try {
    console.log(req.params.providerId, 'req.params.providerId')
    //Validating flights information search
    const flights = await flightsModel.find({ provider: req.params.providerId }).populate('provider').sort({ flightDate: -1 })
    console.log("flights", flights)
    var sortedFlights = flights
    if (flights.length > 0) {
      //Sending success if flight found for provider
      res.status(200).send({
        success: true,
        message: "Get All Flights Added By Provider Found",
        flights: sortedFlights
      });
    } else {
      res.status(404).send({
        success: false,
        message: "Requests Not Found"
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
const getFlightsForProvider = async (req, res) => {
  try {
    console.log(req.body)
    const departCode = req.body.departCode
    const arrivalCode = req.body.arrivalCode
    const startingDate = new Date(req.body.startingDate)
    const endingDate = new Date(req.body.endingDate)
    console.log(startingDate, endingDate, departCode, arrivalCode)
    //Getting flights for provider for (after add flight) provider
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/schedules/${startingDate}/${endingDate}?origin=${departCode}&destination=${arrivalCode}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };

    axios(config)
      .then(function (response) {
        console.log(`Flights from ${departCode} to ${arrivalCode}`, response.data);
        //Sending success if flights get found
        var scheduleds = response.data.scheduled
        console.log("date: ", req.body.date)
        flights = flights.filter(flight => flight.scheduled_out >= startingDate);
        res.status(200).send({
          success: true,
          message: "Flights Found",
          flightawareflights: scheduleds
        });

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
const getRequestsToProviderFlight = async (req, res) => {
  try {
    console.log(req.params.flightId)
    //Finding all the requests against single flight
    const requests = await requestModel.find({ flight: req.params.flightId }).populate('flight provider requestedBy bookingId')
    if (requests.length > 0) {
      //Sending success if requests get found
      res.status(200).send({
        success: true,
        message: "Requests Against Flight Found",
        requests: requests
      });
    } else {
      //Sending failure if requests doesn't get found
      res.status(404).send({
        success: false,
        message: "Flights Not Found"
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
const getRequestsToAllProviderFlights = async (req, res) => {
  try {
    //Deleting All Requests that passed requred duedate
    await deleteRequestsAutomatically()
    //Find all the requests against single provider
    console.log(req.params.providerId)
    var requests = await requestModel.find({ provider: req.params.providerId }).populate('flight ship provider requestedBy bookingId')
    if (requests.length > 0) {
      //Sending success if requests get found
      res.status(200).send({
        success: true,
        message: "Requests to All Provider Flights Found",
        requests: await requests.reverse()
      });
    } else {
      //Sending success if requests don't get found
      res.status(404).send({
        success: false,
        message: "Requests Not Found"
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
const changerequestStatus = async (req, res) => {
  try {
    console.log(req.body)
    const request = await requestModel.findOne({ _id: req.body.requestId }).populate('requestedBy')
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    console.log(tomorrow)
    if (request.status) {
      if (request.status == "Accepted" && req.body.newStatus == "Accepted") {
        return res.status(400).send({
          success: true,
          message: "Request Has Been Already Accepted"
        });
      }
    }
    //Updating status of customer flight request
    const updatedRequest = await requestModel.updateOne(
      { _id: req.body.requestId },
      {
        $set: {
          status: req.body.newStatus,
        }
      }
    );
    if (req.body.newStatus == "Accepted") {
      const updatedRequest2 = await requestModel.updateOne(
        { _id: req.body.requestId },
        {
          $set: {
            isMakePayment: false,
            paymentDue: tomorrow
          }
        }
      );
    }
    if (updatedRequest) {
      console.log("Request Status Updated", updatedRequest)
      //Sending success if updating request status get successful
      var message = `Your request has been ${req.body.newStatus.toLowerCase()} by the provider`
      /*const notification = {
        contents: {
          en: `Your request has been ${req.body.newStatus.toLowerCase()} by the provider`,
        },
        data: {
          id: req.body.requestId,
          type: `request${req.body.newStatus}`
        },
        include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
      };*/
      var playerID=request.requestedBy.playerID?request.requestedBy.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
      const response = await createNotification(message, req.body.requestId, `request${req.body.newStatus}`,playerID)
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
const allPostRequests = async (req, res) => {
  try {
    let date = new Date();
    console.log(date)
    date.setDate(date.getDate() - 1);
    console.log(date);
    const filter = {
      $or: [
        {
          type: "Flight", date: {
            $gte: date,
          }
        },
        {
          type: "Ship", shipArrivaldate: {
            $gte: date,
          }
        }
      ]
    };
    //Finding all post requests 
    //isn't we should call post requests only not accepted
    var postRequests = await postflightRequestModel.find(filter).populate('bookingId requestedBy acceptedBy')
    var sortedRequests = await postRequests.reverse()
    if (postRequests.length > 0) {
      //Sending success if all post requests get found
      res.status(200).send({
        success: true,
        message: "All Post Requests Found",
        postRequests: sortedRequests
      });
    } else {
      //Sending failure if all post requests don't get found
      res.status(404).send({
        success: false,
        message: "Requests Not Found"
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
const changepostRequestStatus = async (req, res) => {
  try {
    //Finding status of customer flight request
    const PostRequest = await postflightRequestModel.findOne({ _id: req.body.postrequestId }).populate('requestedBy')
    console.log(PostRequest)
    if (PostRequest.isAccepted) {
      return res.status(400).send({
        success: true,
        message: "Request Has Been Already Accepted"
      });
    }
    //Updating status of customer flight post request
    const updatedPostRequest = await postflightRequestModel.updateOne(
      { _id: req.body.postrequestId },
      {
        $set: {
          acceptedBy: req.body.providerId,
          isAccepted: true
        }
      }
    );
    if (updatedPostRequest) {
      console.log("Post Request Status Updated", updatedPostRequest)
      const PostRequest2 = await postflightRequestModel.findOne({ _id: req.body.postrequestId })
      //Sending success if post requests get updated
      //Creating notification against post request
      var message = `Your post request has been accepted by the provider`
      /*const notification = {
        contents: {
          en: `Your post request has been accepted by the provider`,
        },
        data: {
          id: req.body.requestId,
          type: `postrequestAccepted`
        },
        include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
      };*/
      var playerID=PostRequest.requestedBy.playerID?PostRequest.requestedBy.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
      const response = await createNotification(message, req.body.requestId, `postrequestAccepted`, playerID)
      res.status(200).send({
        success: true,
        updatedPostRequest: PostRequest2,
        message: "Status Of Request To Flight Changed"
      });
    } else {
      console.log("Post Request Failed")
      //Sending failure if post requests don't get updated
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
const searchAirport = async (req, res) => {
  try {
    console.log(req.params)
    const mySentence = req.params.airport;
    //Converting search query to small letters to make it search better
    const result = mySentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    console.log('NEW SEARCH', airportsdata.filter(item => item.name.startsWith(result)))
    console.log('NEW SEARCH 2', travelapiairports.filter(item => item.name.startsWith(result)))
    //Searching airports based on user search
    var searchedairports = travelapiairports.filter(item => item.name.startsWith(result))
    //Sending searched airports
    if (searchedairports.length < 1) {
      searchedairports = travelapiairports.filter(item => item.name.includes(result))
    }
    res.send({
      airports: searchedairports
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
const searchFlight = async (req, res) => {
  try {
    console.log(req.body)
    //Validating search query for flights
    const result = await searchflightsSchema.validateAsync(req.body)
    console.log(new Date())
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    var nextToday;
    console.log(today)
    if (req.body.date) {
      var userdate = new Date(req.body.date)
      var dd1 = String(userdate.getDate() - 1).padStart(2, '0');
      var dd2 = String(userdate.getDate() + 1).padStart(2, '0');
      var mm1 = String(userdate.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy1 = userdate.getFullYear();
      userdate = yyyy1 + '-' + mm1 + '-' + dd1;
      console.log("userdate2 ", userdate)
      today = userdate
      nextToday = yyyy1 + '-' + mm1 + '-' + dd2;
      console.log("nextToday ", nextToday)
    }
    var flightnumber = req.body.flightnumber.toUpperCase()
    console.log("flightnumber ", flightnumber)
    if (req.body.departCode == req.body.arrivalCode) {
      res.status(400).send({
        success: false,
        message: "Departure and Arrival Airport cant be equal"
      })
    }
    var flightnumber2 = flightnumber.replace(/\D/g, '');
    console.log(flightnumber.length)
    console.log(flightnumber2)
    console.log(flightnumber2.length)
    if (flightnumber.length - 2 == flightnumber2.length) {
      console.log("true")
    } else {
      var s2 = flightnumber2.substring(1);
      console.log("corrected: ", s2)
      flightnumber2 = s2;
      console.log("false")
    }
    //Finding flights for provider after (add form) to select
    /*
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/flights/${flightnumber}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
    
    axios(config)
      .then(function (response) {
        //console.log(response.data);
        //Filtering flights based on pickup and dropoff cities and after current time
        var cities1 = (response.data.flights.filter(item => item.origin != null && item.destination != null));
        var cities = (cities1.filter(item => item.origin.code_iata.includes(req.body.departCode) && item.destination.code_iata.includes(req.body.arrivalCode) && item.scheduled_out > today));
        console.log(cities)
        //Sending flights to frontend
        res.send({
          flights: cities
        })
      })
      .catch(function (error) {
        console.log(error);
      });*/
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/schedules/${userdate}/${nextToday}?origin=${req.body.departCode}&destination=${req.body.arrivalCode}&flight_number=${flightnumber2}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        var cities1 = (response.data.scheduled.filter(item => item.ident_iata == flightnumber));
        if (cities1.length < 1) {
          cities1 = (response.data.scheduled.filter(item => item.actual_ident_iata == flightnumber));
        }
        res.send({
          flights: cities1
        })
      })
      .catch(function (error) {
        console.log(error);
        res.status(404).json({
          success: false,
          message: "No Flights On This Flight"
        })
      });
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
const setRequeststate = async (req, res) => {
  try {
    //Finding state of customer flight request
    const Request = await requestModel.findOne({ _id: req.body.requestId }).populate('requestedBy')
    console.log(Request)
    //Updating state of customer flight post request
    const updatedRequest = await requestModel.updateOne(
      { _id: req.body.requestId },
      {
        $set: {
          state: req.body.state
        }
      }
    );
    if (updatedRequest) {
      console.log("Request Status Updated", updatedRequest)
      //Sending success if post requests get updated
      var message = `Your order has been ${req.body.state == "Transit" ? "in transit " : req.body.state.toLowerCase()} by the provider`
      /*const notification = {
        contents: {
          en: `Your order has been ${req.body.state == "Transit" ? "in transit " : req.body.state.toLowerCase()} by the provider`,
        },
        data: {
          id: req.body.requestId,
          type: req.body.state
        },
        include_player_ids: ["a811c3dd-be0f-4f3b-87c1-676bf931a64d"]
      };*/
      var playerID=Request.requestedBy.playerID?Request.requestedBy.playerID:"a811c3dd-be0f-4f3b-87c1-676bf931a64d"
      const response = await createNotification(message, req.body.requestId, req.body.state, playerID)
      const updatedRequest2 = await requestModel.findOne({ _id: req.body.requestId })
      res.status(200).send({
        success: true,
        updatedRequest: updatedRequest2,
        message: "State Of Request To Flight Changed"
      });
    } else {
      console.log("State Request Failed")
      //Sending failure if post requests don't get updated
      res.status(404).send({
        success: false,
        message: "State Of Request To Flight Not Changed"
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
const verifyingBookingCompletion = async (req, res) => {
  try {
    //Uploading Verification Image
    //Updating state of customer flight post request
    console.log("req.body", req.body)
    var verificationImage
    if (req.files) {
      //Assigning verification image to verification image
      verificationImage = req.files['verificationImage'] ? "/src/" + req.files['verificationImage'][0].filename : null
      const updatedRequest = await requestModel.updateOne(
        { _id: req.body.requestId },
        {
          $set: {
            verificationImage: verificationImage,
            isverificationComplete: true,
            state: "Completed"
          }
        }
      );
      if (updatedRequest) {
        console.log("Request Status Updated", updatedRequest)
        //Sending success if post requests get updated
        res.status(200).send({
          success: true,
          message: "Image Has Been Uploaded"
        });
      } else {
        console.log("State Request Failed")
        //Sending failure if post requests don't get updated
        res.status(404).send({
          success: false,
          message: "Image Has Not Been Uploaded"
        });
      }
    } else {
      ticketImage = null
      res.status(404).send({
        success: false,
        message: "Image Not Recieved"
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
const verifyingBookingOtp = async (req, res) => {
  try {
    //Uploading Verification Otp
    console.log("req.body", req.body)
    //Finding Request With Otp
    const request = await requestModel.findOne({ completionOtp: req.body.completionOtp })
    console.log("request, ", request)
    if (request) {
      //If exists then updating otpverified status
      const updatedRequest = await requestModel.updateOne(
        { _id: request._id },
        {
          $set: {
            isOtpVerified: true
          }
        }
      );
      if (updatedRequest.nModified > 0) {
        console.log("Request Status Updated", updatedRequest)
        //Sending success if post requests get updated
        res.status(200).send({
          success: true,
          message: "Congrats!, Your Booking Has Been Completed"
        });
      } else {
        console.log("State Request Failed")
        //Sending failure if post requests don't get updated
        res.status(400).send({
          success: false,
          message: "Booking Couldn't Be Completed"
        });
      }

    } else {
      res.status(404).send({
        success: false,
        message: "Wrong OTP, Please Try Again"
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
const addFlightAfterPost = async (req, res) => {


  try {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    console.log(tomorrow)
    console.log("req.files: ", req.files)
    console.log("req.body: ", req.body)
    //Validating flight information
    const result = await postflightSchema.validateAsync(req.body)
    var ticketImage
    if (req.files) {
      //setting ticket image
      ticketImage = req.files['ticketImage'] ? "/src/" + req.files['ticketImage'][0].filename : null
    } else {
      ticketImage = null
    }
    //Creating new flight
    const newFlight = await new flightsModel({
      isProvider: true,
      provider: req.body.providerId,
      pickupCity: req.body.pickupCity,
      dropoffCity: req.body.dropoffCity,
      flightDate: req.body.flightDate,
      flightarrivalDate: req.body.flightarrivalDate,
      departureAirport: req.body.departureAirport,
      destinationAirport: req.body.destinationAirport,
      departureTime: req.body.departureTime,
      destinationTime: req.body.destinationTime,
      flightNumber: req.body.flightNumber,
      flightAirline: req.body.flightAirline,
      fa_flight_id: req.body.fa_flight_id,
      pickupIATACityCode: req.body.pickupIATACityCode,
      dropoffIATACityCode: req.body.dropoffIATACityCode,
      ticketImage: ticketImage,
    }).save();
    if (newFlight) {
      console.log("You are now flight", newFlight)
      //Sending success if new flight gets created
      newRequest = await new requestModel({
        flight: newFlight._id,
        type: "Flight",
        provider: req.body.providerId,
        requestedBy: req.body.customerId,
        bookingId: req.body.bookingId,
        isMakePayment: false,
        paymentDue: tomorrow,
        status: "Accepted"
      }).save();
      const postrequest = await postflightRequestModel.deleteOne({ "_id": ObjectId(req.body.postrequestId) });
      res.status(200).send({
        success: true,
        message: "Flight Has Been Added"
      });
    } else {
      console.log("Request Failed")
      //Sending error if new flight doesn't get created
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
const addShipAfterPost = async (req, res) => {


  try {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    console.log(tomorrow)
    console.log("req.files: ", req.files)
    console.log("req.body: ", req.body)
    //Validating flight information
    var ticketImage
    if (req.files) {
      //setting ticket image
      ticketImage = req.files['ticketImage'] ? "/src/" + req.files['ticketImage'][0].filename : null
    } else {
      ticketImage = null
    }
    //Creating new flight
    const newShip = await new shipsModel({
      isProvider: true,
      provider: req.body.providerId,
      pickupCity: req.body.pickupCity,
      dropoffCity: req.body.dropoffCity,
      shipDate: req.body.shipArrivaldate,
      eta: req.body.shipArrivaldate,
      departurePort: req.body.departurePort,
      destinationPort: req.body.destinationPort,
      pickupPortUnlocode: req.body.pickupPortUnlocode,
      dropoffPortUnlocode: req.body.dropoffPortUnlocode,
      departureTime: req.body.departureTime,
      destinationTime: req.body.destinationTime,
      mmsiNumber: req.body.mmsiNumber,
      ticketImage: ticketImage
    }).save();
    if (newShip) {
      console.log("You are now ship", newShip)
      //Sending success if new flight gets created
      newRequest = await new requestModel({
        ship: newShip._id,
        type: "Ship",
        provider: req.body.providerId,
        requestedBy: req.body.customerId,
        bookingId: req.body.bookingId,
        isMakePayment: false,
        paymentDue: tomorrow,
        status: "Accepted"
      }).save();
      const postrequest = await postflightRequestModel.deleteOne({ "_id": ObjectId(req.body.postrequestId) });
      res.status(200).send({
        success: true,
        message: "Ship Has Been Added"
      });
    } else {
      console.log("Request Failed")
      //Sending error if new flight doesn't get created
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
const airportinfobyID = async (req, res) => {
  try {
    console.log("req.body: ", req.params)
    var axios = require('axios');
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/airports/${req.params.airportId}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        res.status(200).send({
          success: true,
          Airport: response.data,
          message: "Airport Has Been Found"
        });
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).send({
          success: false,
          message: "Wrong Airport ID"
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
const addArrivaldates = async (req, res) => {
  try {
    /*
    console.log("req.body: ",req.params)
    var requests = await postflightRequestModel.find({})
    requests.map(async(request) => {
      
      if(!flight.flightarrivalDate){
        const deletedflight=await flightsModel.deleteOne({"_id": ObjectId(flight._id)});
      }
      const flightdata=await get_fa_flight_id_info(request.fa_flight_id)
      console.log("flightdata",flightdata)
      if(flightdata){
        console.log(flightdata.scheduled_in)
      const updatedRequest=await postflightRequestModel.updateOne(
        {_id:request._id},
        {
          $set:{
            flightarrivalDate:flightdata.scheduled_in,
          }
        }
      );
      }
      
    })*/
    var requests = await requestModel.find({})
    console.log("requests: ", requests)


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
const dataNormalize = async (req, res) => {
  try {
    console.log("yoo ")
    /*
    console.log("req.body: ",req.params)
    var requests = await requestModel.find({bookingId:ObjectId(req.body.bookingId)})
    var postrequests = await postflightRequestModel.find({bookingId:ObjectId(req.body.bookingId)})
    console.log(requests.length,postrequests.length)
      
      if(!flight.flightarrivalDate){
        const deletedflight=await flightsModel.deleteOne({"_id": ObjectId(flight._id)});
      }
      if(requests.length==0&&postrequests.length==0){
        console.log("no requests against booking")
      }else{
        console.log("requests against booking")
      }
    */
    // var payments = await paymentsModel.find({}).populate('requestId');
    // console.log("payments ",payments)
    // payments.map(async (payment) => {
    //   console.log(payment)
    //   const updatedPayment = await paymentsModel.updateOne(
    //     { _id: payment._id },
    //     {
    //       $set: {
    //         paidTo: payment.requestId?payment.requestId.provider:null
    //       }
    //     }
    //   );
    // })
/*
    var bookings = await bookingModel.find({}).populate('');
    console.log("bookings ", bookings)
    bookings.map(async (booking) => {
      //console.log(booking)
      console.log(typeof(booking.recieverPhoneno))
      // const updatedBooking = await bookingModel.updateOne(
      //   { _id: booking._id },
      //   {
      //     $set: {
      //       recieverPhoneno:{
      //         countrycode: 92,
      //         phoneno: 3359037389
      //       }
      //     }
      //   }
      // );
    })*/
    function convertUTCDateToLocalDate(date) {
      var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
  
      var offset = date.getTimezoneOffset() / 60;
      var hours = date.getHours();
  
      newDate.setHours(hours - offset);
  
      return newDate;   
  }
    var departureDate="2022-08-02T12:25:00"
    console.log("departureDate ", departureDate);
    console.log("departureDate 2",new Date(departureDate));
    departureDate=new Date(departureDate);
    console.log("departureDate ",departureDate)
    console.log(convertUTCDateToLocalDate(departureDate))
    /*var vehicles = await vehicleModel.find({}).populate('');
    console.log("vehicles ", vehicles)
    vehicles.map(async (vehicle) => {
      console.log(vehicle)
      //const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
      const updatedUser = await userModel.updateOne(
        { _id: vehicle.driverId },
        {
          $push:{"vehicles": vehicle._id }
        }
      );
      if(updatedUser.nModified>0){
        console.log("Updated ")
      }
    })*/
    /*
    var requests = await requestModel.find({}).populate('bookingId');
    //console.log("requests ", requests)
    requests.map(async (request) => {
      //console.log(request)
      if(request.bookingId===null){
        console.log("request",request)
        const deletedrequest = await requestModel.deleteOne({ _id: ObjectId(request._id) });
        console.log("deletedrequest ",deletedrequest)
      }
      
    })*/
    /*
    userLocation={
      lat:33.675787,
      lng:73.053271
    }
    console.log(await checkIfMax3("62554fe8d2206f00040f82cc"));*/
    /*
    var drivers = await userModel.find({ role: "Driver" }).populate('');
    console.log("drivers ", drivers)
    drivers.map(async (driver) => {
      console.log(driver)
      const location = await locationsModel.findOne({ driverId: driver._id });
      console.log("location ", location)
      if (location === null) {
        const newlocation = await new locationsModel({
          location: {
            lat: 33.659228,
            lng: 73.057290
          },
          driverId: driver._id 
        }).save();
        
      }

    })*/

    /*
    var onedaybefore = new Date();
    var today = new Date();
    //Creating one month before date
    onedaybefore.setDate(onedaybefore.getDate() - 1);
    console.log("onedaybefore: ",onedaybefore);
    //console.log(getDepartureDate(477938500,"HKHKG","2022-08-04T18:00:00"))
    var departureDate = await getDepartureDate(477938500, "HKHKG", "2022-08-04T18:00:00");
    console.log("departureDate ", departureDate);
    if (departureDate > onedaybefore) {
      console.log("push ships")
    } else {
      console.log("ignore ship")
    }*/
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
//Flight related controllers ended
const searchPort = async (req, res) => {
  try {
    console.log(req.params.port)
    const mySentence = req.params.port;
    //Coverting search query to lowercase letter 
    const result = mySentence.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    console.log(result)
    var count = 0
    console.log(result.length)
    //Searching posts based on user search query
    if (result.length < 5) {
      var filteredports3 = (ports.filter(item => {
        if (item.Name.toLowerCase().startsWith(result.toLowerCase()) && count < 10) {
          count = count + 1
          console.log(count)
          return item
        }
      }));
      console.log(filteredports3)
      //Sending ports to frontend based on user query
      res.send({
        ports: filteredports3
      })

    } else {
      var filteredports3 = (ports.filter(item => {
        if (item.Name.toLowerCase().includes(result.toLowerCase()) && count < 10) {
          count = count + 1
          console.log(count)
          return item
        }
      }));
      console.log(filteredports3)
      //Sending ports to frontend based on user query
      res.send({
        ports: filteredports3
      })
    }

    // var data = JSON.stringify({
    //   "search_string": result,
    //   "allowed_search_types": [
    //     "seaport",
    //     "rail_terminal",
    //     "road_terminal",
    //     "postal_exchange_office",
    //     "multi_modal",
    //     "fixed_transport",
    //     "inland_port",
    //     "border_crossing"
    //   ]
    // });

    // var config = {
    //   method: 'post',
    //   url: 'https://port-api.com/port/search',
    //   headers: { 
    //     'Content-Type': 'application/json'
    //   },
    //   data : data
    // };

    // axios(config)
    // .then(function (response) {
    //   console.log(response.data.features);
    //   res.send({
    //     ports:response.data.features
    //   })
    // })
    // .catch(function (error) {
    //   console.log(error);
    // });
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
const addShip = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    //Validating add ship data from frontend
    const result = await shipSchema.validateAsync(req.body)
    var ticketImage
    if (req.files) {
      //Assigning ticket image to ticket image
      ticketImage = req.files['ticketImage'] ? "/src/" + req.files['ticketImage'][0].filename : null
    } else {
      ticketImage = null
    }
    var config = {
      method: 'get',
      url: `https://services.marinetraffic.com/api/exportvessel/v:5/${process.env.MARINE_TRAFFIC_PS07}/timespan:20/mmsi:${req.body.mmsiNumber}/protocol:json`,
      headers: {}
    };
    axios(config)
      .then(async function (response) {
        console.log("exportvessel ", response.data)
        //console.log(JSON.stringify(response.data));
        var response2 = await checkifcorrectports(req.body.dropoffPortUnlocode, req.body.pickupPortUnlocode, req.body.mmsiNumber)
        console.log("does it exists: ", response2)
        if (response2.isexists) {

        } else {
          res.status(404).send({
            success: false,
            message: `Wrong Ports Selected Against This MMSI Number ${req.body.mmsiNumber}`
          });
        }
        const ifshipexists = await shipsModel.find({ mmsiNumber: req.body.mmsiNumber, provider: ObjectId(req.body.providerId) })
        console.log("ifshipexists: ", ifshipexists)
        if (ifshipexists.length > 0) {
          res.status(404).send({
            success: false,
            message: "You Have Already Added This Ship As Provider"
          });
        } else {
          //Creating new ship object
          const newShip = await new shipsModel({
            isProvider: true,
            provider: req.body.providerId,
            pickupCity: req.body.pickupCity,
            dropoffCity: req.body.dropoffCity,
            shipDate: req.body.shipDate,
            departurePort: req.body.departurePort,
            destinationPort: req.body.destinationPort,
            pickupPortUnlocode: req.body.pickupPortUnlocode,
            dropoffPortUnlocode: req.body.dropoffPortUnlocode,
            departureTime: req.body.departureTime,
            destinationTime: req.body.destinationTime,
            mmsiNumber: req.body.mmsiNumber,
            ticketImage: ticketImage,
            eta: response2.eta
          }).save();
          if (newShip) {
            console.log("Ship Has Been Added", newShip)
            //Sending success if ship gets created
            res.status(200).send({
              success: true,
              message: "Ship Has Been Added",
              shipDetails: newShip
            });
          } else {
            console.log("Request Failed")
            //Sending failure if ship doesn't get created
            res.status(404).send({
              success: false,
              message: "Request Failed"
            });
          }
        }

      })
      .catch(function (error) {
        console.log("error ")
        console.log(error.response);
        //var responsee=parser.parseString(error.response.data);
        //console.log(responsee)
        res.status(404).send({
          success: false,
          message: "Invalid MMSI Number or Wrong Ports"
        })

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
const deleteShip = async (req, res) => {
  try {
    console.log("delete flightId: ", req.params.shipId)
    //soft deleting user by ID 
    const ship = await shipsModel.deleteOne({ "_id": ObjectId(req.params.shipId) });
    if (ship) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'Ship Deleted'
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Ship By Given ID'
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
const getRequestsToProviderShip = async (req, res) => {
  try {
    console.log(req.params.shipId)
    //Finding requests against individual ship
    const requests = await requestModel.find({ ship: req.params.shipId }).populate('ship provider requestedBy bookingId')
    console.log("requests", requests)
    if (requests.length > 0) {
      //Sending requests against individual ship if found
      res.status(200).send({
        success: true,
        message: "Requests Against Ship Found",
        requests: requests
      });
    } else {
      //Sending failure if requests against individual ship don't get found
      res.status(404).send({
        success: false,
        message: "Requests Against Ship Not Found"
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
const getProviderShips = async (req, res) => {
  try {
    //Find all the ships added by single provider
    console.log(req.params.providerId)
    var ships = await shipsModel.find({ provider: req.params.providerId }).populate('provider')
    if (ships.length > 0) {
      //Sending success if requests get found
      res.status(200).send({
        success: true,
        message: "Ships Added By Provider Found",
        ships: ships.reverse()
      });
    } else {
      //Sending success if requests don't get found
      res.status(404).send({
        success: false,
        message: "Ships Not Found"
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
const getDeparturetime = async (req, res) => {
  try {
    //Find all the ships added by single provider
    console.log(req.params.mmsi)
    console.log(req.params.pickupPortUnlocode)
    console.log(req.params.eta)
    var fromdate = req.body.fromdate ? req.body.fromdate : '2022-05-29'
    var todate = req.params.eta ? req.params.eta.slice(0, 10) : '2022-06-07'
    console.log(todate)
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
    console.log(threemonth)

    var config = {
      method: 'get',
      url: `https://services.marinetraffic.com/api/portcalls/v:4/${process.env.MARINE_TRAFFIC_EV01}/portid:${req.params.pickupPortUnlocode}/mmsi:${req.params.mmsi}/fromdate:${threemonth}/todate:${todate}/movetype:1/protocol:xml`,
      headers: {}
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        parser.parseString(response.data, function (err, results) {
          // parsing to json
          // display the json data

          if (results.PORTCALLS) {
            console.log("results", results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC);
            res.status(200).send({
              success: true,
              TIMESTAMP_UTC: results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC ? results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC : null,
              mmsi: req.params.mmsi,
              pickupPortUnlocode: req.params.pickupPortUnlocode
            })
          } else {
            res.status(200).send({
              success: false,
              message: "Departure Not Found",
              mmsi: req.params.mmsi,
              pickupPortUnlocode: req.params.pickupPortUnlocode
            })
          }

        });

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
const manualPayouts = async (req, res) => {
  try {
    //Consoling data related to payout
    console.log(req.body.providerId)
    console.log(req.body.providerEmail)
    console.log(req.body.amount)
    //create token first

    const token = await stripe.tokens.create({
      card: {
        number: '4000056655665556',
        exp_month: 6,
        exp_year: 2023,
        cvc: '314',
        currency: "USD"
      },
    });
    console.log("token ", token)
    //Creating connected account against user email
    const account = await stripe.accounts.create({
      type: 'custom',
      country: 'US',
      email: req.body.providerEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      tos_acceptance: { date: 1609798905, ip: '8.8.8.8' },
      business_type: 'individual',
      business_profile: {
        product_description: 'Personal Trainer who sells his services to clients.',
        mcc: 7298,
        url: "www.codistan.pk"
      },
      individual: {
        first_name: "Haris",
        last_name: "Abbasi",
        ssn_last_4: ' 0000',
        email: "harisbakhabarpk@gmail.com",
        ssn_last_4: 1234,
        phone: '(201) 555-0123',
        dob: {
          day: 20,
          month: 5,
          year: 1998,
        },
        address: {
          line1: "Line 1",
          postal_code: "80024",
          state: "Colorado",
          country: 'US',
        },
      },
      default_currency: "USD",
      external_account: token.id
    });
    console.log("account ", account)
    //create external bank account
    console.log("Creating bank account")
    /*
    const bankAccount = await stripe.accounts.createExternalAccount(
      account.id,
      {
        external_account: token.id,
      }
    );
    console.log("bankAccount ",bankAccount)*/

    //Making connected account agree to terms and conditions
    /*
    const account2 = await stripe.accounts.update(
      'acct_1LAAeHRAYXXsb5Ql'
    );
    console.log("account2 ",account2)*/

    //initiating transfer
    const transfer = await stripe.transfers.create({
      amount: 10,
      currency: 'USD',
      destination: 'acct_1LAAeHRAYXXsb5Ql',
      transfer_group: 'ORDER_95',
    });
    console.log("transfer: ", transfer)
    /*
    //Making payout against connected account
    const payout = await stripe.payouts.create({
      amount: req.body.amount,
      currency: 'USD',
    }, {
      stripeAccount: 'acct_1L8glnD129KHeziF',
    });
    console.log("payout ",payout)*/

  }
  catch (err) {
    console.log("err: ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }
}
const manualPayouts2 = async (req, res) => {
  try {
    //Consoling data related to payout
    console.log(req.body.providerId)
    console.log(req.body.providerEmail)
    console.log(req.body.amount)
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 6,
        exp_year: 2023,
        cvc: '314',
      },
    });
    console.log(paymentMethod)
    console.log(paymentMethod.id)
    const customer = await stripe.customers
      .create({
        name: req.body.name,
        email: req.body.providerEmail,
        address: {
          line1: '510 Townsend St',
          postal_code: '98140',
          city: 'San Francisco',
          state: 'CA',
          country: 'US',
        },
      })
    const paymentIntent = await stripe.paymentIntents.create({
      payment_method: paymentMethod.id,
      amount: req.body.amount * 100,
      currency: 'USD',
      customer: customer.id,
      payment_method_types: ['card'],
      metadata: { uid: '123456' },
      confirm: true,
      description: "Payment to provider"
    });
    console.log(paymentIntent)

    const paymentConfirm = await stripe.paymentIntents.confirm(
      paymentIntent.id
    );
    console.log(paymentConfirm)
  }
  catch (err) {
    console.log("err: ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }
}
const providerOrderhistory = async (req, res) => {
  try {
    //Find all the requests against single provider
    console.log(req.params.customerId)
    var requests = await requestModel.find({ provider: req.params.providerId }).populate('flight ship provider requestedBy bookingId')
    if (requests.length > 0) {
      //Sending success if requests get found
      res.status(200).send({
        success: true,
        message: "Order History Of Customers Found",
        requests: requests.reverse()
      });
    } else {
      //Sending success if requests don't get found
      res.status(404).send({
        success: false,
        message: "Order History Of Customers Not Found"
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
const resendOtp = async (req, res) => {
  try {
    //Find all the requests against single provider
    console.log(req.body.requestId)
    var request = await requestModel.findOne({ _id: req.body.requestId }).populate('bookingId')
    //Creating Reset OTP for SMS
    var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    const number = request.bookingId.recieverPhoneno.countrycode+''+request.bookingId.recieverPhoneno.phoneno
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
      otp: otp,
      message: "OTP Resent"
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
module.exports = {
  addFlight,
  deleteFlight,
  getFlightsForProvider,
  getRequestsToProviderFlight,
  getRequestsToAllProviderFlights,
  changerequestStatus,
  allPostRequests,
  changepostRequestStatus,
  searchAirport,
  searchFlight,
  verifyingBookingCompletion,
  verifyingBookingOtp,
  setRequeststate,
  searchPort,
  addShip,
  deleteShip,
  getRequestsToProviderShip,
  getproviderFlights,
  addFlightAfterPost,
  airportinfobyID,
  addArrivaldates,
  dataNormalize,
  getProviderShips,
  addShipAfterPost,
  getDeparturetime,
  manualPayouts,
  manualPayouts2,
  providerOrderhistory,
  resendOtp
};