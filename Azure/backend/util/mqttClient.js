const { checkCriticalValue } = require('./commandSender');
const { insertDataToDB } = require('../db');
const WebSocket = require('ws'); // Ensure WebSocket is required if not already
let wss; // WebSocket Server instance

function setWebSocketServer(server) {
  wss = new WebSocket.Server({ server });
}

async function handleMQTTMessage(topic, message) {
  checkCriticalValue(message);

  console.log(`Received message on topic ${topic}: ${message.toString()}`);
  let data;
  try {
    data = JSON.parse(message.toString());
  } catch (err) {
    console.error('Failed to parse message as JSON:', err);
    return;
  }
  try {
    const result = await insertDataToDB(data);
    console.log('Data inserted:', result);
  } catch (err) {
    console.error('Failed to insert data into DB:', err);
  }
  if (wss) {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ topic, message: message.toString() }));
      }
    });
  }
}

module.exports = { handleMQTTMessage, setWebSocketServer };
