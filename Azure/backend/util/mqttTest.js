require('dotenv').config();
const { getMQTTClient, initMQTT } = require('./mqtt');

console.log(typeof getMQTTClient); // Should print 'function'

initMQTT();
setTimeout(() => {
  const client = getMQTTClient();
  console.log(client ? 'Client initialized' : 'Client not initialized');
}, 2000); // Wait 2 seconds to ensure client has time to connect
