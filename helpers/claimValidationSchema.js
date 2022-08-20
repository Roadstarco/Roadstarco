const Joi = require('@hapi/joi')

const claimSchema = Joi.object({
    claimTitle:Joi.string().min(10).required(),
    claimDescription:Joi.string().min(10).required(),
    claimBy:Joi.string().min(10).required()
})
module.exports = {
    claimSchema
}