const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { crearRegistroBitacoraSchema } = require('../middlewares/schemas/bitacora.schema');
const bitacoraService = require('../services/bitacora.service');

// POST /api/bitacora
router.post('/', validateSchema(crearRegistroBitacoraSchema), async (req, res) => {
    try {
        const resultado = await bitacoraService.registrarHoras(req.body);
        
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
});

module.exports = router;