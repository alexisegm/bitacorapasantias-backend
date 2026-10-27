require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet()); // Seguridad HTTP
const origenesConfigurados = process.env.CORS_ORIGINS;
if (process.env.NODE_ENV === 'production' && !origenesConfigurados) {
    throw new Error('CORS_ORIGINS debe configurarse en producción.');
}

const dominiosPermitidos = (origenesConfigurados || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(origen => origen.trim())
    .filter(Boolean);

const opcionesCors = {
    origin: (origin, callback) => {
        if (!origin || dominiosPermitidos.includes(origin)) {
            callback(null, true);
        } else {
            callback(new AppError('Bloqueado por CORS: Dominio no autorizado', 403));
        }
    },
    credentials: true
};

app.use(cors(opcionesCors));
app.use(express.json()); // Parsear JSON estricto

// Importar rutas
const bitacoraRoutes = require('./routes/bitacora.routes');
const ofertasRoutes = require('./routes/ofertas.routes');
const postulacionesRoutes = require('./routes/postulaciones.routes');

// Usar rutas
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/ofertas', ofertasRoutes);
app.use('/api/postulaciones', postulacionesRoutes);

// Ruta de prueba para verificar salud del servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor BitácoraPasantías Operativo' });
});

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
    next(new AppError(`No se puede encontrar la ruta ${req.originalUrl} en el servidor.`, 404));
});

// Middleware global de errores (debe ser el último middleware)
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});