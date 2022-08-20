
var userModel = require('../models/userModel')
var passwordModel = require('../models/passwordModel')
var otpModel = require('../models/otpModel')
const invitationModel = require('../models/invitationModel');
const bcrypt = require("bcrypt")
var ObjectId = require('mongodb').ObjectID;
const nodemailer = require("nodemailer");
const crypto = require('crypto')
const saltRounds = 10;
const otpGenerator = require('otp-generator')
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const OneSignal2 = require('onesignal-node');
// With default options
const client2 = new OneSignal2.Client(ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);
const client = require('twilio')(accountSid, authToken);
const { authSchema, changepasswordSchema, forgetpasswordSchema, forgetpasswordSchema2, otpSchema, resetotpSchema, sendotpSchema, updateSchema } = require('../helpers/userValidationSchema')
const { notificationSchema } = require('../helpers/notificationValidationSchema')

const sendOtp = async (req, res) => {
  try {
    const result = await sendotpSchema.validateAsync(req.body)
    console.log("length", req.body.phoneno.toString().length)
    var length = req.body.phoneno.toString().length
    if (length >= 6 && length <= 12) {

    } else {
      res.status(422).json({
        success: false,
        message: "Number digits should be 6-12"
      })
    }
    //Creating OTP for SMS
    var otp = otpGenerator.generate(6, { digits: true, upperCaseAlphabets: false, specialChars: false });
    console.log("otp : ", otp)
    //Twilio SMS Started
    console.log("countrycode: ", req.body.countrycode + "Phone", req.body.countrycode)
    const number = req.body.countrycode + '' + req.body.phoneno
    console.log("numberrr: ", number)
    //Sending OTP to upcoming user number for register verification
    client.messages.create({
      body: `Add This OTP ${otp} to register`,
      to: `+${number}`,
      from: '(989) 403-0559'
    }).then(async message => {
      console.log(message)
      otpModel.findOne({ phoneno: req.body.phoneno })
        .then(async userr => {
          if (userr) {
            console.log('user', userr)
            const updatedOtp = await otpModel.updateOne(
              { phoneno: req.body.phoneno },
              {
                $set: {
                  otp: otp,
                }
              }
            );
            if (updatedOtp) {
              res.status(200).json({
                success: true,
                message: "Registration Otp send"
              })
            }

          } else {
            //Saving OTP in otps collection for later verification
            const newOtp = await new otpModel({
              countrycode: req.body.countrycode,
              phoneno: req.body.phoneno,
              otp: otp,
            }).save();
            if (newOtp) {
              res.status(200).json({
                success: true,
                message: "Registration Otp send"
              })
            }

          }

        })



    })
      .catch(error => {
        console.log(error)
        res.status(404).json({
          success: false,
          message: "Number Not Valid"
        })
      })
    //Twilio SMS Ended
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
    console.log(err)
  }


}
const confirmOtp = async (req, res) => {
  try {
    const result = await otpSchema.validateAsync(req.body)
    console.log(req.body.otp)
    //Finding number with given otp
    otpModel.findOne({ otp: req.body.otp })
      .then(async otpProfile => {
        console.log('user', otpProfile)
        const updatedOtp = await otpModel.updateOne(
          { otp: req.body.otp },
          {
            $set: {
              otp: null
            }
          }
        );
        //Find if any otp exists
        if (otpProfile) {
          res.status(200).send({
            success: true,
            otpProfile: otpProfile,
            message: "OTP Successful, User Can Register"
          })
        } else {
          //send fail response if otp doesn't exists
          res.status(404).send({
            success: false,
            message: "Invalid Otp"
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
const dynamicLink = async (req, res) => {
  try {
    console.log("dynamic link serve")

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
const createUser = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    const result = await authSchema.validateAsync(req.body)
    //checking if user exists
    const email = req.body.email.toLowerCase();
    var ifuser;
    if (req.body.role) {
      ifuser = await userModel.findOne({ $or: [{ email: email }, { phoneno: req.body.phoneno }], role: req.body.role })
    } else {
      ifuser = await userModel.findOne({ $or: [{ email: email }, { phoneno: req.body.phoneno }], role: null })
    }
    const ifinvited = await invitationModel.findOne({ $or: [{ email: email }, { phoneno: req.body.phoneno }] })

    if (ifuser) {
      console.log(ifuser)
      //he already exists
      if (!ifuser.role) {
        //he is customer
        console.log("role not exists so customer")
        if (req.body.role) {
          //he is registering for either driver/provider/company
          const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
          newUser = await new userModel({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: email,
            address: req.body.address,
            countrycode: req.body.countrycode,
            phoneno: req.body.phoneno,
            role: req.body.role,
            companyId: ifinvited ? ifinvited.companyId : null,
            profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : null : null
          }).save();
          if (newUser) {
            if (ifinvited) {
              const deletedInvitation = await invitationModel.deleteOne({ "_id": ObjectId(ifinvited._id) });
              console.log("deletedInvitation ", deletedInvitation)
            }
            const newPassword = await new passwordModel({
              user: newUser._id,
              password: encryptedPassword
            }).save();
            return res.status(200).send({
              success: true,
              message: "You are now user",
              data: newUser
            });
          }
        } else {
          console.log("role not exists so going to be customer")
          return res.status(409).send({
            success: false,
            message: "Customer Already Exists with this email/phone"
          });
        }
      } else {
        console.log("role exists so driver")
        if (req.body.role) {
          console.log("role exists so going to be driver")
          return res.status(400).send({
            success: true,
            message: ifuser.role + " Already Exists With This Email and Password"
          });

        } else {
          console.log("role not exists so going to be customer")
          const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
          newUser = await new userModel({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: email,
            address: req.body.address,
            countrycode: req.body.countrycode,
            phoneno: req.body.phoneno,
            companyId: ifinvited ? ifinvited.companyId : null,
            profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : null : null
          }).save();
          if (newUser) {
            if (ifinvited) {
              const deletedInvitation = await invitationModel.deleteOne({ "_id": ObjectId(ifinvited._id) });
              console.log("deletedInvitation ", deletedInvitation)
            }
            const newPassword = await new passwordModel({
              user: newUser._id,
              password: encryptedPassword
            }).save();
            return res.status(200).send({
              success: true,
              message: "You are now user",
              data: newUser
            });
          }

        }
      }
      return res.status(409).send({
        success: false,
        message: "User Already Exists with this email/phone"
      });
    } else {
      //encrypting user password
      const encryptedPassword = await bcrypt.hash(req.body.password, saltRounds)
      //saving user to DB
      console.log("req.files: ", req.files)
      var newUser;
      if (req.body.role) {
        newUser = await new userModel({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: email,
          address: req.body.address,
          countrycode: req.body.countrycode,
          phoneno: req.body.phoneno,
          role: req.body.role,
          companyId: ifinvited ? ifinvited.companyId : null,
          profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : null : null
        }).save();
      } else {
        newUser = await new userModel({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: email,
          address: req.body.address,
          countrycode: req.body.countrycode,
          phoneno: req.body.phoneno,
          profilepic: req.files ? req.files.length > 0 ? "/src/" + req.files[0].filename : null : null
        }).save();
      }
      if (newUser) {
        console.log("You are now user", newUser)
        if (ifinvited) {
          const deletedInvitation = await invitationModel.deleteOne({ "_id": ObjectId(ifinvited._id) });
          console.log("deletedInvitation ", deletedInvitation)
        }
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
const getUsers = async (req, res) => {
  try {
    console.log("getting all users")
    const availableElements = await userModel.find({})
      .catch((err) => {
        res.status(400).json({ message: err.message });
      });
    res.status(200).send(availableElements);
  }
  catch (err) {
    console.log(err)
  }


}
/** 
const login=async(req,res)=>{ 
  console.log("Body ", req.body);
  const user=await userModel.findOne({ email: req.body.email })
  if(user){
    if(await bcrypt.compare(req.body.password, user.password)){
      
      return res.status(200).send({
        success: true,
        message: 'Correct Details',
        user: user
      });


    }else{
      return res.status(404).send({
        success: false,
        message: 'Error: Email and Pass Dont Match'
      });
    }

    
  }else{
    console.log("Invalid User");
        return res.status(404).send({
          success: false,
          message: 'User not exists'
        });

  }
}
*/

const logout = async (req, res) => {
  try {
    console.log("logging out", req.params.userid)
    req.logout();

    return res.status(200).json({
      success: true,
      message: 'User Logged Out'
    })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }

}
const forgetPassword = async (req, res) => {
  try {
    console.log("U are ", req.body);
    const result = await forgetpasswordSchema.validateAsync(req.body)
    console.log("result", result)
    userModel.findOne({ phoneno: req.body.phoneno })
      .then(user => {
        console.log('user', user)
        //Checking If User Exists
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found with this number!'
          })
        }
        //Creating Reset OTP for SMS
        var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const number = req.body.countrycode + '' + req.body.phoneno
        console.log("numberrr: ", number)
        //Sending Reset OTP to user number
        client.messages.create({
          body: `Add This OTP ${otp} to reset password`,
          to: `+${number}`,
          from: '(989) 403-0559'
        })
          .then(message => console.log(message))
          .catch(error => console.log(error))
        user.resetPasswordOtp = otp;
        return user.save()
      })
      .then(result => {
        res.status(200).send({
          success: true,
          message: "Reset Password OTP sent"
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
const forgetPassword2 = async (req, res) => {
  try {
    console.log("U are ", req.body);
    const result = await forgetpasswordSchema2.validateAsync(req.body)
    console.log("result", result)
    userModel.findOne({ email: req.body.email })
      .then(user => {
        console.log('user', user)
        //Checking If User Exists
        if (!user) {
          res.status(404).json({
            success: false,
            message: 'User not found with this Email!'
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
        user.resetPasswordOtp = otp;
        return user.save()
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
    userModel.findOne({ resetPasswordOtp: req.body.resetPasswordOtp })
      .then(user => {
        //If User don't exist with the given resetOTP, give error
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Invalid OTP'
          })
        } else {
          //If User exists with the given resetOTP then send success
          return res.status(200).json({
            success: true,
            user: user,
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
    const user = userModel.findOne({ "_id": ObjectId(req.body.userid) })
    if (!user) {
      return res.status(404).json('User not found!')
    }
    try {
      //Encrypting new password
      let encryptedPassword = await bcrypt.hash(req.body.password, saltRounds);
      console.log("encryptedPassword: ", encryptedPassword)
      //Updating password
      const updatePassword = await userModel.updateOne(
        { _id: req.body.userid },
        {
          $set: {
            resetPasswordOtp: null
          }
        }
      );
      const updatePassword1 = await passwordModel.updateOne(
        { user: req.body.userid },
        {
          $set: {
            password: encryptedPassword
          }
        }
      );
      console.log("updatePassword: ", updatePassword)
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
const getUser = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //getting user by ID
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
    //sending user to client if recieved
    if (user) {
      return res.status(200).send({
        success: true,
        message: 'Correct Details',
        user: user
      });
    } else {
      //sending Error to client if not recieved
      return res.status(404).send({
        success: false,
        message: 'User Not Found'
      });
    }
  }
  catch (err) {
    console.log("err ", err)
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
const deleteUserpermanent = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //soft deleting user by ID 
    const user = await userModel.deleteOne({ "_id": ObjectId(req.params.id) });
    const password = await passwordModel.deleteOne({ "user": ObjectId(req.params.id) });
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
    //const result = await updateSchema.validateAsync(req.body)
    //Finding user who is being updated
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) });
    console.log(user)
    var email=req.body.email?req.body.email.toLowerCase():user.email
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
          email: req.body.email ? email : user.email,
          address: req.body.address ? req.body.address : user.address,
          countrycode: req.body.countrycode ? req.body.countrycode : user.countrycode,
          phoneno: req.body.phoneno ? req.body.phoneno : user.phoneno,
          profilepic: req.body.profilepic?"/src/"+req.body.profilepic: user.profilepic 
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
const getUserpicture = async (req, res) => {
  try {
    console.log("get userID: ", req.params.id)
    //Getting profile picture of user
    const user = await userModel.findOne({ "_id": ObjectId(req.params.id) }).select('profilepic');
    user.profilepic = user.profilepic ? process.env.SERVER_URL + user.profilepic : null
    if (user) {
      //Sending user's profile picture if exists
      return res.status(200).send({
        success: true,
        message: 'Correct Details',
        user: user
      });
    } else {
      //Sending failure if not exists
      return res.status(404).send({
        success: false,
        message: 'User Not Found'
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }

}
const createNewPlayer = async (req, res) => {

  try {
    console.log(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY)
    //console.log(req.params.id)
    //console.log(req.params.deviceid)
    /*const response = await client2.addDevice({
      identifier: req.params.id,
    });*/
    console.log(response.body);
    const updatedUser = await userModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          playerID: req.body.playerId,
        }
      }
    );


    if (response.body.id) {
      return res.status(200).send({
        success: true,
        message: 'Player Id Added',
        playerID: response.body.id
      });
    } else {
      return res.status(404).send({
        success: false,
        message: 'Player Id Not Added'
      });
    }
  }
  catch (err) {
    console.log("err.isJoi: ", err)
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }

}
const createNotification = async (req, res) => {
  try {
    //Validating recieved user fields
    const response2 = await client2.viewDevices({ limit: 200, offset: 0 });
    console.log(response2.body.players);
    const responsee = await client2.viewDevice(req.body.playerId);
    console.log("responsee.body ", responsee.body);
    /*
    const result = await notificationSchema.validateAsync(req.body)
    console.log(req.body)
    const notification = {
      contents: {
        en: "Test notification 2",
      },
      data:{
        id:"626383cf2733ef038cac41b3",
        type:"requestAccept"
      },
      include_player_ids: [response2.body.players[0].id]
    };
    const response = await client2.createNotification(notification);
    console.log(response);*/
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
module.exports = {
  createUser,
  getUsers,
  logout,
  confirmOtp,
  dynamicLink,
  forgetPassword,
  forgetPassword2,
  verifyOTP,
  resetPassword,
  getUser,
  deleteUser,
  deleteUserpermanent,
  updateUser,
  getUserpicture,
  sendOtp,
  createNewPlayer,
  createNotification
};