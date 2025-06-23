const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const connectDB = require('./config/db');

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION! Shutting down...', reason);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err.message);
    process.exit(1);
});

(async () => {
  try {
    await connectDB();
    console.log('MongoDB connection successful. Starting Express server...');

    const app = express();
    
    const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:4200'
        ];

        if (!origin || allowedOrigins.includes(origin) || (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost:'))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
    app.use(cors(corsOptions));

    app.use(express.json());

    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/journals', require('./routes/journalRoutes'));
    app.use('/api/ai', require('./routes/aiRoutes') );

    app.get('/', (req, res) => {
        res.send('API is running...');
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server is LIVE and listening on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server due to database connection error:', error.message);
    process.exit(1);
  }
})();