const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');
const validateSchema = require('../middlewares/validator');
const { actualizarPerfilSchema } = require('../middlewares/schemas/perfil.schema');
const perfilService = require('../services/perfil.service');
const catchAsync = require('../utils/catchAsync');

router.get('/', verificarToken, catchAsync(async (req, res) => {
    const perfil = await perfilService.obtener(req.user.id);
    return res.status(200).json({ data: perfil });
}));

router.patch(
    '/',
    verificarToken,
    validateSchema(actualizarPerfilSchema),
    catchAsync(async (req, res) => {
        const perfil = await perfilService.actualizar(req.user.id, req.body);
        return res.status(200).json({
            mensaje: 'Perfil actualizado correctamente.',
            data: perfil
        });
    })
);

module.exports = router;
