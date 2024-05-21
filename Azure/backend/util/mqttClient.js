const mqtt = require('mqtt');
const WebSocket = require('ws');
const { mqtt: mqttConfig } = require('./config');
const { insertDataToDB } = require('./db');
const { checkCriticalValue } = require('./commandSender')

let client;
let wss;

function initMQTT() {
  client = mqtt.connect(mqttConfig.brokerUrl, {
    username: mqttConfig.username,
    password: mqttConfig.password,
    reconnectPeriod: 1000
  });

  client.on('connect', () => {
    console.log('Connected to the MQTT broker');
    client.subscribe(mqttConfig.topic, (err) => {
      if (err) {
        console.error('Failed to subscribe to topic:', err.message);
      } else {
        console.log(`Subscribed to topic: ${mqttConfig.topic}`);
      }
    });
  });

  client.on('message', async (topic, message) => {

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
  });

  client.on('error', (err) => {
    console.error('MQTT client error:', err.message);
  });

  client.on('reconnect', () => {
    console.log('Reconnecting to the MQTT broker...');
  });

  client.on('close', () => {
    console.log('MQTT connection closed');
  });

  client.on('offline', () => {
    console.log('MQTT client is offline');
  });
}

function setWebSocketServer(webSocketServer) {
  wss = webSocketServer;
}

function getMQTTClient() {
  return client;
}

module.exports = { initMQTT, setWebSocketServer, getMQTTClient };
