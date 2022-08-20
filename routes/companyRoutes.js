var express = require('express');
const multer = require('multer');
const passport =require('passport')
var router = express.Router();
var companyController = require('../controllers/companyController');
var {upload,upload2,isLoggedIn} = require('../middlewares/companyMiddleware');
//Company APIs Started
//Route for creating comoany
router.post('/',upload, companyController.createCompany)
//Route for updating company by ID
router.patch('/updatecompany/:id',upload,isLoggedIn, companyController.updateCompany)
//Route for uploading single picture
router.post('/singlepicture',upload2,isLoggedIn, companyController.singlePicture)
//Route for getting company details
router.get('/getcompanyinfo/:id',isLoggedIn, companyController.getCompanyInfo)
//Route for getting all drivers of company
router.get('/getdrivers/:companyid',isLoggedIn, companyController.getDrivers)
//Route for deleting driver
router.delete('/deletedriver/:driverId/:companyId',isLoggedIn, companyController.deleteDriver)
//Route for inviting driver to register
router.post('/invitedriver',isLoggedIn, companyController.inviteDriver)
//Route for getting all vehicles of company
router.get('/getvehicles/:companyid',isLoggedIn, companyController.getVehicles)
//Route for adding vehicle of company
router.post('/addvehicle',isLoggedIn, companyController.addVehicle)
//Route for editing vehicle of company
router.patch('/editvehicle/:vehicleid',isLoggedIn, companyController.editVehicle)
//Route for deleting vehicle of company
router.delete('/deletevehicle/:vehicleid/:companyId',isLoggedIn, companyController.deleteVehicle)
//Route for assigning vehicle to driver
router.patch('/assigndriver/:vehicleid/:driverId',isLoggedIn, companyController.assignDriver)
//Route for assigning driver to vehicle
router.patch('/assignvehicle/:driverId/:vehicleid',isLoggedIn, companyController.assignVehicle)
//Route for getting booking history of company
router.get('/getbookinghistory/:companyid',isLoggedIn, companyController.getBookingHistory)
//Route for searching driver
router.get('/searchdriver/:query',isLoggedIn, companyController.searchDriver)
module.exports = router;