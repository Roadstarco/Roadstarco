var express = require('express');
const passport =require('passport')
var router = express.Router();
var userController = require('../controllers/userController');
var passportMiddleware = require('../middlewares/passportMiddleware');
var {upload,isLoggedIn} = require('../middlewares/userMiddleware');
//User APIs Started
//Route for sending registration OTP
router.post('/sendotp', userController.sendOtp)
//Route for verifying registration OTP
router.post('/confirmotp', userController.confirmOtp)
//Route for dynamic link
router.get('/dynamiclink', userController.dynamicLink)
//Route for registering after verification
router.post('/',upload, userController.createUser)
//Route for getting all users
router.get('/',isLoggedIn, userController.getUsers)
//Route for login user
router.post('/login',passportMiddleware.passportAuthenticate);
//Route for logout user
router.get('/logout/:userid', userController.logout)
//Route for getting forget password otp on phonenumber
router.post('/forgetpassword', userController.forgetPassword)
//Route for getting forget password otp on email
router.post('/forgetpassword2', userController.forgetPassword2)
//Route for verifying forget password otp
router.post('/verifyotp', userController.verifyOTP)
//Route for setting new password
router.post('/resetpassword', userController.resetPassword)
//Route for getting user by ID
router.get('/getuser/:id',isLoggedIn, userController.getUser)
//Route for deleting user by ID
router.delete('/deleteuser/:id',isLoggedIn, userController.deleteUser)
//Route for deleting user permanently by ID
router.delete('/deleteuserpermanent/:id',isLoggedIn, userController.deleteUserpermanent)
//Route for updating user by ID
router.patch('/updateuser/:id',upload,isLoggedIn, userController.updateUser)
//Route for getting user profile picture by ID
router.get('/getuserpicture/:id',isLoggedIn, userController.getUserpicture)
//Route for adding new player
router.post('/createnewplayer/:id',isLoggedIn, userController.createNewPlayer)
//Route for creating notifications
router.post('/createnotification',isLoggedIn, userController.createNotification)
//User APIs Ended
module.exports = router;