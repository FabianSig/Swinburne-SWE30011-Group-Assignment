const express = require('express');
const router = express.Router();
const db = require('../models/database'); // Modularized DB connection

router.get('/getData', (req, res) => {
  const query = "SELECT * FROM watering_system_data ORDER BY time DESC LIMIT 40";
  db.query(query, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

module.exports = router;