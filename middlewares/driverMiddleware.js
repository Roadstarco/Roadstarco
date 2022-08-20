const multer = require('multer');
//Multer Setup Started
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src')
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' +file.originalname)
    }
  })
  const upload = multer({ storage: storage }).fields([{name: "vehicleimage"}
  , {name: "vehiclelicence"}
  , {name: "vehicleLicenceRegno"}
  , {name: "vehicleInsurance"}
  , {name: "vehicleResidenceProof"}
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
  module.exports = { 
    upload,
    isLoggedIn
}