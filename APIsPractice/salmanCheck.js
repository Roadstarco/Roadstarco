const moment = require('moment-timezone');
const initialArr = [{ a: 1 }, { b: 2 }]
initialArr.forEach(v => {
    editDue=new Date();
    console.log("editDue ", editDue)
    var editDueChanged = moment(editDue).add(10, 'm').toDate();
    v.editDueChanged = editDueChanged;
});
console.log("initialArr", initialArr);