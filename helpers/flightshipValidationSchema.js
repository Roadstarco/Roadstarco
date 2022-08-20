const Joi = require('@hapi/joi')

const flightSchema = Joi.object({
    providerId:Joi.string().required(),
    pickupCity:Joi.string().required(),
    dropoffCity:Joi.string().min(2).required(),
    flightDate:Joi.string().required(),
    flightarrivalDate:Joi.string().required(),
    departureAirport:Joi.string().required(),
    destinationAirport: Joi.string().required(),
    departureTime: Joi.string().required(),
    destinationTime: Joi.string().required(),
    flightNumber: Joi.string().required(),
    flightAirline: Joi.string().required(),
    fa_flight_id: Joi.string().required(),
    pickupIATACityCode: Joi.string().required(),
    dropoffIATACityCode: Joi.string().required(),
})
const postflightSchema = Joi.object({
    providerId:Joi.required(),
    pickupCity:Joi.string().required(),
    dropoffCity:Joi.string().min(2).required(),
    flightDate:Joi.string().required(),
    flightarrivalDate:Joi.string().required(),
    departureAirport:Joi.string().required(),
    destinationAirport: Joi.string().required(),
    departureTime: Joi.string().required(),
    destinationTime: Joi.string().required(),
    flightNumber: Joi.string().required(),
    flightAirline: Joi.string().required(),
    fa_flight_id: Joi.string().required(),
    pickupIATACityCode: Joi.string().required(),
    dropoffIATACityCode: Joi.string().required(),
    postrequestId:Joi.string().required(),
    customerId:Joi.required(),
    bookingId:Joi.required()
})
const shipSchema = Joi.object({
    providerId:Joi.string().required(),
    pickupCity:Joi.string().required(),
    dropoffCity:Joi.string().min(2).required(),
    shipDate:Joi.string().required(),
    departurePort:Joi.string().required(),
    destinationPort: Joi.string().required(),
    departureTime: Joi.string().required(),
    destinationTime: Joi.string().required(),
    mmsiNumber: Joi.string().required(),
    pickupPortUnlocode: Joi.string().required(),
    dropoffPortUnlocode: Joi.string().required(),
})
const getflightsSchema = Joi.object({
    pickupCity:Joi.string().required(),
    dropoffCity:Joi.string().min(2).required(),
    startingDate:Joi.string().required(),
    endingDate:Joi.string().required(),
    departCode:Joi.string().required(),
    arrivalCode: Joi.string().required(),
})
const getshipsSchema = Joi.object({
    pickupCity:Joi.string().required(),
    dropoffCity:Joi.string().min(2).required(),
    startingDate:Joi.string().required(),
    endingDate:Joi.string().required(),
    pickupPortUnlocode:Joi.string().required(),
    dropoffPortUnlocode: Joi.string().required(),
})
const searchflightsSchema = Joi.object({
    departCode:Joi.string().min(1).required(),
    arrivalCode:Joi.string().min(1).required(),
    flightnumber:Joi.string().min(2).required(),
    date:Joi.string()
})
module.exports = {
    flightSchema,
    postflightSchema,
    shipSchema,
    getflightsSchema,
    getshipsSchema,
    searchflightsSchema
}