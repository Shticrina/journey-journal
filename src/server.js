
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const tripsRouter = require('./api/trips');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/trips', tripsRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
