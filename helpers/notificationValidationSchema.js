const Joi = require('@hapi/joi')

const notificationSchema = Joi.object({
    contents:Joi.string().required(),
    dataId:Joi.string().required(),
    dataType:Joi.string().required(),
    playerId:Joi.string().required()
})

module.exports = {
    notificationSchema
}