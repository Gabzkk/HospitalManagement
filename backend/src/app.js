const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hospital Management API');
});

// Routes
app.use('/api', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api', require('./routes/apiRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: { message: err.message, stack: process.env.NODE_ENV === 'development' ? err.stack : undefined } });
});

module.exports = app;
