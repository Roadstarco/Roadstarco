var bookingModel = require('../models/bookingModel')
var ObjectId = require('mongodb').ObjectID;
var accountSid = process.env.TWILIO_ACCOUNT_SID;
var authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { authSchema } = require('../helpers/userValidationSchema')
const stripe = require('stripe')("sk_test_51JI9qWSIjYjIFUxNnPl7pS5Wyx2opYfgTh0gh3ubRVDOrDgMXcQAuyVGXcfXzcmVrHT5HXuPlLp906rcgt8Oa0NP005C8GuXOY");
var n = require('country-js');
var countries = require('../APIsPractice/countriesdata.json');
//console.log(countries.ref_country_codes)
async function createStripeCharge() {
  const charge = await stripe.charges.create({
    amount: req.body.amount,
    source: `${req.body.cardToken.name}`,
    currency: 'INR',
    source: req.body.cardToken.id,
    description: "First Test Charge"
  });
}
const createBooking = async (req, res) => {
  try {
    console.log("req.body is", req.body);
    //saving user to DB
    var pickupAddress = req.body.pickupAddress;
    var dropAddress = req.body.dropAddress;
    if (req.body.pickupAddress == null) {
      console.log("it got here")
      console.log(countries.ref_country_codes.find(item => item.alpha2 == req.body.departCountry));
      var searched1 = countries.ref_country_codes.find(item => item.alpha2 == req.body.departCountry)
      pickupAddress = {
        lat: searched1.latitude,
        lng: searched1.longitude
      }
      console.log(countries.ref_country_codes.find(item => item.alpha2 == req.body.destinationCountry));
      var searched2 = countries.ref_country_codes.find(item => item.alpha2 == req.body.destinationCountry)
      dropAddress = {
        lat: searched2.latitude,
        lng: searched2.longitude
      }
    }
    var fromdate, todate;
    if (req.body.pickupType) {
      if (req.body.pickupType == "Schedule") {
        fromdate = req.body.fromdate;
        todate = req.body.todate

      } else {

        fromdate = null
        todate = null

      }
    }
    const newBooking = await new bookingModel({
      pickupAddress: pickupAddress,
      dropAddress: dropAddress,
      pickupAddressText: req.body.pickupAddressText ? req.body.pickupAddressText : null,
      dropAddressText: req.body.dropAddressText ? req.body.dropAddressText : null,
      vehicleType: req.body.vehicleType,
      category: req.body.category,
      productType: req.body.productType,
      productWeight: req.body.productWeight,
      productImage: "/src/" + req.body.productImage,
      productImage2: req.body.productImage2?"/src/" + req.body.productImage2:null,
      instructions: req.body.instructions,
      productDistribution: req.body.productDistribution,
      recieverName: req.body.recieverName,
      recieverPhoneno: {
        countrycode: req.body.recieverCountryCode,
        phoneno: req.body.recieverPhoneno
      },
      pickupType: req.body.pickupType ? req.body.pickupType : null,
      fromdate: fromdate,
      todate: todate,
      bookedBy: req.body.bookedBy
    }).save();
    if (newBooking) {
      console.log("Booking Done", newBooking)
      res.status(200).send({
        success: true,
        booking: newBooking,
        message: "Booking Successful"
      });
    } else {
      console.log("Request Failed")
      res.status(404).send({
        success: false,
        message: "Request Failed"
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
const getBooking = async (req, res) => {
  try {
    console.log("get Booking: ", req.params.id)
    //getting booking by ID
    const booking = await bookingModel.findOne({ "_id": ObjectId(req.params.id) }).populate('bookedBy');
    //sending booking to client if recieved
    if (booking) {
      return res.status(200).send({
        success: true,
        message: 'Booking Found',
        booking: booking
      });
    } else {
      //sending Error to client if not recieved
      return res.status(404).send({
        success: false,
        message: 'Booking Not Found'
      });
    }
  }
  catch (err) {
    console.log("err ", err)
  }

}
const deleteBooking = async (req, res) => {
  try {
    console.log("get BookingID: ", req.params.id)
    //soft deleting booking by ID 
    const booking = await bookingModel.softDelete({ "_id": ObjectId(req.params.id) });
    console.log("Booking: ", booking)
    if (booking.deleted > 0) {
      //Sending success if booking deleted successfully
      return res.status(200).send({
        success: true,
        message: 'Booking Deleted',
        booking: booking
      });
    } else {
      //Sending failure if booking don't exists by given ID and cant be deleted
      return res.status(404).send({
        success: false,
        message: 'No Booking By Given ID'
      });
    }
  }
  catch (err) {
    console.log("err", err)
  }

}
const updateBooking = async (req, res) => {
  try {
    console.log("get bookingID: ", req.params.id)
    console.log("req.body is", req.body);
    //Finding booking who is being updated
    const booking = await bookingModel.findOne({ "_id": ObjectId(req.params.id) });
    console.log(booking)
    if (!booking) {
      res.status(404).send({
        success: false,
        message: "Booking Don't Exists!"
      })
    }
    //Checking if we got any image
    if (req.files) {
      console.log("we getting image")
      console.log(req.files.length)
    } else {
      console.log("we not getting image")
    }
    var fromdate, todate;
    if (req.body.pickupType) {
      if (req.body.pickupType == "Schedule") {
        fromdate = req.body.fromdate;
        todate = req.body.todate

      } else {

        fromdate = null
        todate = null

      }
    }
    //Updating booking fields with new values
    const updatedBooking = await bookingModel.updateOne(
      { _id: req.params.id },
      {
        $set: {
          pickupAddress: req.body.pickupAddress?req.body.pickupAddress:booking.pickupAddress,
          dropAddress: req.body.dropAddress?req.body.dropAddress:booking.dropAddress,
          pickupAddressText: req.body.pickupAddressText ? req.body.pickupAddressText : booking.pickupAddressText,
          dropAddressText: req.body.dropAddressText ? req.body.dropAddressText : booking.dropAddressText,
          vehicleType: req.body.vehicleType?req.body.vehicleType:booking.vehicleType,
          category: req.body.category?req.body.category:booking.category,
          productType: req.body.productType?req.body.productType:booking.productType,
          productWeight: req.body.productWeight?req.body.productWeight:booking.productWeight,
          productImage: req.body.productImage?"/src/" + req.body.productImage:booking.productImage,
          productImage2: req.body.productImage2?"/src/" + req.body.productImage2:booking.productImage2,
          instructions: req.body.instructions? req.body.instructions:booking.instructions,
          productDistribution: req.body.productDistribution?req.body.productDistribution:booking.productDistribution,
          recieverName: req.body.recieverName?req.body.recieverName:booking.recieverName,
          recieverPhoneno: {
            countrycode: req.body.recieverCountryCode? req.body.recieverCountryCode:booking.recieverPhoneno.countrycode,
            phoneno: req.body.recieverPhoneno?req.body.recieverPhoneno:booking.recieverPhoneno.phoneno
          },
          pickupType: req.body.pickupType ? req.body.pickupType : booking.pickupType,
          fromdate: fromdate?fromdate:booking.fromdate,
          todate: todate?todate:booking.todate,
        }
      }
    );


    if (updatedBooking) {
      //Sending success if booking updated 
      return res.status(200).json({
        success: true,
        message: "Booking Updated!",
        updatedBooking
      })
    } else {
      //Sending failure if booking not updated 
      return res.status(400).json({
        success: false,
        message: "the booking cannot be updated!"
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
    }
  }

}
const getAllBookings = async (req, res) => {
  try {
    console.log("getting all booking")
    //getting all booking
    const allBookings = await bookingModel.find({})
      .catch((err) => {
        //sending error to frontend
        res.status(400).json({ message: err.message });
      });
    //sending recieved bookings to frontend
    res.status(200).send(allBookings);
  }
  catch (err) {
    console.log("err ", err)
  }

}
const getAllBookingsOfUser = async (req, res) => {
  try {
    console.log("getting all bookings of user", req.params)
    //getting all booking
    const allBookings = await bookingModel.find({ "bookedBy": ObjectId(req.params.userid) }).populate('bookedBy')
      .then((bookings) => {
        res.status(200).send({
          success: true,
          message: 'Bookings Of User Found',
          bookings
        });
      })
      .catch((err) => {
        //sending error to frontend
        res.status(400).json({ message: err.message });
      });
    //sending recieved bookings to frontend

  }
  catch (err) {
    console.log("err ", err)
  }

}
module.exports = {
  createBooking,
  getBooking,
  deleteBooking,
  updateBooking,
  getAllBookings,
  getAllBookingsOfUser
};