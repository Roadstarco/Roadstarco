var axios = require('axios');
var FormData = require('form-data');
var data = new FormData();
require('dotenv').config()
console.log("process.env.TWILIO_ACCOUNT_SID: ",process.env.TWILIO_ACCOUNT_SID)
function GetAllAirports(){
    var config = {
        method: 'get',
        url: 'https://aeroapi.flightaware.com/aeroapi/airports',
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("GetAllAirports: ",response.data);
        console.log(response.data.links.next)
        GetAllAirportsNext(response.data.links.next)
      })
      .catch(function (error) {
        console.log(error);
      });
}
function GetAllAirportsNext(nextToken){
    var config = {
        method: 'get',
        url: `https://aeroapi.flightaware.com/aeroapi${nextToken}`,
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
}
function GetInformationForAFlight(){
    var flight_id='PK369'
    var config = {
        method: 'get',
        url: `https://aeroapi.flightaware.com/aeroapi/flights/${flight_id}`,
        headers: { 
          'x-apikey': 'YNDAJIKr4oCquYx0lktHruCtzmFyG7sa'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("GetInformationForAFlight",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
}
function GetDelayInformationForAllAirportsWithDelays(){
    var config = {
        method: 'get',
        url: 'https://aeroapi.flightaware.com/aeroapi/airports/delays',
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("GetDelayInformationForAllAirportsWithDelays: ",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
      
}
function GetAllOperators(){
    var config = {
        method: 'get',
        url: 'https://aeroapi.flightaware.com/aeroapi/operators',
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("GetAllOperators: ",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
      
}
function GetAllConfiguredAlerts(){
    var config = {
        method: 'get',
        url: 'https://aeroapi.flightaware.com/aeroapi/alerts',
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("GetAllConfiguredAlerts: ",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
}
function CreateNewAlert(){
    var data = JSON.stringify({
        "ident": "string",
        "origin": "string",
        "destination": "string",
        "aircraft_type": "string",
        "start": "1970-01-01",
        "end": "1970-01-01",
        "max_weekly": 0,
        "eta": 0,
        "events": {
          "arrival": false,
          "cancelled": false,
          "departure": false,
          "diverted": false,
          "filed": false
        }
      });
      
      var config = {
        method: 'post',
        url: 'https://aeroapi.flightaware.com/aeroapi/alerts',
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY', 
          'Content-Type': 'application/json'
        },
        data : data
      };
      
      axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
    
}
function GetStaticInformationAboutAnAirport(){
    var airport_id='00AR'
    var config = {
        method: 'get',
        url: `https://aeroapi.flightaware.com/aeroapi/airports/${airport_id}`,
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("Get Static Information About An Airport: ",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    
}
function GetAllFlightsForAGivenAirport(){
    var airport_id='00AR'
    var config = {
        method: 'get',
        url: `https://aeroapi.flightaware.com/aeroapi/airports/${airport_id}/flights`,
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("Ge All Flights For A Given Airport",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
}
function GetStaticInformationForAnOperator(){
    var operator_id='AAA'
    var config = {
        method: 'get',
        url: `https://aeroapi.flightaware.com/aeroapi/operators/${operator_id}`,
        headers: { 
          'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
        }
      };
      
      axios(config)
      .then(function (response) {
        console.log("Get Static Information For An Operator: ",response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
}
function GetCountOfFlightsMatchingSearchParameters(){
  const latlong='44.953469 -111.045360 40.962321 -104.046577'
  var config = {
    method: 'get',
    url: `https://aeroapi.flightaware.com/aeroapi/flights/search/count?-latlong=${latlong}`,
    headers: { 
      'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
    }
  };
  
  axios(config)
  .then(function (response) {
    console.log("Get Count Of Flights Matching Search Parameters",response.data);
  })
  .catch(function (error) {
    console.log(error);
  });

}
function SearchForFlightPositions(){
  const query='{< alt 500} {range gs 10 100}'
  var config = {
    method: 'get',
    url: `https://aeroapi.flightaware.com/aeroapi/flights/search/positions?=${query}`,
    headers: { 
      'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
    }
  };
  
  axios(config)
  .then(function (response) {
    console.log("Search For Flight Positions: ",response.data);
  })
  .catch(function (error) {
    console.log(error);
  });

}
function GetFlightCurrentPosition(){
  const fa_flight_id='KAL9090-1649771646-adhoc-0'
  var config = {
    method: 'get',
    url: `https://aeroapi.flightaware.com/aeroapi/flights/${fa_flight_id}/position`,
    headers: { 
      'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
    }
  };
  axios(config)
  .then(function (response) {
    console.log("Get Flight's Current Position: ",response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
}
function GetInformationForAFlight2(){
  const flight_ident='ELY6'
  const fa_flight_id='UAL4-1650172524-fa-0002'
  var config = {
    method: 'get',
    url: `https://aeroapi.flightaware.com/aeroapi/flights/${flight_ident}`,
    headers: { 
      'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
    }
  };
  
  axios(config)
  .then(function (response) {
    console.log("Get Information For A Flight: ",response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
}
function GetAnImageOfAFlightsTrackOnAMap(){
  var config = {
    method: 'get',
    url: 'https://aeroapi.flightaware.com/aeroapi/flights/UAL4-1650172524-fa-0002/map',
    headers: { 
      'x-apikey': 'process.env.FLIGHTAWARE_API_KEY', 
      ...data.getHeaders()
    },
    data : data
  };
  
  axios(config)
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
}
function SearchForFlights(){
  const origin=KJFK
  const destination=LLBG
  var config = {
    method: 'get',
    url: `https://aeroapi.flightaware.com/aeroapi/flights/search?query=-origin ${origin} -destination ${destination}`,
    headers: { 
      'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
    }
  };
  
  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
}
async function GetNextScheduledFlights(nexti){
  var config = {
    method: 'get',
    url: `https://aeroapi.flightaware.com/aeroapi${nexti}`,
    headers: { 
      'x-apikey': 'YNDAJIKr4oCquYx0lktHruCtzmFyG7sa'
    }
  };
 let data= axios(config)
  .then(async function (response) {
    console.log(JSON.stringify(response.data.links));
    if(response.data.links){
      var flights=await GetNextScheduledFlights(response.data.links.next)
      return response.data.scheduled.concat(flights)
    }else{
      return response.data.scheduled
    }
    
  })
  return data
  .catch(function (error) {
    console.log(error);
  });
}
const GetScheduledFlights = async () => {
  var flightnumber="PK309"
  var config = {
    method: 'get',
    url: 'https://aeroapi.flightaware.com/aeroapi/schedules/2022-06-09/2022-06-11?origin=ISB&destination=KHI',
    headers: { 
      'x-apikey': 'YNDAJIKr4oCquYx0lktHruCtzmFyG7sa'
    }
  };
  
  axios(config)
  .then(async function (response) {
    console.log(response.data);
    if(response.data.links){
      var responseflights=await GetNextScheduledFlights(response.data.links.next)
      var finalflights=response.data.scheduled.concat(responseflights); 
      //console.log(finalflights)
      var filteredflights=finalflights.filter(flight => flight.ident_iata === flightnumber)
      console.log(filteredflights)
    }else{
      var filteredflights=response.data.scheduled.filter(flight => flight.ident_iata === flightnumber)
      console.log(filteredflights)
    }
    
  })
  .catch(function (error) {
    console.log(error);
  });
}
// async function GetScheduledFlights(){
//   var config = {
//     method: 'get',
//     url: 'https://aeroapi.flightaware.com/aeroapi/schedules/2022-04-23/2022-04-27?origin=KJFK&destination=KLAX',
//     headers: { 
//       'x-apikey': 'process.env.FLIGHTAWARE_API_KEY'
//     }
//   };
  
//   axios(config)
//   .then(function (response) {
//     console.log(JSON.stringify(response.data));
//     if(response.data.links){
//       console.log("next flights")
//       var nextFlights=GetNextScheduledFlights(response.data.links.next)
//       var totalflights=response.data.scheduled+nextFlights
//       console.log(totalflights)
//     }
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
// }
// GetAllAirports()
// GetInformationForAFlight()
// GetDelayInformationForAllAirportsWithDelays()
// GetAllOperators()
// GetAllConfiguredAlerts()
// CreateNewAlert()
// GetStaticInformationAboutAnAirport()
// GetAllFlightsForAGivenAirport()
// GetStaticInformationForAnOperator()
// GetCountOfFlightsMatchingSearchParameters()
// SearchForFlightPositions()
// GetFlightCurrentPosition()
// GetInformationForAFlight()
// GetAnImageOfAFlightsTrackOnAMap()
// SearchForFlights()
GetScheduledFlights()
//GetInformationForAFlight()