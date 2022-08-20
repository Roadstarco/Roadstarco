const passport = require('passport')
const passportAuthenticate = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (user.success) {
      console.log(user)
      req.login(user.user, function (error) {
        if (error) return next(error);
        console.log("Request Login supossedly successful.");
        return res.status(200).send(user);
      });

    } else {
      console.log(user)
      return res.status(404).send(user);
    }

  })(req, res, next)
}
module.exports = {
  passportAuthenticate
}