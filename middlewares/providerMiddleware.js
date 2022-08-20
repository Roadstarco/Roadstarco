var axios = require('axios');
const multer = require('multer');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
//Multer Setup Started
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' +file.originalname)
    }
  })
  const upload = multer({ storage: storage }).fields([{name: "ticketImage"}
  ]);
  const upload2 = multer({ storage: storage }).fields([{name: "verificationImage"}
  ]);
  //Multer Setup Ended
  function isLoggedIn(req, res, next) {
    console.log(req.session)
    console.log(req.isAuthenticated())
    if (req.isAuthenticated()) return next();
    res.send({
      message:"you need to be logged in"
    });
  }
  // program to convert first letter of a string to uppercase
function capitalizeFirstLetter(str) {

    // converting first letter to uppercase
    const capitalized = str.charAt(0).toUpperCase() + str.slice(1);
  
    return capitalized;
  }
  function get_fa_flight_id_info(fa_flight_id) {
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/flights/${fa_flight_id}`,
      headers: {
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
  
    let data = axios(config)
      .then(function (response) {
        //sending error if flight doesn't get found
        return response.data.flights[0]
      })
      .catch(function (error) {
        console.log(error);
      });
    return data
  }
  
  async function checkifcorrectports(dropoffPortUnlocode, pickupPortUnlocode, mmsinumber) {
    console.log("checking props: ", dropoffPortUnlocode, pickupPortUnlocode, mmsinumber)
    var today = new Date();
    var dd = String(today.getDate() + 1).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var mm2 = String(today.getMonth() + 3).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    console.log(today)
    var next2mnths = yyyy + '-' + mm2 + '-' + dd
    console.log("next2mnths: ", next2mnths)
    var isexists = false;
    var eta ;
    var config = {
      method: 'get',
      url: `https://services.marinetraffic.com/api/expectedarrivals/v:3/87ce5e0b43f408213c2973b6a5fbde3df607717e/portid:${dropoffPortUnlocode}/fromportid:${pickupPortUnlocode}/fromdate:${today}/todate:${next2mnths}/protocol:xml`,
      headers: {}
    };
    let marineships = await axios(config)
      .then(function (response) {
        console.log("response.data", response.data);
        var marineshipsxml = response.data
        parser.parseString(marineshipsxml, function (err, results) {
          // parsing to json
          console.log("check if correct ports response: ", results.ETA.VESSEL_ETA)
          results.ETA.VESSEL_ETA.map((item) => {
            console.log("mmsinumber ", item.$.MMSI, mmsinumber)
            console.log("item ", item.$)
            if (item.$.MMSI == mmsinumber) {
              console.log("it got true")
              isexists = true
              eta=item.$.ETA
            }
          })
        });
      })
      .catch(function (error) {
        console.log("error", error);
        res.status(404).send({
          success: false,
          message: "Invalid Ports Selected"
        });
      });
    return ({isexists,eta})
  }
  module.exports = { 
    upload,
    upload2,
    isLoggedIn,
    capitalizeFirstLetter,
    get_fa_flight_id_info,
    checkifcorrectports
}