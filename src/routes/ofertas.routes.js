const express = require('express');
const router = express.Router();
const validateSchema = require('../middlewares/validator');
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const { crearOfertaSchema } = require('../middlewares/schemas/ofertas.schema');
const ofertasService = require('../services/ofertas.service');

// POST /api/ofertas - Solo Empresas pueden publicar
router.post(
    '/',
    verificarToken,
    requerirRol(['Empresa']),
    validateSchema(crearOfertaSchema),
    async (req, res) => {
        try {
            const resultado = await ofertasService.publicarOferta(req.body, req.user.id);
            return res.status(201).json({
                mensaje: "Oferta de pasantía publicada exitosamente.",
                data: resultado
            });
        } catch (error) {
            return res.status(500).json({ error: error.message || 'Error al publicar la oferta.' });
        }
    }
);

// GET /api/ofertas - Estudiantes, Instituciones y Empresas pueden ver el listado
router.get(
    '/',
    verificarToken,
    requerirRol(['Estudiante', 'Empresa', 'Institucion']),
    async (req, res) => {
        try {
            const listado = await ofertasService.listarActivas();
            return res.status(200).json({ data: listado });
        } catch (error) {
            return res.status(500).json({ error: error.message || 'Error al obtener las ofertas.' });
        }
    }
);

module.exports = router;