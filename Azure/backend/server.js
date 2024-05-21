const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const { initMQTT } = require('./util/mqtt');
const { setWebSocketServer } = require('./util/mqttClient');
const WebSocket = require('ws');
const { setThresholdTemperature } = require('./util/commandSender');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

initMQTT();
setWebSocketServer(server);

app.post('/updateAlarmThreshold', (req, res) => {
  const newThreshold = Number(req.body.newThreshold);

  if (typeof newThreshold !== 'number' || newThreshold < 0) {
      return res.status(400).json({ error: 'Invalid threshold value' });
  }

  setThresholdTemperature(newThreshold)

  res.status(200).json({ message: 'Threshold updated successfully', threshold: newThreshold });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
