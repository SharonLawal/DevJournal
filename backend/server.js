const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.catch(err => process.exit(1));

app.use('/api/auth', authRoutes);
app.use('/api/journals', journalRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {});