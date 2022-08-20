var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var {verifyToken} = require('../middlewares/adminMiddleware');
//Admin APIs Started
//Admin Registration Apis Started
//Route for admin login
router.post('/login', adminController.adminLogin)
//Route for creating booking
router.post('/createAdmin', adminController.createAdmin)
//Route for getting forget password otp on email
router.post('/forgetpassword2', adminController.forgetPassword2)
//Route for verifying forget password otp
router.post('/verifyotp', adminController.verifyOTP)
//Route for setting new password
router.post('/resetpassword', adminController.resetPassword)
//Admin Registration Apis Ended
//Manage Admin Apis Started
//Route for deleting admin
router.delete('/deleteadmin',verifyToken, adminController.deleteAdmin)
//Route for editing admin
router.post('/editadmin',verifyToken, adminController.editAdmin)
//Route for getting accesstoken through refresh token
router.get('/getaccesstoken',verifyToken, adminController.getAccessToken)
//Manage Admin Apis Ended
//Manage Driver/provider Apis Started
//Route for adding provider 
router.post('/addprovider',verifyToken, adminController.addProvider)
//Route for editing provider 
router.patch('/editprovider/:id',verifyToken, adminController.editProvider)
//Route for deleting provider
router.delete('/deleteprovider/:id',verifyToken, adminController.deleteProvider)
//Route for adding provider 
router.post('/adddriver',verifyToken, adminController.addDriver)
//Route for editing provider 
router.patch('/editdriver/:id',verifyToken, adminController.editDriver)
//Route for deleting provider
router.delete('/deletedriver/:id',verifyToken, adminController.deleteDriver)
//Manage Driver/provider Apis Ended
//Manage Vehicle Types Apis Started
//Route for managing fare for vehicle types
router.patch('/managefare',verifyToken, adminController.manageFare)
//Route for creating new vehicle type
router.post('/createvehicletype',verifyToken, adminController.createVehicletype)
//Route for search all vehicles 
router.get('/searchvehicle/:query',verifyToken, adminController.searchVehicle)
//Manage Vehicle Types Apis Ended
//Driver Approval Apis Started
//Route for approving driver
router.patch('/approvedriver/:id',verifyToken, adminController.approveDriver)
//Driver Approval Apis Ended
//Live Location Tracking Apis Started
//Route for getting all bookings on map
router.get('/getallbookingsonmap',verifyToken, adminController.getAllBookingsOnMap)
//Route for getting all bookings on map
router.get('/getalldriversonmap',verifyToken, adminController.getAllDriversOnMap)
//Live Location Tracking Apis Ended
//Manage Users Apis Started
//Route for deleting user
router.delete('/deleteuser/:id',verifyToken, adminController.deleteUser)
//Route for updating user
router.patch('/updateuser/:id',verifyToken, adminController.updateUser)
//Route for deactivating user
router.post('/deactivateuser/:id',verifyToken, adminController.deactivateUser)
//Route for searching user
router.get('/searchuser/:query',verifyToken, adminController.searchUser)
//Manage Users Apis Ended
//Transaction History Apis Started
//Route for viewing transaction history
router.get('/transactionhistory',verifyToken, adminController.transactionHistory)
//Manage payments apis need to be added after reviewing
//Transaction History Apis Ended
//Manage Bookings Apis Started
//Route for viewing all bookings with their statuses
router.get('/viewallbookings',verifyToken, adminController.viewAllBookings)
//Route for View Booking Details
router.get('/booking/:id',verifyToken, adminController.viewBookingDetails)
//Route for assigning driver/provider
router.post('/assigndriver',verifyToken, adminController.assignDriver)
//Manage Bookings Apis Ended
//Promo Codes Managment Apis Started
//Route for creating promocode
router.post('/createpromocode',verifyToken, adminController.createPromocode)
//Route for all promocodes
router.get('/allpromocodes',verifyToken, adminController.allPromocodes)
//Route for sending promocodes to specific users
router.post('/sendpromocodes',verifyToken, adminController.sendPromocodes)
//Route for getting promocodes to specific users
router.get('/getpromocodes/:userId',verifyToken, adminController.getPromocodes)
//Route for deleteting promocode
router.delete('/deletepromocode/:id',verifyToken, adminController.deletePromocode)
//Promo Codes Managment Apis Ended
//Manage Trip Charges Apis Started
//Route for adding trip charges
router.post('/addtripcharges',verifyToken, adminController.addtripCharges)
//Route for updating trip charges
router.post('/updatetripcharges',verifyToken, adminController.updatetripCharges)
//Manage Trip Charges Apis Ended
//Manage Ratings Apis Started
//Route for getting view claims
router.get('/viewratings',verifyToken, adminController.viewRatings)
//Route for getting ratings of certaun driver/provider
//router.get('/viewrating/:id',verifyToken, adminController.viewRating)
//Route for getting ratings of certaun driver/provider
router.get('/viewrating/:id',verifyToken, adminController.viewRating2)
//Manage Ratings Apis Ended
//Claim Settelment Apis Started
//Route for getting view claims
router.get('/viewclaims',verifyToken, adminController.viewClaims)
//Route for resolving any claim
router.patch('/resolveclaim/:id',verifyToken, adminController.resolveClaim)
//Claim Settelment Apis Ended
//Logout Apis Started
//Logout Function will be implemented on client-side by deleting token
//Logout Apis Ended
//Push Notification Apis Started
//Route For Pushing Notification From Adminside
router.post('/pushnotification',verifyToken, adminController.pushNotification)
//Push Notification Apis Ended
module.exports = router; 