const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const { initMQTT} = require('./util/mqttClient.js');
const { initWebSocket } = require('./util/websocket.js');
const { initDatabase } = require('./util/db.js');
const { setThresholdTemperature } = require('./util/commandSender.js')

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
  if (req.body === undefined) {
    console.log('Threshold value is required');
    return res.status(400).send('Threshold value is required');
  }
  setThresholdTemperature(req.body.newThreshold);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
