const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const {
    crearRegistroBitacoraSchema,
    actualizarEstadoBitacoraSchema
} = require('../middlewares/schemas/bitacora.schema');
const bitacoraService = require('../services/bitacora.service');
const catchAsync = require('../utils/catchAsync');

// POST /api/bitacora - Protegido por Token y restringido a rol 'Estudiante'
router.post(
    '/', 
    verificarToken, 
    requerirRol(['Estudiante']), 
    validateSchema(crearRegistroBitacoraSchema), 
    catchAsync(async (req, res) => {
        const resultado = await bitacoraService.registrarHoras(req.body, req.user.id);

        return res.status(200).json({
            mensaje: "Registro de bitácora creado exitosamente.",
            data: resultado
        });
    })
);

// GET /api/bitacora - Obtener historial por rol
router.get(
    '/',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa']),
    catchAsync(async (req, res) => {
        const historial = await bitacoraService.obtenerHistorial(req.user);
        return res.status(200).json({ data: historial });
    })
);

// PATCH /api/bitacora/:id/estado - Mutación de la máquina de estado
router.patch(
    '/:id/estado',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa']),
    validateSchema(actualizarEstadoBitacoraSchema),
    catchAsync(async (req, res) => {
        const idRegistro = req.params.id;
        const { nuevo_estado } = req.body;
        const resultado = await bitacoraService.avanzarEstado(idRegistro, nuevo_estado, req.user);

        return res.status(200).json({
            mensaje: `Registro avanzado exitosamente al estado: ${nuevo_estado}`,
            data: resultado
        });
    })
);

module.exports = router;