
var userModel = require('../models/userModel')
var passwordModel = require('../models/passwordModel')
const LocalStrategy = require('passport-local').Strategy
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const otpGenerator = require('otp-generator')
const passport = require('passport')
const bcrypt = require("bcrypt")
//Passport Local Strategy Started
module.exports = function () {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
    async function (req, email, password, done) {
      console.log("req.body: ", req.body)
      console.log("email: ", email, "password: ", password)
      email = email.toLowerCase();
      var user
      if(req.body.role==="Customer"){
        user = await userModel.findOne({ email: email,role:null })
      }else{
        user = await userModel.findOne({ email: email,role:{$exists:true} })
      }
      if (user) {
        const passworddoc = await passwordModel.findOne({ user: user._id })
        console.log(user, passworddoc)
        if (await bcrypt.compare(password, passworddoc.password)) {
          return done(null, {
            success: true,
            message: 'Correct Details',
            user: user
          });
        } else {
          return done(null, {
            success: false,
            message: 'Error: Email and Pass Dont Match'
          });
        }
      } else {
        console.log("Invalid User");
        return done(null, {
          success: false,
          message: 'User not exists'
        });
      }
      //Finding user with the added phone no
      /*userModel.findOne({ phoneno: phoneno }, async function (err, user) {
        console.log("user found: ",user)
        if(!user){
          //Sending fail response as user don't exists
          return done(null, {
            success:false,
            message:"user dont exists"
          });
        }
       //Creating OTP for SMS
       var otp=otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
       console.log("otp : ",otp)
       //Twilio SMS Started
       console.log("countrycode: ",user.countrycode+"Phone",user.phoneno)
       const number=user.countrycode+''+user.phoneno
       console.log("numberrr: ",number)
       //Sending OTP to user number
       client.messages.create({
         body: `Add This OTP ${otp} to login`,
         to: `+${number}`,
         from: '+19206206746'
       }).then(message => console.log(message))
       .catch(error => console.log(error))
       //Twilio SMS Ended
   
       //After sending OTP to number, saving that OTP in user doc
       userModel.findOne({ phoneno: phoneno })
         .then(userr => {
           console.log('user', userr)
           userr.otp = otp;
           return userr.save()
         })
         return done(null, {
           success:true,
           message:"OTP Sent To The Number"
         }); 
       
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        
        
      });*/
    }
  ));
  passport.serializeUser(function (user, done) {
    console.log("user ", user)
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    userModel.findById(id, function (err, user) {
      done(err, user);
    });
  });
}
  //Passport Local Strategy Ended