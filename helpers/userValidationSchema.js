const Joi = require('@hapi/joi')

const authSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    address:Joi.string().min(2).required(),
    countrycode:Joi.number().required(),
    phoneno:Joi.number().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
    role:Joi.string()
})
const changepasswordSchema = Joi.object({
    password: Joi.string().min(2).required(),
    confirmpassword: Joi.string().min(2).required(),
    userid:Joi.string().min(2).required()
  })
const forgetpasswordSchema = Joi.object({
    countrycode:Joi.number().required(),
    phoneno: Joi.number().min(100).required()
  })
  const forgetpasswordSchema2 = Joi.object({
    email: Joi.string().email().lowercase().required(),
  })
  const sendotpSchema = Joi.object({
    countrycode:Joi.number().required(),
    phoneno: Joi.number().required()
  })
const otpSchema = Joi.object({
    otp:Joi.string().min(6).max(6).required()
})
const resetotpSchema = Joi.object({
    resetPasswordOtp:Joi.string().min(6).max(6).required()
})
const updateSchema = Joi.object({
  firstname:Joi.string(),
  lastname:Joi.string(),
  address:Joi.string().min(2),
  countrycode:Joi.number(),
  phoneno:Joi.number(),
  email: Joi.string().email().lowercase(),
  password: Joi.string().min(2),
  profilepic:Joi.string().min(2),
})
module.exports = {
  authSchema,
  changepasswordSchema,
  forgetpasswordSchema,
  forgetpasswordSchema2,
  otpSchema,
  resetotpSchema,
  sendotpSchema,
  updateSchema
}