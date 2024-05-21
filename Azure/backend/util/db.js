const mariadb = require('mariadb');
const { db } = require('./config');

const pool = mariadb.createPool(db);

async function insertDataToDB(data) {
  if (!data.time || !data.moisture_levels || !data.light_levels || !data.temperature_levels || !data.humidity_levels) {
    console.error('Missing required data fields:', data);
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(
      'INSERT INTO watering_system_data(time, moisture_levels, light_levels, temperature_levels, humidity_levels) VALUES(?, ?, ?, ?, ?)', 
      [data.time, data.moisture_levels, data.light_levels, data.temperature_levels, data.humidity_levels]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.end();
  }
}

function initDatabase() {
  pool.getConnection()
    .then(conn => {
      console.log('Connected to MariaDB');
      conn.release();
    })
    .catch(err => {
      console.error('Error connecting to MariaDB:', err);
    });
}

module.exports = { insertDataToDB, initDatabase };
