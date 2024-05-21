const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const { initMQTT, getMQTTClient } = require('./mqttClient');
const { initWebSocket } = require('./websocket');
const { initDatabase } = require('./db');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

initMQTT();
initWebSocket(server);
initDatabase();

app.use(express.static('public'));

app.post('/updateAlarmThreshold', (req, res) => {
  console.log('Received request:', req.body);
  const { newThreshold } = req.body;
  if (newThreshold === undefined) {
    console.log('Threshold value is required');
    return res.status(400).send('Threshold value is required');
  }

  const client = getMQTTClient();
  if (client) {
    client.publish('command/threshold', newThreshold.toString(), (err) => {
      if (err) {
        console.log('Failed to publish threshold value', err);
        return res.status(500).send('Failed to publish threshold value');
      }
      res.send('Threshold value updated');
    });
  } else {
    console.log('MQTT client is not connected');
    res.status(500).send('MQTT client is not connected');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
