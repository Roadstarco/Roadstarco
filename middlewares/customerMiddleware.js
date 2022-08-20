var axios = require('axios');
//getting next scheduled flights
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
async function GetNextScheduledFlights(nexti){
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi${nexti}`,
      headers: { 
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
   let data= axios(config)
    .then(function (response) {
      //console.log(JSON.stringify(response.data));
      return response.data.scheduled
    })
    return data
    .catch(function (error) {
      console.log(error);
    });
  }
  //getting next scheduled flights
  async function GetNextScheduledFlightsPagination(nexti){
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi${nexti}`,
      headers: { 
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
   let data= axios(config)
    .then(function (response) {
      //console.log(JSON.stringify(response.data));
      return response.data.scheduled
    })
    return data
    .catch(function (error) {
      console.log(error);
    });
  }
  // program to convert first letter of a string to uppercase
  function get_fa_flight_id_info(fa_flight_id) {
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/flights/${fa_flight_id}`,
      headers: { 
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
    
    let data=axios(config)
    .then(function (response) {
      console.log(response.data);
      //sending error if flight doesn't get found
      return response.data.flights[0]
    })
    .catch(function (error) {
      console.log(error);
    });
    return data
  }
  function getairportInfo(airportId) {
    var config = {
      method: 'get',
      url: `https://aeroapi.flightaware.com/aeroapi/airports/${airportId}`,
      headers: { 
        'x-apikey': process.env.FLIGHTAWARE_API_KEY
      }
    };
    let data=axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      return response.data
    })
    return data
  }
  async function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}
  module.exports = { 
    GetNextScheduledFlights,
    GetNextScheduledFlightsPagination,
    get_fa_flight_id_info,
    getairportInfo,
    convertUTCDateToLocalDate
}