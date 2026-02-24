const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const itemsRouter = require('./routes/items');
const statsRouter = require('./routes/stats');
const cors = require('cors');
const { notFound, globalErrorHandler } = require('./middleware/errorHandler');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Basic middleware
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/stats', statsRouter);

// Error Handling
app.use('*', notFound);
app.use(globalErrorHandler);

app.listen(port, () => console.log('Backend running on http://localhost:' + port));