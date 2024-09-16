const express = require('express');
const { connectDB } = require('./src/confic/db');
const createTables = require('./src/confic/createTables');
const bodyParser = require('body-parser');
const routes = require('./src/routes');
const app = express();

connectDB();
createTables();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Test route to fetch data from a table (e.g., 'users' table)
app.use('/api',routes)
// Start the server
app.listen(process.env.POR, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
