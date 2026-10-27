const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const {
    crearRegistroBitacoraSchema,
    actualizarEstadoBitacoraSchema
} = require('../middlewares/schemas/bitacora.schema');
const bitacoraService = require('../services/bitacora.service');

// POST /api/bitacora - Protegido por Token y restringido a rol 'Estudiante'
router.post(
    '/', 
    verificarToken, 
    requerirRol(['Estudiante']), 
    validateSchema(crearRegistroBitacoraSchema), 
    async (req, res) => {
        try {
            // Pasamos tanto el payload validado como el ID del usuario autenticado
            const resultado = await bitacoraService.registrarHoras(req.body, req.user.id);
            
            return res.status(200).json({
                mensaje: "Registro de bitácora creado exitosamente.",
                data: resultado
            });
        } catch (error) {
            const status = error.statusCode || 500;
            return res.status(status).json({
                error: error.message || 'Error interno del servidor.'
            });
        }
    }
);

// GET /api/bitacora - Obtener historial por rol
router.get(
    '/',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa']),
    async (req, res) => {
        try {
            const historial = await bitacoraService.obtenerHistorial(req.user);
            return res.status(200).json({ data: historial });
        } catch (error) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message || 'Error al obtener el historial.' });
        }
    }
);

// PATCH /api/bitacora/:id/estado - Mutación de la máquina de estado
router.patch(
    '/:id/estado',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa']),
    validateSchema(actualizarEstadoBitacoraSchema),
    async (req, res) => {
        try {
            const idRegistro = req.params.id;
            const { nuevo_estado } = req.body;
            const resultado = await bitacoraService.avanzarEstado(idRegistro, nuevo_estado, req.user);

            return res.status(200).json({
                mensaje: `Registro avanzado exitosamente al estado: ${nuevo_estado}`,
                data: resultado
            });
        } catch (error) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message || 'Error interno.' });
        }
    }
);

module.exports = router;