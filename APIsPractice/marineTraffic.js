var ports = require('./portsdata.json')
var result="LYNNHAVEN"
var filteredports3=(ports.filter(item => item.Name.toLowerCase().includes(result.toLowerCase())));
console.log(filteredports3)