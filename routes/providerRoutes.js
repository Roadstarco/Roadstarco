var express = require('express');
const multer = require('multer');
const passport =require('passport')
var router = express.Router();
var providerController = require('../controllers/providerController');
var {upload,upload2,isLoggedIn} = require('../middlewares/providerMiddleware');

//Provider APIs Started
//Flight Related APIs Started
//Route for adding flight
router.post('/addflight',upload,isLoggedIn, providerController.addFlight)
//Route for deleteing flight
router.delete('/deleteflight/:flightid',isLoggedIn, providerController.deleteFlight)
//Route for getting provider flights
router.get('/getproviderflights/:providerId',isLoggedIn, providerController.getproviderFlights)
//Route for getting flights based on pickup, dropoff and dates
router.post('/getflightsforprovider',isLoggedIn, providerController.getFlightsForProvider)
//Route for getting Requests To Provider Flight
router.get('/getrequeststoprovider/:flightId',isLoggedIn, providerController.getRequestsToProviderFlight)
//Route for getting Requests To All Provider Flights
router.get('/getRequestsToAllProviders/:providerId',isLoggedIn, providerController.getRequestsToAllProviderFlights)
//Route for accepting/rejecting onboarded flight package request
router.post('/changerequeststatus',isLoggedIn, providerController.changerequestStatus)
//Route for getting all no provider flight Post Requests To Provider
router.get('/allpostrequests',isLoggedIn, providerController.allPostRequests)
//Route for accepting/rejecting no provider flight Requests To Provider
router.post('/changepostrequeststatus',isLoggedIn, providerController.changepostRequestStatus)
//Route for search city for IATA code
router.get('/searchairport/:airport',isLoggedIn, providerController.searchAirport)
//Route for search flight for add flight form
router.post('/searchflight/',isLoggedIn, providerController.searchFlight)
//Route for search flight for add flight form
router.post('/setrequeststate/',isLoggedIn, providerController.setRequeststate)
//Route for verifying booking completion
router.post('/verifyingbookingcompletion/',upload2,isLoggedIn, providerController.verifyingBookingCompletion)
//Route for verifying booking otp
router.post('/verifyingbookingotp/',isLoggedIn, providerController.verifyingBookingOtp)
//Route for adding flight after accepting post request
router.post('/addflightafterpost',upload,isLoggedIn, providerController.addFlightAfterPost)
//Route for adding ship after accepting post request
router.post('/addshipafterpost',upload,isLoggedIn, providerController.addShipAfterPost)
//Route for getting static information about airport
router.get('/airportinfobyID/:airportId',isLoggedIn, providerController.airportinfobyID)
//Route for adding arrivalDate to all flights
router.get('/addarrivaldates',isLoggedIn, providerController.addArrivaldates)
//Route for normalizing data
router.post('/datanormalize',isLoggedIn, providerController.dataNormalize)
//Flight Related APIs Ended
//Ship Related APIs Started
//Route for search port for add ship form
router.get('/searchport/:port',isLoggedIn, providerController.searchPort)
//Route for adding ships
router.post('/addship',upload,isLoggedIn, providerController.addShip)
//Route for deleteing flight
router.delete('/deleteship/:shipId',isLoggedIn, providerController.deleteShip)
//Route for getting Requests To Provider Ship
router.get('/getrequeststoprovidership/:shipId',isLoggedIn, providerController.getRequestsToProviderShip)
//Route for get ships of provider
router.get('/getproviderships/:providerId',isLoggedIn, providerController.getProviderShips)
//Route for getting departure time of ship
router.get('/getdeparturetime/:mmsi/:pickupPortUnlocode/:eta', isLoggedIn, providerController.getDeparturetime)
//Ship Related APIs Ended
//Stripe Related APIs Started
//Route for initiating automated payouts
router.post('/manualpayouts',isLoggedIn, providerController.manualPayouts)
//Route for initiating manual payouts
router.post('/manualpayouts2',isLoggedIn, providerController.manualPayouts2)
//Route for getting order history of provider
router.get('/providerorderhistory/:providerId',isLoggedIn, providerController.providerOrderhistory)
//Stripe Related APIs Ended
//Route for resending otp to reciever
router.patch('/resendotp/',isLoggedIn, providerController.resendOtp)
//Provider APIs Ended
module.exports = router;