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
  const upload = multer({ storage: storage,limits: { fieldSize: 25 * 1024 * 1024 } }).fields([{name: "businessLicense"}
  , {name: "TaxIDnumber"}
  , {name: "businessOwnersName"}
  , {name: "ownerGovernmentissuedID"}
  ]);
  const upload2 = multer({ storage: storage,limits: { fieldSize: 25 * 1024 * 1024 } }).fields([{name: "image"}]);
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
    upload2,
    isLoggedIn
}