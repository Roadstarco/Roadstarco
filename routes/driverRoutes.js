var express = require('express');
const multer = require('multer');
var router = express.Router();
var driverController = require('../controllers/driverController');
var {upload,isLoggedIn} = require('../middlewares/driverMiddleware');
//Driver APIs Started
//Route for creating driver
router.post('/',upload, driverController.createDriver)
//Route for getting driver by ID 
router.get('/getdriver/:id',isLoggedIn, driverController.getDriver)
//Route for adding vehicle
router.post('/addingvehicle',isLoggedIn, driverController.addVehicle)
//Route for getting all vehicles
router.get('/getallvehicles/:driverid',isLoggedIn, driverController.getAllVehicles)
//Route for deleting vehicle of company
router.delete('/deletevehicle/:vehicleid/:driverid',isLoggedIn, driverController.deleteVehicle)
//Route for calculating land delivary fare
router.post('/calculatelanddelivary',isLoggedIn, driverController.calculateLandDelivary)
//Request Driver Related APIs Started
//Route for creating driver request
router.post('/getdriverrequests',isLoggedIn, driverController.getDriverRequests)
//Route for accepting request by driver
router.post('/changedriverrequestStatus',isLoggedIn, driverController.changedriverrequestStatus)
//Route for canceling request
router.post('/cancelrequest', isLoggedIn, driverController.cancelRequest)
//Route for getting order history of provider
router.get('/driverorderhistory/:driverId',isLoggedIn, driverController.driverOrderhistory)
//Request Driver Related APIs Ended
//Driver Earnings APIS Started
//Route for getting daily,Weekly,Monthly and Total Earnings
router.get('/usersearnings/:userId',isLoggedIn, driverController.usersEarnings)
//Driver Earnings APIs Ended
//Driver APIs Ended
module.exports = router; 