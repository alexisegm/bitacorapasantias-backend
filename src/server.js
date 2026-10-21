require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(helmet()); // Seguridad HTTP
app.use(cors()); // Permitir peticiones del frontend
app.use(express.json()); // Parsear JSON estricto

// Importar rutas
const bitacoraRoutes = require('./routes/bitacora.routes');

// Usar rutas
app.use('/api/bitacora', bitacoraRoutes);

// Ruta de prueba para verificar salud del servidor
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Servidor BitácoraPasantías Operativo' });
});

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Ruta no encontrada. Verifica el Contrato de API.' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});