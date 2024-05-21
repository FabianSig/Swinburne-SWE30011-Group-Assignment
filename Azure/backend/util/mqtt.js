const mqtt = require('mqtt');
const { handleMQTTMessage } = require('./mqttClient');

let client;

function initMQTT() {
  
  const brokerUrl = process.env.MQTT_BROKER_URL;
  const brokerPort = parseInt(process.env.MQTT_BROKER_PORT, 10);
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;
  const topic = process.env.MQTT_TOPIC;

  client = mqtt.connect({
    host: brokerUrl,
    port: brokerPort,
    username: username,
    password: password,
    reconnectPeriod: 1000,
  });

  client.on('connect', () => {
    console.log('Connected to the MQTT broker');
    client.subscribe(topic, (err) => {
      if (err) {
        console.error('Failed to subscribe to topic:', err.message);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });
  });

  client.on('message', (topic, message) => {
    handleMQTTMessage(topic, message).catch(err => console.error('Error in handleMQTTMessage:', err));
  });

  client.on('error', (err) => console.error('MQTT client error:', err.message));
  client.on('close', () => console.log('MQTT connection closed'));
  client.on('offline', () => console.log('MQTT client is offline'));
  client.on('reconnect', () => console.log('Reconnecting to the MQTT broker...'));

  return client;
}

function getMQTTClient() {
  if (!client) {
    console.log('MQTT client has not been initialized');
  }
  return client;
}

module.exports = { initMQTT, getMQTTClient };
