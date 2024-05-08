const express = require('express');
const cors = require('cors');
const dataRoutes = require('./routes/dataRoutes');
const thresholdRoutes = require('./routes/thresholdRoutes');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(dataRoutes);
app.use(thresholdRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
