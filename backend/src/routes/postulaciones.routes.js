const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const { crearPostulacionSchema, actualizarEstadoSchema } = require('../middlewares/schemas/postulaciones.schema');
const postulacionesService = require('../services/postulaciones.service');
const catchAsync = require('../utils/catchAsync');

// GET /api/postulaciones - Listar postulaciones según el rol autenticado
router.get(
    '/',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa', 'Institucion']),
    catchAsync(async (req, res) => {
        const listado = await postulacionesService.listar(req.user);
        return res.status(200).json({ data: listado });
    })
);

// POST /api/postulaciones - Estudiante se postula a una oferta
router.post(
    '/',
    verificarToken,
    requerirRol(['Estudiante']),
    validateSchema(crearPostulacionSchema),
    catchAsync(async (req, res) => {
        const resultado = await postulacionesService.postular(req.body, req.user.id);
        return res.status(201).json({
            mensaje: "Postulación enviada con éxito.",
            data: resultado
        });
    })
);

// PATCH /api/postulaciones/:id/estado - Empresa mueve el candidato en el embudo
router.patch(
    '/:id/estado',
    verificarToken,
    requerirRol(['Empresa', 'Institucion']),
    validateSchema(actualizarEstadoSchema),
    catchAsync(async (req, res) => {
        const idPostulacion = req.params.id;
        const { nuevo_estado } = req.body;
        const resultado = await postulacionesService.avanzarEstado(idPostulacion, nuevo_estado, req.user);

        return res.status(200).json({
            mensaje: `Postulación avanzada exitosamente al estado: ${nuevo_estado}`,
            data: resultado
        });
    })
);

module.exports = router;