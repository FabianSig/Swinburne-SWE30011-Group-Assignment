module.exports = {
    mqtt: {
      brokerUrl: process.env.MQTT_BROKER_URL,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      topic: process.env.MQTT_TOPIC
    },
    db: {
      host: 'localhost',
      user: process.env.MARIADB_USER,
      password: process.env.MARIADB_PASSWORD,
      database: 'Arduino',
      connectionLimit: 5
    }
  };
  