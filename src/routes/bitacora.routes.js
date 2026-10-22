const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const { crearRegistroBitacoraSchema } = require('../middlewares/schemas/bitacora.schema');
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

module.exports = router;