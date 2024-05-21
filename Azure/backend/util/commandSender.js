const { getMQTTClient } = require('./util/mqttClient');

var _thresholdTemperature = 30;

function setThresholdTemperature(threshold){
    _threshold = threshold
}

function sendCommand(command){
    const client = getMQTTClient();
    if (client) {
      client.publish('command/threshold', command, (err) => {
        if (err) {
          console.log('Failed to publish threshold value', err);
          return res.status(500).send('Failed to publish threshold value');
        }
        res.send(`Command sent: ${command}`);
      });
    } else {
      console.log('MQTT client is not connected');
      res.status(500).send('MQTT client is not connected');
    }
}

function checkCriticalValue(values){
    if(values.temperature_values > _thresholdTemperature){
        sendCommand("RED LED ON")
    }
}