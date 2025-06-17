const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const solicitudRoutes = require('./routes/solicitudes')

const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/solicitudes', solicitudRoutes)


app.use('/api', chatRoutes);

module.exports = app;
