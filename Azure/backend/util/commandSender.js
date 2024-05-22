const { getMQTTClient } = require('./mqtt');

var _thresholdTemperature = 30;

function setThresholdTemperature(threshold) {
  _thresholdTemperature = threshold;
}

function sendCommand(command, client) {
  console.log(command)
  if (client) {
    client.publish('command/threshold', command, (err) => {
      if (err) {
        console.log('Failed to publish threshold value', err);
        return;
      }
      console.log(`Command sent: ${command}`);
    });
  } else {
    console.log('MQTT client is not connected');
  }
}

function checkCriticalValue(values, client) {
  if (values.temperature_levels > _thresholdTemperature) {
    sendCommand('RED LED ON', client);
  }
}

module.exports = {
  setThresholdTemperature,
  checkCriticalValue,
};
