const Joi = require('@hapi/joi')

const vehicleSchema = Joi.object({
    vehicleType:Joi.string().required(),
    vehicleName:Joi.string().required(),
    vehicleColor:Joi.string().min(2).required(),
    vehicleModel:Joi.string().required(),
    licenseNumber:Joi.string().required(),
    driverId: Joi.string().min(2).required(),
})
const vehicleSchemaForCompany = Joi.object({
    vehicleType:Joi.string().required(),
    vehicleName:Joi.string().required(),
    vehicleColor:Joi.string().min(2).required(),
    vehicleModel:Joi.string().required(),
    licenseNumber:Joi.string().required(),
    companyId: Joi.string().min(2).required(),
})
module.exports = {
    vehicleSchema,
    vehicleSchemaForCompany
}