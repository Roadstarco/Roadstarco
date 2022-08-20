const Joi = require('@hapi/joi')

const adminSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().min(2).required()
})
const addProviderSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    address:Joi.string().min(2).required(),
    countrycode:Joi.number().required(),
    phoneno:Joi.number().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required()
})
const promocodeSchema = Joi.object({
    promoName:Joi.string().min(2).required(),
    discountPercent:Joi.number().required(),
    availableTill:Joi.date().required(),
})
const addtripChargesSchema = Joi.object({
    charges:Joi.number().required(),
})
const resolveclaimSchema = Joi.object({
    newStatus:Joi.string().min(2).required(),
    message:Joi.string().min(2).required(),
})
const forgetpasswordSchema2 = Joi.object({
    email: Joi.string().email().lowercase().required(),
  })
  const resetotpSchema = Joi.object({
    resetPasswordOtp:Joi.string().min(6).max(6).required()
})
const changepasswordSchema = Joi.object({
    password: Joi.string().min(2).required(),
    confirmpassword: Joi.string().min(2).required(),
    adminid:Joi.string().min(2).required()
  })
module.exports = {
    adminSchema,
    addProviderSchema,
    promocodeSchema,
    addtripChargesSchema,
    resolveclaimSchema,
    forgetpasswordSchema2,
    resetotpSchema,
    changepasswordSchema
}