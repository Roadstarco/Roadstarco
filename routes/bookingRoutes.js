var express = require('express');
const multer = require('multer');
const passport =require('passport')
var router = express.Router();
var bookingController = require('../controllers/bookingController');
var {upload,isLoggedIn} = require('../middlewares/bookingMiddleware');
//Booking APIs Started
//Route for creating booking
router.post('/',upload,isLoggedIn, bookingController.createBooking)
//Route for getting booking by ID
router.get('/getbooking/:id',isLoggedIn, bookingController.getBooking)
//Route for deleting booking by ID
router.delete('/deletebooking/:id',isLoggedIn, bookingController.deleteBooking)
//Route for updating booking by ID
router.patch('/updatebooking/:id',upload,isLoggedIn, bookingController.updateBooking)
//Route for getting booking by ID
router.get('/getallbookings',isLoggedIn, bookingController.getAllBookings)
//Route for getting booking by ID
router.get('/getallbookingsofuser/:userid',isLoggedIn, bookingController.getAllBookingsOfUser)
//Booking APIs Ended
module.exports = router; 