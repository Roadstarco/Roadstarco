var adminModel = require('../models/adminModel')
var passwordModel = require('../models/passwordModel')
const bcrypt = require("bcrypt")
var ObjectId = require('mongodb').ObjectID;
const nodemailer = require("nodemailer");
const crypto = require('crypto');
var jwt = require('jsonwebtoken');
const requestModel = require('../models/requestModel');
const saltRounds = 10;
const { updateSchema } = require('../helpers/userValidationSchema');
const { adminSchema, addProviderSchema, promocodeSchema, resolveclaimSchema, addtripChargesSchema,forgetpasswordSchema2,resetotpSchema,changepasswordSchema } = require('../helpers/adminValidationSchema');
var userModel = require('../models/userModel');
const vehicleModel = require('../models/vehicleModel');
var locationsModel = require('../models/driverLocations');
var vehicletypeModel = require('../models/vehicletypeModel');
const paymentsModel = require('../models/paymentsModel');
const bookingModel = require('../models/bookingModel');
const promocodeModel = require('../models/promocodeModel');
const cancellationModel = require('../models/cancellationModel');
var claimModel = require('../models/claimModel')
const { createNotification } = require('../helpers/pushNotification');
const ratingsModel = require('../models/ratingsModel');
const otpGenerator = require('otp-generator')
const adminLogin = async (req, res) => {
  email = req.body.email.toLowerCase();
  var admin = await adminModel.findOne({ email: email })
  var id = admin._id
  if (admin) {
    if (await bcrypt.compare(req.body.password, admin.password)) {
      const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '2h'
      });
      const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });
      console.log(accessToken)
      console.log(refreshToken)
      admin.password = null;
      res.status(200).send({
        success: true,
        message: 'Correct Details',
        admin: admin,
        accessToken: accessToken,
        refreshToken: refreshToken
      });

    } else {
      res.status(200).send({
        success: false,
        message: 'Error: Email and Pass Dont Match'
      });

    }
  } else {
    console.log("Invalid Admin");
    res.status(200).send({
      success: false,
      message: 'Admin not exists'
    });

  }
}
const createAdmin = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    const result = await adminSchema.validateAsync(req.body)
    //checking if user exists
    const email = req.body.email.toLowerCase();
    const ifadmin = await adminModel.findOne({ email: email })
    if (ifadmin) {
      console.log(ifadmin)
      res.status(409).send({
        success: false,
        message: "Admin Already Exists with this email/phone"
      });
    } else {
      //encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      //saving user to DB

      newAdmin = await new adminModel({
        email: email,
        password: encryptedPassword
      }).save();
      if (newAdmin) {
        console.log("You are now admin", newAdmin)
        res.status(200).send({
          success: true,
          message: "You are now admin",
          data: newAdmin
        });
      } else {
        console.log("Request Failed")
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
const forgetPassword2 = async (req, res) => {
  try {
    console.log("U are ", req.body);
    const result = await forgetpasswordSchema2.validateAsync(req.body)
    console.log("result", result)
    adminModel.findOne({ email: req.body.email })
      .then(admin => {
        console.log('admin', admin)
        //Checking If admin Exists
        if (!admin) {
          res.status(404).json({
            success: false,
            message: 'Admin not found with this Email!'
          })
        }
        //Creating Reset OTP for SMS
        var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const number = req.body.countrycode + '' + req.body.phoneno
        console.log("numberrr: ", number)
        //Sending Reset OTP to email
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
          }
        })
        let mailOptions = {
          from: 'JobWeb@gmail.com',
          to: req.body.email,
          subject: 'Reset Password',
          html: `Reset Password OTP: ${otp} `
        }
        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            return console.log('error occurs', err)
          }

        })
        admin.resetPasswordOtp = otp;
        return admin.save()
      })
      .then(result => {

        res.status(200).send({
          success: true,
          message: "Reset Password Email sent"
        })
      })
      .catch(err => {
        console.log(err)
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
const verifyOTP = async (req, res) => {
  try {
    console.log("U are ", req.body);
    //Finding user with the reset OTP
    const result = await resetotpSchema.validateAsync(req.body)
    adminModel.findOne({ resetPasswordOtp: req.body.resetPasswordOtp })
      .then(admin => {
        //If Admin don't exist with the given resetOTP, give error
        if (!admin) {
          return res.status(404).json({
            success: false,
            message: 'Invalid OTP'
          })
        } else {
          //If Admin exists with the given resetOTP then send success
          return res.status(200).json({
            success: true,
            admin: admin,
            message: 'OTP Verified. User Can Change The Password'
          })
        }
      })
  }
  catch (err) {
    console.log(err)
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
const resetPassword = async (req, res) => {
  try {
    console.log('req.body', req.body)
    const result = await changepasswordSchema.validateAsync(req.body)
    const password = req.body.password;
    const confirmPassword = req.body.confirmpassword;
    //Checking If new password and confirm password equals
    if (password !== confirmPassword) {
      return res.status(404).json('Password and Confirm Password Not Equal')
    }
    const admin = adminModel.findOne({ "_id": ObjectId(req.body.userid) })
    if (!admin) {
      return res.status(404).json('User not found!')
    }
    try {
      //Encrypting new password
      let encryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
      console.log("encryptedPassword: ", encryptedPassword)
      //Updating password
      const updatePassword = await adminModel.updateOne(
        { _id: req.body.adminid },
        {
          $set: {
            resetPasswordOtp: null,
            password: encryptedPassword
          }
        }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Password Updated'
      })
    }
    catch (err) {
      res.status(500).json({
        success: false,
        message: 'internal server error'
      })
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
const deleteAdmin = async (req, res) => {
  try {
    console.log("get userID: ", req.body.id)
    //soft deleting user by ID 
    const admin = await adminModel.softDelete({ "_id": ObjectId(req.body.id) });
    if (admin) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'Admin Deleted',
        admin: admin
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Admin By Given ID'
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
const editAdmin = async (req, res) => {

}
const getAccessToken = async (req, res) => {
  try {
    console.log("req.adminId ", req.adminId)
    var id = req.adminId
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '2h'
    });
    res.status(200).send({
      success: true,
      message: 'Access Token Created',
      accessToken: accessToken
    });


  } catch (err) {
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
const addProvider = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    const result = await addProviderSchema.validateAsync(req.body)
    //checking if user exists
    const email = req.body.email.toLowerCase();
    const ifuser = await userModel.findOne({ $or: [{ email: email }, { phoneno: req.body.phoneno }] })
    if (ifuser) {
      console.log(ifuser)
      res.status(409).send({
        success: false,
        message: "User Already Exists with this email/phone"
      });
    } else {
      //encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      //saving user to DB
      console.log("req.files: ", req.files)
      var newUser;
      newUser = await new userModel({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: email,
        address: req.body.address,
        countrycode: req.body.countrycode,
        phoneno: req.body.phoneno,
        role: "Provider",
        profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : null : null
      }).save();

      if (newUser) {
        console.log("You are now user", newUser)
        const newPassword = await new passwordModel({
          user: newUser._id,
          password: encryptedPassword
        }).save();
        res.status(200).send({
          success: true,
          message: "You are now user",
          data: newUser
        });
      } else {
        console.log("Request Failed")
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
const editProvider = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    console.log("req.body is", req.body);
    //Validating recieved user fields
    const result = await updateSchema.validateAsync(req.body)
    //Finding user who is being updated
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
    console.log(user)
    if (!user) {
      res.status(404).send({
        success: false,
        message: "User Don't Exists!"
      })
    }
    //Checking if we got any image
    if (req.files) {
      console.log("we getting image")
      console.log(req.files.length)
    } else {
      console.log("we not getting image")
    }
    //Updating user fields with new values
    const updatedUser = await userModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          firstname: req.body.firstname ? req.body.firstname : user.firstname,
          lastname: req.body.lastname ? req.body.lastname : user.lastname,
          email: req.body.email ? req.body.email : user.email,
          address: req.body.address ? req.body.address : user.address,
          countrycode: req.body.countrycode ? req.body.countrycode : user.countrycode,
          phoneno: req.body.phoneno ? req.body.phoneno : user.phoneno,
          profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : user.profilepic : user.profilepic
        }
      }
    );
    //Checking if we recieved password
    if (req.body.password) {
      //Encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      console.log(encryptedPassword)
      console.log("adding new password")
      //Updating new user password
      const updatedPassword = await passwordModel.updateOne(
        { user: req.params.id },
        {
          $set: {
            password: encryptedPassword
          }
        }
      );
    }

    if (updatedUser) {
      //Sending success if user updated 
      return res.status(200).json({
        success: true,
        message: "User Updated!",
        updatedUser
      })
    } else {
      //Sending failure if user not updated 
      return res.status(400).json({
        success: false,
        message: "the user cannot be updated!"
      })
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
const deleteProvider = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //soft deleting user by ID 
    const user = await userModel.softDelete({ "_id": ObjectId(req.params.id) });
    const password = await passwordModel.softDelete({ "user": ObjectId(req.params.id) });
    if (user) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'User Deleted',
        user: user
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No User By Given ID'
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
const addDriver = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    const result = await addProviderSchema.validateAsync(req.body)
    //checking if user exists
    const email = req.body.email.toLowerCase();
    const ifuser = await userModel.findOne({ $or: [{ email: email }, { phoneno: req.body.phoneno }] })
    if (ifuser) {
      console.log(ifuser)
      res.status(409).send({
        success: false,
        message: "User Already Exists with this email/phone"
      });
    } else {
      //encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      //saving user to DB
      console.log("req.files: ", req.files)
      var newUser;
      newUser = await new userModel({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: email,
        address: req.body.address,
        countrycode: req.body.countrycode,
        phoneno: req.body.phoneno,
        role: "Driver",
        profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : null : null
      }).save();

      if (newUser) {
        console.log("You are now user", newUser)
        const newPassword = await new passwordModel({
          user: newUser._id,
          password: encryptedPassword
        }).save();
        res.status(200).send({
          success: true,
          message: "You are now user",
          data: newUser
        });
      } else {
        console.log("Request Failed")
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
const editDriver = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    console.log("req.body is", req.body);
    //Validating recieved user fields
    const result = await updateSchema.validateAsync(req.body)
    //Finding user who is being updated
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
    console.log(user)
    if (!user) {
      res.status(404).send({
        success: false,
        message: "User Don't Exists!"
      })
    }
    //Checking if we got any image
    if (req.files) {
      console.log("we getting image")
      console.log(req.files.length)
    } else {
      console.log("we not getting image")
    }
    //Updating user fields with new values
    const updatedUser = await userModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          firstname: req.body.firstname ? req.body.firstname : user.firstname,
          lastname: req.body.lastname ? req.body.lastname : user.lastname,
          email: req.body.email ? req.body.email : user.email,
          address: req.body.address ? req.body.address : user.address,
          countrycode: req.body.countrycode ? req.body.countrycode : user.countrycode,
          phoneno: req.body.phoneno ? req.body.phoneno : user.phoneno,
          profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : user.profilepic : user.profilepic
        }
      }
    );
    //Checking if we recieved password
    if (req.body.password) {
      //Encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      console.log(encryptedPassword)
      console.log("adding new password")
      //Updating new user password
      const updatedPassword = await passwordModel.updateOne(
        { user: req.params.id },
        {
          $set: {
            password: encryptedPassword
          }
        }
      );
    }

    if (updatedUser) {
      //Sending success if user updated 
      return res.status(200).json({
        success: true,
        message: "User Updated!",
        updatedUser
      })
    } else {
      //Sending failure if user not updated 
      return res.status(400).json({
        success: false,
        message: "the user cannot be updated!"
      })
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
const deleteDriver = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //soft deleting user by ID 
    const user = await userModel.softDelete({ "_id": ObjectId(req.params.id) });
    const password = await passwordModel.softDelete({ "user": ObjectId(req.params.id) });
    if (user) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'User Deleted',
        user: user
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No User By Given ID'
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
const manageFare = async (req, res) => {
  try {
    //Finding if vehicle type exists
    const vehicletype = await vehicletypeModel.findOne({ "type": req.body.type });
    if (vehicletype) {
      //Changing fare if vehicle type exists
      const updatedVehicletype = await vehicletypeModel.updateOne(
        { type: req.body.type },
        {
          $set: {
            fare: req.body.fare ? req.body.fare : vehicletype.fare,
            distance: req.body.distance ? req.body.distance : vehicletype.distance
          }
        }
      );
      if (updatedVehicletype.nModified > 0) {
        return res.status(200).send({
          success: true,
          message: 'Fare Updated',
          updatedVehicletype: updatedVehicletype
        });

      } else {
        return res.status(404).send({
          success: false,
          message: 'Fare Couldnt Be Updated'
        });
      }

    } else {
      //Sending failure if vehicle type don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Vehicle Type By Given ID'
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
const createVehicletype = async (req, res) => {
  try {
    //checking if any vehicle type already exists
    const vehicletype = await vehicletypeModel.findOne({ "type": req.body.type });
    if (vehicletype) {
      //Sending error as vehicle type already exists
      return res.status(400).send({
        success: false,
        message: 'Vehicle type already exists'
      });


    } else {
      //Creating new vehicle type based on new values
      const newVehicletype = await new vehicletypeModel({
        type: req.body.type,
        fare: req.body.fare,
        distance: req.body.distance,
      }).save();
      //Checking if new vehicle type gets created
      if (newVehicletype) {
        return res.status(200).send({
          success: true,
          message: 'New Vehicle Type Created',
          newVehicletype: newVehicletype
        });
      } else {
        return res.status(400).send({
          success: true,
          message: 'Something Went Wrong'
        });
      }
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
const searchVehicle = async (req, res) => {
  try {
    console.log("query: ", req.params.query)
    const filter = { "vehicleName": { "$regex": req.params.query, "$options": "i" } };
    //Finding all vehicles based on search query 
    var searchedVehicles = await vehicleModel.find(filter).populate('driverId')
    console.log(searchedVehicles.reverse())
    if (searchedVehicles.length > 0) {
      //Sending success if all vehicles get found
      res.status(200).send({
        success: true,
        message: "Vehicles Found Against Your Query",
        postRequests: searchedVehicles.reverse()
      });
    } else {
      //Sending failure if all vehicles don't get found
      res.status(404).send({
        success: false,
        message: "No Vehicles Found Against Your Query"
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
const approveDriver = async (req, res) => {
  try {
    console.log("driverId: ", req.params.id)
    //searching if driver exists by this id
    const driver = await userModel.findOne({ "_id": ObjectId(req.params.id), "role": "Driver" }).populate('vehicles');
    console.log("driver ", driver)
    if (driver) {
      //Approving Driver
      const updatedDriver = await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            isApproved: true,
          }
        }
      );
      if (driver.vehicles) {
        var operation = await driver.vehicles.forEach(async vehicle => {
          const updatedVehicle = await vehicleModel.updateOne(
            { _id: vehicle._id },
            {
              $set: {
                isApproved: true,
              }
            }
          );

        })
      }
      //Sending success if all post requests get found
      if (updatedDriver) {
        var message = "You Have Been Approved As Driver"
        const response = await createNotification(message, driver._id, "driverApproved", "a811c3dd-be0f-4f3b-87c1-676bf931a64d")
        res.status(200).send({
          success: true,
          message: "Driver Approved",
          updatedDriver: updatedDriver
        });
      } else {
        res.status(200).send({
          success: false,
          message: "Failed To Approve"
        });
      }

    } else {
      //Sending failure if all post requests don't get found
      res.status(404).send({
        success: false,
        message: "No Driver Found By This Id"
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
const getAllBookingsOnMap = async (req, res) => {
  try {
    console.log("getting all users")
    //getting all bookings for live map tracking
    const allBookings = await requestModel.find({}).populate('bookingId').select('bookingId')
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
    if (allBookings) {
      res.status(200).send({
        success: true,
        message: "All Bookings for map",
        allBookings: allBookings
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No Bookings Found"
      });
    }

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const getAllDriversOnMap = async (req, res) => {
  try {
    console.log("getting all users")
    //getting all bookings for live map tracking
    const allLocations = await locationsModel.find({}).populate('driverId')
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
    console.log("allLocations ", allLocations)
    console.log("total locations: ", allLocations.length)
    if (allLocations.length > 0) {
      res.status(200).send({
        success: true,
        message: "All Bookings for map",
        allLocations: allLocations
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No Bookings Found"
      });
    }

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const deleteUser = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //soft deleting user by ID 
    const user = await userModel.softDelete({ "_id": ObjectId(req.params.id) });
    const password = await passwordModel.softDelete({ "user": ObjectId(req.params.id) });
    if (user) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'User Deleted',
        user: user
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No User By Given ID'
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
const updateUser = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    console.log("req.body is", req.body);
    //Validating recieved user fields
    const result = await updateSchema.validateAsync(req.body)
    //Finding user who is being updated
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
    console.log(user)
    if (!user) {
      res.status(404).send({
        success: false,
        message: "User Don't Exists!"
      })
    }
    //Checking if we got any image
    if (req.files) {
      console.log("we getting image")
      console.log(req.files.length)
    } else {
      console.log("we not getting image")
    }
    //Updating user fields with new values
    const updatedUser = await userModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          firstname: req.body.firstname ? req.body.firstname : user.firstname,
          lastname: req.body.lastname ? req.body.lastname : user.lastname,
          email: req.body.email ? req.body.email : user.email,
          address: req.body.address ? req.body.address : user.address,
          countrycode: req.body.countrycode ? req.body.countrycode : user.countrycode,
          phoneno: req.body.phoneno ? req.body.phoneno : user.phoneno,
          profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : user.profilepic : user.profilepic
        }
      }
    );
    //Checking if we recieved password
    if (req.body.password) {
      //Encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      console.log(encryptedPassword)
      console.log("adding new password")
      //Updating new user password
      const updatedPassword = await passwordModel.updateOne(
        { user: req.params.id },
        {
          $set: {
            password: encryptedPassword
          }
        }
      );
    }

    if (updatedUser) {
      //Sending success if user updated 
      return res.status(200).json({
        success: true,
        message: "User Updated!",
        updatedUser
      })
    } else {
      //Sending failure if user not updated 
      return res.status(400).json({
        success: false,
        message: "the user cannot be updated!"
      })
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
const deactivateUser = async (req, res) => {
  try {
    console.log("query: ", req.params.id, "isDeactivated ", req.body.isDeactivated)
    //Checking if user exists
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
    if (user) {
      //Banning or unbanning user
      const updatedUser = await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            isDeactivated: req.body.isDeactivated,
          }
        }
      );
      if (updatedUser.nModified > 0) {
        //Sending success if user gets activated and deactivated
        return res.status(200).json({
          success: true,
          message: req.body.isDeactivated ? "User Deactivated" : "User Activated",
          updatedUser
        })
      } else {
        //Sending failure if user doesn't get activated and deactivated
        return res.status(400).json({
          success: false,
          message: "the user couldnt be updated!"
        })
      }
    } else {
      //Sending failure if user doesn't exists
      res.status(404).send({
        success: false,
        message: "User Don't Exists!"
      })
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
const searchUser = async (req, res) => {
  try {
    console.log("query: ", req.params.query)
    const filter = { $or: [{ "firstname": { "$regex": req.params.query, "$options": "i" } }, { "lastname": { "$regex": req.params.query, "$options": "i" } }] };
    //Finding all users based on search query 
    var searchedUsers = await userModel.find(filter).populate('')
    console.log(searchedUsers.reverse())
    if (searchedUsers.length > 0) {
      //Sending success if all users get found
      res.status(200).send({
        success: true,
        message: "Users Found Against Your Query",
        searchedUsers: searchedUsers.reverse()
      });
    } else {
      //Sending failure if all users don't get found
      res.status(404).send({
        success: false,
        message: "No Users Found Against Your Query"
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
const transactionHistory = async (req, res) => {
  try {
    const filter = {};
    //Finding all users based on search query 
    var alltransactions = await paymentsModel.find(filter).populate('')
    console.log(alltransactions.reverse())
    if (alltransactions.length > 0) {
      //Sending success if all users get found
      res.status(200).send({
        success: true,
        message: "Alltransactions Found ",
        alltransactions: alltransactions.reverse()
      });
    } else {
      //Sending failure if all users don't get found
      res.status(404).send({
        success: false,
        message: "No transactions Found Against Your Query"
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
const viewAllBookings = async (req, res) => {
  try {
    console.log("getting all bookings")
    //getting all bookings with their statuses
    const allBookings = await requestModel.find({}).populate('bookingId').select('bookingId status')
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
    if (allBookings) {
      res.status(200).send({
        success: true,
        message: "All Bookings With Their Statuses",
        allBookings: allBookings
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No Bookings Found"
      });
    }

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const viewBookingDetails = async (req, res) => {
  try {
    console.log("getting single booking", req.params.id)
    //getting Individual Booking
    const booking = await bookingModel.findOne({ "_id": ObjectId(req.params.id) }).populate('bookedBy');

    if (booking) {
      res.status(200).send({
        success: true,
        message: "Individual Booking Found",
        booking: booking
      });
    } else {
      res.status(404).send({
        success: false,
        message: "No Individual Booking Found"
      });
    }

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const assignDriver = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    //Checking if request and driver exists
    const request = await requestModel.findOne({ "_id": ObjectId(req.body.requestId), type: "Land" }).populate('bookedBy');
    const driver = await userModel.findOne({ "_id": ObjectId(req.body.driverId), role: "Driver" });
    if (request && driver) {
      //Assigning driver to customer request after checking request and driver
      const updatedRequest = await requestModel.updateOne(
        { _id: req.body.requestId },
        {
          $set: {
            status: "Accepted",
            provider: req.body.driverId,
            isMakePayment: false
          }
        }
      );
      if (updatedRequest.nModified > 0) {
        //Sending success if assigning driver gets successful
        res.status(200).send({
          success: true,
          message: "Driver Assigned",
          updatedRequest: updatedRequest
        });
      } else {
        //Sending failure if assigning driver doesn't get successful
        res.status(400).send({
          success: false,
          message: "Driver Couldn't Be Assigned"
        });
      }

    } else {
      //Sending failure if request and driver doesn't get found
      res.status(404).send({
        success: false,
        message: "No Request or Driver Found Against Your Ids"
      });
    }

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const createPromocode = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    const result = await promocodeSchema.validateAsync(req.body)
    //Creating new promocode
    const newpromocode = await new promocodeModel({
      promoName: req.body.promoName,
      discountPercent: req.body.discountPercent,
      availableTill: req.body.availableTill
    }).save()
    if (newpromocode) {
      //Sending success if new promocode gets created
      res.status(200).send({
        success: true,
        message: "Promocode Created",
        newpromocode: newpromocode
      });
    } else {
      //Sending failure if new promocode doesn't get created
      res.status(400).send({
        success: false,
        message: "Promocode couldn't be created"
      });
    }
  }
  catch (err) {
    console.log(err)
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
const allPromocodes = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    //Finding All Promocodes
    const allpromocodes = await promocodeModel.find({});
    if (allpromocodes.length > 0) {
      //Sending Success If all promocodes gets found
      res.status(200).send({
        success: true,
        message: "All Promocodes Found",
        allpromocodes: allpromocodes
      });
    } else {
      //Sending Failure If all promocodes doesn't get found
      res.status(404).send({
        success: false,
        message: "No Promocodes Found"
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const sendPromocodes = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    //Sending promocodes to user
    const updatedUser = await userModel.updateOne(
      { _id: req.body.userId },
      { $push: { promocodes: req.body.promocodeId } }
    );
    if (updatedUser.nModified > 0) {
      var message = "New Promocode"
      const response = await createNotification(message, req.body.promocodeId, "promocodeAdded", "a811c3dd-be0f-4f3b-87c1-676bf931a64d")
      //Sending success if promocode gets send to user
      res.status(200).send({
        success: true,
        message: "Promocodes send to specific users",
        updatedUser: updatedUser
      });
    } else {
      //Sending failure if promocode doesn't get send to user
      res.status(400).send({
        success: false,
        message: "Promocodes couldnt be send to specific users"
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const getPromocodes = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    //Getting promocodes of a user
    const promocodesofUser = await userModel.findOne({ "_id": ObjectId(req.params.userId) }).populate('promocodes').select('promocodes');
    console.log("Promocodesofuser", promocodesofUser)
    if (promocodesofUser.promocodes.length > 0) {
      //Sending Success If promocodes of user gets found
      res.status(200).send({
        success: true,
        message: "All Promocodes Of User Found",
        promocodesofUser: promocodesofUser.promocodes
      });
    } else {
      //Sending Failure If promocodes of user doesn't get found
      res.status(404).send({
        success: false,
        message: "No Promocodes Found"
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const deletePromocode = async (req, res) => {
  try {
    console.log("Delete promocodeId: ", req.params.id)
    //soft deleting user by ID 
    const deletedpromoCode = await promocodeModel.deleteOne({ "_id": ObjectId(req.params.id) });
    if (deletedpromoCode.deletedCount > 0) {
      //Sending success if user deleted successfully
      return res.status(200).send({
        success: true,
        message: 'Promocode Deleted',
        deletedpromoCode: deletedpromoCode
      });
    } else {
      //Sending failure if user don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Promocode By Given ID'
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
const addtripCharges = async (req, res) => {
  try {
    console.log("req.body: ", req.body)
    const result = await addtripChargesSchema.validateAsync(req.body.charges)
    const isCancelllation = await cancellationModel.findOne({ provider: req.body.provider, requestId: req.body.requestId });
    console.log("isCancelllation", isCancelllation)
    if (isCancelllation) {
      console.log("Updating charge")
      //If already cancellation then update charge
      const updatedTripcharges = await cancellationModel.updateOne(
        { provider: req.body.provider, requestId: req.body.requestId },
        {
          $set: {
            charges: req.body.charges
          }
        }
      );
      if (updatedTripcharges.nModified > 0) {
        var message = "You Have Been Charged For Cancelled Delivery"
        const response = await createNotification(message, isCancelllation._id, "promocodeAdded", "a811c3dd-be0f-4f3b-87c1-676bf931a64d")
        //Sending success after charging
        return res.status(200).send({
          success: true,
          message: 'Driver/Provider Charged'
        });
      } else {
        //Sending Failure after charging
        return res.status(400).send({
          success: false,
          message: 'Something went wrong'
        });
      }
    } else {
      console.log("Creating charge")
      //Creating cancellation charges against request and driver/provider
      const newCancellation = await new cancellationModel({
        provider: req.body.provider,
        requestId: req.body.requestId,
        charges: req.body.charges,
        isPaid: false
      }).save();
      if (newCancellation) {
        var message = "You Have Been Charged For Cancelled Delivery"
        const response = await createNotification(message, newCancellation._id, "promocodeAdded", "a811c3dd-be0f-4f3b-87c1-676bf931a64d")
        //Sending success if driver/provider gets created
        return res.status(200).send({
          success: true,
          message: 'Driver/Provider Charged',
          newCancellation: newCancellation
        });
      } else {
        //Sending failure if driver/provider gets created
        return res.status(400).send({
          success: false,
          message: 'Driver/Provider Charge Couldnt Be Created'
        });
      }
    }

  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const updatetripCharges = async (req, res) => {
  try {
    console.log("req.body: ", req.body)

    //Updating cancellation charges against request and driver/provider
    const updatedTripcharges = await cancellationModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          charges: req.body.charges
        }
      }
    );
    if (updatedTripcharges.nModified > 0) {
      //Sending success if driver/provider gets updated
      return res.status(200).send({
        success: true,
        message: 'Driver/Provider Charged',
        updatedTripcharges: updatedTripcharges
      });
    } else {
      //Sending failure if driver/provider gets updated
      return res.status(400).send({
        success: false,
        message: 'Driver/Provider Charge Couldnt Be Created'
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const viewClaims = async (req, res) => {
  try {
    //Find all the claims 
    var claims = await claimModel.find({}).populate('claimBy')
    if (claims.length > 0) {
      //Sending success if claims get found
      res.status(200).send({
        success: true,
        message: "Claims By User Found",
        claims: claims.reverse()
      });
    } else {
      //Sending success if claims don't get found
      res.status(404).send({
        success: false,
        message: "Claims Not Found"
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const resolveClaim = async (req, res) => {
  try {
    var allowedStatuses = ["Pending", "Resolved"]
    if (!allowedStatuses.includes(req.body.newStatus)) {
      return res.status(401).send({
        success: false,
        message: "This claim status not allowed"
      });
    }
    //["Pending","Resolved"]
    const result = await resolveclaimSchema.validateAsync(req.body)
    const claim = await claimModel.findOne({ "_id": ObjectId(req.params.id) });
    //Updating claim based on id and new status 
    if (!claim) {
      //if claim doesn't exist, send failure
      return res.status(404).send({
        success: false,
        message: 'No Claim Exists By This Id'
      });
    }
    //Updating claim after resolving claim
    const updatedClaim = await claimModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          claimStatus: req.body.newStatus,
          claimResolvedMessage: req.body.message
        }
      }
    );
    if (updatedClaim.nModified > 0) {
      //Sending success as claim got updated
      res.status(200).send({
        success: true,
        message: 'Claim Resolved',
        updatedClaim: updatedClaim
      });
    } else {
      //Sending failure as claim got updated
      res.status(400).send({
        success: false,
        message: 'Claim Couldnt Be Updated',
        updatedClaim: updatedClaim
      });
    }
  }
  catch (err) {
    console.log(err)
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
const resolveClaim2 = async (req, res) => {
  try {
    console.log("req.body ", req.body)
    var ifclaim = await claimModel.findOne({ "_id": ObjectId(req.params.id) })
    console.log("ifclaim ", ifclaim)
    //Checking if claim exists
    if (ifclaim) {
      //Updating claim after resolving claim
      const updatedClaim = await claimModel.updateOne(
        { _id: req.params.id },
        {
          $set: {
            claimStatus: req.body.newStatus,
            claimResolvedMessage: req.body.message
          }
        }
      );
      console.log("updatedClaim ", updatedClaim)
      if (updatedClaim.nModified > 0) {
        //Sending Success if claim gets resolved
        res.status(200).json({
          success: true,
          message: "Claim Resolved"
        })
      } else {
        //Sending Failure if claim doesn't get resolved
        res.status(400).json({
          success: true,
          message: "Claim Couldn't Be Resolved"
        })
      }
    } else {
      res.status(400).json({
        success: false,
        message: "No Claim Exists By This ID"
      })
    }
  } catch (err) {
    console.log(err)
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
const pushNotification = async (req, res) => {
  try {

  }
  catch (err) {
    console.log(err)
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
const viewRatings = async (req, res) => {
  try {
    //Find all the ratings 
    var ratings = await ratingsModel.find({}).populate('requestId ratedBy ratedTo')
    console.log(ratings)
    if (ratings.length > 0) {
      //Sending success if ratings get found
      res.status(200).send({
        success: true,
        message: "Ratings By User Found",
        ratings: ratings.reverse()
      });
    } else {
      //Sending success if ratings don't get found
      res.status(404).send({
        success: false,
        message: "Ratings Not Found"
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const viewRating = async (req, res) => {
  try {
    console.log("get ratings of user: ", req.params.id)
    //getting ratings of a user
    const ratings = await ratingsModel.find({ "ratedTo": ObjectId(req.params.id) }).populate('requestId ratedBy ratedTo')
    console.log("Ratings ", ratings)
    //Checking if we got any ratings
    if (ratings.length > 0) {
      //Sending success as we got ratings
      return res.status(200).send({
        success: true,
        message: 'Ratings Against User Found',
        ratings: ratings
      });
    } else {
      //Sending Error to client if not recieved
      return res.status(404).send({
        success: false,
        message: 'Ratings Not Found'
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
const viewRating2 = async (req, res) => {
  try {
    console.log("Req.params: ", req.params)
    //Find all the ratings 
    var ratings = await ratingsModel.find({ ratedBy: req.params.id }).populate('requestId ratedBy ratedTo')
    if (ratings.length > 0) {
      //Sending success if ratings get found
      res.status(200).send({
        success: true,
        message: "Ratings By User Found",
        ratings: ratings.reverse()
      });
    } else {
      //Sending failure if ratings get found
      res.status(404).send({
        success: true,
        message: "Ratings By User Not Found"
      });
    }
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }


}
module.exports = {
  adminLogin,
  createAdmin,
  deleteAdmin,
  editAdmin,
  addProvider,
  deleteProvider,
  editProvider,
  addDriver,
  editDriver,
  deleteDriver,
  searchVehicle,
  approveDriver,
  getAllBookingsOnMap,
  getAllDriversOnMap,
  manageFare,
  createVehicletype,
  deleteUser,
  updateUser,
  searchUser,
  deactivateUser,
  transactionHistory,
  viewAllBookings,
  viewBookingDetails,
  assignDriver,
  createPromocode,
  allPromocodes,
  sendPromocodes,
  getPromocodes,
  deletePromocode,
  addtripCharges,
  updatetripCharges,
  viewClaims,
  resolveClaim,
  resolveClaim2,
  pushNotification,
  viewRatings,
  viewRating,
  viewRating2,
  getAccessToken,
  forgetPassword2,
  verifyOTP,
  resetPassword
};