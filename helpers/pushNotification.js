const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const OneSignal2 = require('onesignal-node');
// With default options
const client2 = new OneSignal2.Client(ONESIGNAL_APP_ID, process.env.ONESIGNAL_REST_API_KEY);
async function createNotification(message,id,type,playerId){
    const notification = {
        contents: {
          en: message,
        },
        data:{
          id:id,
          type:type
        },
        include_player_ids: [playerId]
      };
    const response = await client2.createNotification(notification);
    return response
}
module.exports = { 
    createNotification
}