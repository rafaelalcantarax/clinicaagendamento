
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorMiddleware = require('./middlewares/error.middleware');
const appointmentRoutes = require('./modules/appointments/appointments.routes');
const publicRoutes = require('./modules/publicBooking/public.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');

const app = express();

app.use(helmet());
app.use(cors(require('./config/cors')));
app.use(express.json());

// Middlewares Globais
app.use(require('./config/rateLimit'));

// Rotas
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Rota de Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Tratamento Central de Erros
app.use(errorMiddleware);

module.exports = app;
