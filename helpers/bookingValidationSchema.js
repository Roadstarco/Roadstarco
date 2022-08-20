const Joi = require('@hapi/joi')

const bookingSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(),
    address:Joi.string().min(2).required(),
    countrycode:Joi.number().required(),
    phoneno:Joi.number().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(2).required(),
})

module.exports = {
  bookingSchema
}