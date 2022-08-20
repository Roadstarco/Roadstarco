const Joi = require('@hapi/joi')

const complainSchema = Joi.object({
    complainTitle:Joi.string().min(10).required(),
    complainDescription:Joi.string().min(10).required(),
    complainBy:Joi.string().min(10).required()
})
module.exports = {
    complainSchema
}