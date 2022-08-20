var createError = require('http-errors');
var express = require('express')
var request =require('request')
var path = require('path');
var app = express()
require('dotenv').config()
const db = require('./config/dbConfig.js')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
const passport =require('passport')
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
app.use(require('express-session')({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true,cookie: { secure: false } }))
app.use(passport.initialize())
app.use(passport.session())
var userRoutes1 = require('./routes/userRoutes');
var bookingRoutes1 = require('./routes/bookingRoutes');
var driverRoutes1 = require('./routes/driverRoutes');
var companyRoutes1 = require('./routes/companyRoutes');
var customerRoutes1 = require('./routes/customerRoutes');
var providerRoutes1 = require('./routes/providerRoutes');
var complainclaimRoutes1 = require('./routes/complainclaimRoutes');
var adminRoutes1 = require('./routes/adminRoutes');
const port = 5000
var cors = require('cors')
const expressSanitizer = require('express-sanitizer');
require("./passport/passportSetup")();
 // parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(express.static(path.join(__dirname, '/')))
// parse application/json
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(cors())
app.use(bodyParser.json())
app.use(expressSanitizer())
app.use(cookieParser());


const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Crowdshipping Express API with Swagger",
      version: "0.1.0",
      description:
        "This is a Crowdshipping application made with Express and documented with Swagger",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Codistan",
        url: "https://logrocket.com",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./docs/userDocs.js","./docs/bookingDocs.js","./docs/driverDocs.js","./docs/customerDocs.js","./docs/companyDocs.js","./docs/complainclaimDocs.js"],
};
const specs = swaggerJsdoc(options);
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs)
);

app.use("/user",userRoutes1);
app.use("/booking",bookingRoutes1);
app.use("/driver",driverRoutes1);
app.use("/company",companyRoutes1);
app.use("/customer",customerRoutes1)
app.use("/provider",providerRoutes1)
app.use("/complainclaim",complainclaimRoutes1)
app.use("/admin",adminRoutes1)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})