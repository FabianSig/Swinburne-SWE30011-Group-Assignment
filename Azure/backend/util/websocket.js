const WebSocket = require('ws');
const { setWebSocketServer } = require('./mqttClient');

function initWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  setWebSocketServer(wss);
}

module.exports = { initWebSocket };
