var express = require('express');
const multer = require('multer');
var router = express.Router();
var complainController = require('../controllers/complainController');
var claimController = require('../controllers/claimController');
var {upload,isLoggedIn} = require('../middlewares/complainclaimMiddleware');
//Complain APIs Started
//Route for creating complain   
router.post('/',upload, complainController.createComplain)
//Route for get all user complains  
router.get('/getcomplainsbyuser/:userid',isLoggedIn, complainController.getComplainsByUser)
//Route for deleting certain complain
router.delete('/deletecomplain/:complainid',isLoggedIn, complainController.deleteComplain)
//Route for get all complains by everyone
router.get('/getallcomplains',isLoggedIn, complainController.getAllComplains)
//Complain APIs Ended
//Claim APIs Started
//Route for creating claim
router.post('/createclaim',isLoggedIn, claimController.createClaim)
//Route for get all user claims  
router.get('/getclaimsbyuser/:userid',isLoggedIn, claimController.getClaimsByUser)
//Route for deleting certain claim
router.delete('/deleteclaim/:claimid',isLoggedIn, claimController.deleteClaim)
//Claim APIs Ended
module.exports = router;