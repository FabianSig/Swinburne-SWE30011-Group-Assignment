const mqtt = require('mqtt');
const express = require('express');
const WebSocket = require('ws');
const mariadb = require('mariadb');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

const brokerUrl = process.env.MQTT_BROKER_URL;
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;
const topic = process.env.MQTT_TOPIC;

const pool = mariadb.createPool({
  host: 'localhost', 
  user: process.env.MARIADB_USER, 
  password: process.env.MARIADB_PASSWORD, 
  database: 'Arduino',
  connectionLimit: 5
});

console.log(`Connecting to MQTT broker at ${brokerUrl} with username ${username}`);

const client = mqtt.connect(brokerUrl, {
  username: username,
  password: password,
  reconnectPeriod: 1000
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

client.on('reconnect', () => {
  console.log('Reconnecting to the MQTT broker...');
});

client.on('error', (err) => {
  console.error('MQTT client error:', err.message);
});

client.on('close', () => {
  console.log('MQTT connection closed');
});

client.on('offline', () => {
  console.log('MQTT client is offline');
});

client.on('message', (topic, message) => {
  console.log(`Received message on topic ${topic}: ${message.toString()}`);
  insertDataToDB(message)
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ topic, message: message.toString() }));
    }
  });
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

async function insertDataToDB(data) {
  let conn;
  try {
      conn = await pool.getConnection();
      const result = await conn.query('INSERT INTO watering_system_data(time, moisture_levels, light_levels, temperature_levels, humidity_levels) VALUES(%s, %s, %s, %s, %s)', data.time, data.light_levels, data.humidity_levels, data.temperature_levels, data.moisture_levels);
      return result;
  } catch (err) {
      throw err;
  } finally {
      if (conn) conn.end();
  }
}

// Serve static files from the "public" directory
app.use(express.static('public'));

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
