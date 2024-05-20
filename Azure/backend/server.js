const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const { initMQTT, getMQTTClient } = require('./mqttClient');
const { initWebSocket } = require('./websocket');
const { initDatabase } = require('./db');

const app = express();
const server = http.createServer(app);

app.use(express.json());

initMQTT();
initWebSocket(server);
initDatabase();

app.use(express.static('public'));

app.put('/updateAlarmThreshold', (req, res) => {
  const { newThreshold } = req.body;
  if (newThreshold === undefined) {
    return res.status(400).send('Threshold value is required');
  }

  const client = getMQTTClient();
  if (client) {
    client.publish('command/threshold', newThreshold.toString(), (err) => {
      if (err) {
        return res.status(500).send('Failed to publish threshold value');
      }
      res.send('Threshold value updated');
    });
  } else {
    res.status(500).send('MQTT client is not connected');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
