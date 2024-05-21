const { getMQTTClient } = require('./mqtt');

var _thresholdTemperature = 30;

function setThresholdTemperature(threshold) {
  _thresholdTemperature = threshold;
}

function sendCommand(command) {
  const client = getMQTTClient();
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

function checkCriticalValue(values) {
  if (values.temperature_values > _thresholdTemperature) {
    console.log('RED LED ON');
    sendCommand('RED LED ON');
  }
}

module.exports = {
  setThresholdTemperature,
  checkCriticalValue,
};
