var axios = require('axios');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
async function getDepartureDate(mmsi, pickupPortUnlocode, eta) {
  //Find all the ships added by single provider
  console.log(mmsi)
  console.log(pickupPortUnlocode)
  console.log(eta)
  var fromdate = fromdate ? fromdate : '2022-05-29'
  var todate = eta ? eta.slice(0, 10) : '2022-06-07'
  console.log("todate ", todate)
  var vdate = new Date(todate)
  console.log(vdate)
  var dd = String(vdate.getDate() + 1).padStart(2, '0');
  var mm = String(vdate.getMonth() + 1).padStart(2, '0');
  var yyyy = vdate.getFullYear();
  console.log(parseInt(mm))
  if (parseInt(mm) > 3) {
    console.log("it got here")
    var tmonth = parseInt(mm) - 3
    var tsmonth = "0" + String(tmonth)
    console.log("tsmonth", tsmonth)
    mm = tsmonth
  } else {
    console.log("it got here")
    var tmonth = 12 + parseInt(mm) - 3
    var tsmonth
    if (tmonth < 10) {
      tsmonth = "0" + String(tmonth)
    } else {
      var tsmonth = String(tmonth)
    }
    yyyy = yyyy - 1
    console.log("tsmonth", tsmonth)
    mm = tsmonth
  }
  var threemonth = yyyy + '-' + mm + '-' + dd;
  var fromdate = threemonth;
  console.log("threemonth ", threemonth)

  var config = {
    method: 'get',
    url: `https://services.marinetraffic.com/api/portcalls/v:4/${process.env.MARINE_TRAFFIC_EV01}/portid:${pickupPortUnlocode}/mmsi:${mmsi}/fromdate:${threemonth}/todate:${todate}/movetype:1/protocol:xml`,
    headers: {}
  };
  var departuredate;
  let data1 = await axios(config)
  //console.log("data1 ",data1)
  var ss = await parser.parseStringPromise(data1.data).then(function (results) {
    console.log(results);
    console.log("results.PORTCALLS ", results.PORTCALLS)
    if (results.PORTCALLS) {
      console.log("results", results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC);
      departuredate = results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC
      return results.PORTCALLS.PORTCALL[0].$.TIMESTAMP_UTC

    } else {
      return null;
    }
  })
  



}
module.exports = {
  getDepartureDate
}