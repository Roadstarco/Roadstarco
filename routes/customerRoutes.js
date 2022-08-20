var express = require('express');
const multer = require('multer');
const passport =require('passport')
var router = express.Router();
var customerController = require('../controllers/customerController');
var {isLoggedIn} = require('../middlewares/userMiddleware');

//Customer APIs Started
//Route for search city for IATA code
router.get('/searchcity/:city',isLoggedIn, customerController.searchCity)
//Route for getting flights based on pickup, dropoff and dates
router.post('/getflights',isLoggedIn, customerController.getFlights)
//Route for getting next flights based on pickup, dropoff and dates
router.post('/getnextflights',isLoggedIn, customerController.getNextFlights)
//Route for requesting to provider flight
router.post('/requestprovider',isLoggedIn, customerController.requestProvider)
//Route for getting all requests by user
router.get('/getuserrequests/:userid',isLoggedIn, customerController.getUserrequests)
//Route for deleting request
router.get('/deleteuserrequests/:requestid',isLoggedIn, customerController.deleteUserrequests)
//Route for post requesting provider to book any flight 
router.post('/postflightrequest',isLoggedIn, customerController.postFlightRequest)
//Route for getting information for a flight
router.get('/staticinfobyfaflightid/:fa_flight_id',isLoggedIn, customerController.staticInfoByfaFlightid)
//Route for getting lastest position of a flight
router.get('/flightlatestposition/:fa_flight_id',isLoggedIn, customerController.flightLatestPosition)
//Ship Related APIs Started
//Route for get ships for customer
router.post('/getships',isLoggedIn, customerController.getShips)
//Route for getting lastest position of a ship
router.get('/shiplatestposition/:mmsinumber/:isindevelopment',isLoggedIn, customerController.shipLatestPosition)
//Ship Related APIs Ended
//Request Driver Related APIs Started
//Route for making request to driver
router.post('/createdriverrequest',isLoggedIn, customerController.createDriverrequest)
//Route for cancelling request to driver
router.post('/canceldriverrequest', isLoggedIn, customerController.cancelDriverrequest)
//Route for calculating distance
router.post('/calculatedistance',isLoggedIn, customerController.calculateDistance)
//Route for coverting xml
router.get('/convertxml',isLoggedIn, customerController.convertXml)
//Route for payment configuration using charges
router.post('/securepayment',isLoggedIn, customerController.securePayment)
//Route for payment configuration using payment intent
router.post('/securepayment2',isLoggedIn, customerController.securePayment2)
//Route for creating payments history
router.post('/createpaymentshistory',isLoggedIn, customerController.createPaymentshistory)
//Route for calculating flight delivary fare
router.post('/calculateflightfare',isLoggedIn, customerController.calculateFlightfare)
//Route for calculating ship delivary fare
router.post('/calculateshipfare',isLoggedIn, customerController.calculateShipfare)
//Route for getting order history of customer
router.get('/customerorderhistory/:customerId',isLoggedIn, customerController.customerOrderhistory)
//Route for post requests of customer
router.get('/postrequestorderhistory/:customerId',isLoggedIn, customerController.postRequestOrderhistory)
//Route for checking if due date passed
router.patch('/updatepaymentmissed',isLoggedIn, customerController.updatepaymentMissed)
//Route for rating delivery
router.post('/rateride',isLoggedIn, customerController.rateRide)
//Request Driver Related APIs Ended
//Customer APIs Ended
module.exports = router;