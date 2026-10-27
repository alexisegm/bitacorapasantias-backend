const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const { crearPostulacionSchema, actualizarEstadoSchema } = require('../middlewares/schemas/postulaciones.schema');
const postulacionesService = require('../services/postulaciones.service');

// GET /api/postulaciones - Listar postulaciones según el rol autenticado
router.get(
    '/',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa']),
    async (req, res) => {
        try {
            const listado = await postulacionesService.listar(req.user);
            return res.status(200).json({ data: listado });
        } catch (error) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message || 'Error al obtener las postulaciones.' });
        }
    }
);

// POST /api/postulaciones - Estudiante se postula a una oferta
router.post(
    '/',
    verificarToken,
    requerirRol(['Estudiante']),
    validateSchema(crearPostulacionSchema),
    async (req, res) => {
        try {
            const resultado = await postulacionesService.postular(req.body, req.user.id);
            return res.status(201).json({
                mensaje: "Postulación enviada con éxito.",
                data: resultado
            });
        } catch (error) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message || 'Error interno.' });
        }
    }
);

// PATCH /api/postulaciones/:id/estado - Empresa mueve el candidato en el embudo
router.patch(
    '/:id/estado',
    verificarToken,
    requerirRol(['Empresa']),
    validateSchema(actualizarEstadoSchema),
    async (req, res) => {
        try {
            const idPostulacion = req.params.id;
            const { nuevo_estado } = req.body;
            const idEmpresa = req.user.id;

            const resultado = await postulacionesService.avanzarEstado(idPostulacion, nuevo_estado, idEmpresa);
            
            return res.status(200).json({
                mensaje: `Postulación avanzada exitosamente al estado: ${nuevo_estado}`,
                data: resultado
            });
        } catch (error) {
            const status = error.statusCode || 500;
            return res.status(status).json({ error: error.message || 'Error interno.' });
        }
    }
);

module.exports = router;