const { getMQTTClient } = require('./mqtt');

var _thresholdTemperature = 30;
var lastCommand = new Set();


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
  if (values.moisture_levels < _thresholdTemperature && !lastCommand.has('PUMP ON')) {
    sendCommand('PUMP ON', client);
    lastCommand.add('PUMP ON');
    lastCommand.delete('PUMP OFF');
  }
  if(values.moisture_levels > _thresholdTemperature && !lastCommand.has('PUMP OFF')){
    sendCommand('PUMP OFF', client);
    lastCommand.add('PUMP OFF');
    lastCommand.delete('PUMP ON');
  }
}

module.exports = {
  setThresholdTemperature,
  checkCriticalValue,
};
