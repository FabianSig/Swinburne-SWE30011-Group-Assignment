const express = require('express');
const router = express.Router();
const db = require('../models/database');

router.put('/updateAlarmThreshold', (req, res) => {
  const { newThreshold } = req.body;
  if (newThreshold === undefined) {
    res.status(400).send('New threshold value is required');
    return;
  }
  const query = 'UPDATE watering_system_condition SET threshold = ? WHERE type = "temperature"';
  db.query(query, [newThreshold], (err, result) => {
    if (err) {
      res.status(500).send('Error updating data in the database: ' + err.message);
      return;
    }
    if (result.affectedRows === 0) {
      res.status(404).send('No temperature type found to update');
      return;
    }
    res.status(200).send('Threshold updated successfully');
  });
});

module.exports = router;
