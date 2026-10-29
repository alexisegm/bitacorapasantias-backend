const express = require('express');
const router = express.Router();
const { verificarToken, requerirRol } = require('../middlewares/auth.middleware');
const validateSchema = require('../middlewares/validator');
const {
    actualizarPerfilSchema,
    actualizarRolSchema,
    usuarioIdSchema
} = require('../middlewares/schemas/perfil.schema');
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

router.get('/usuarios', verificarToken, requerirRol(['Institucion']), catchAsync(async (req, res) => {
    const usuarios = await perfilService.listarUsuarios();
    return res.status(200).json({ data: usuarios });
}));

router.patch(
    '/usuarios/:id/rol',
    verificarToken,
    requerirRol(['Institucion']),
    validateSchema(actualizarRolSchema),
    catchAsync(async (req, res) => {
        const idUsuario = usuarioIdSchema.parse(req.params.id);
        const perfil = await perfilService.actualizarRol(req.user.id, idUsuario, req.body.rol);
        return res.status(200).json({
            mensaje: 'Rol actualizado correctamente.',
            data: perfil
        });
    })
);

router.delete('/cuenta', verificarToken, catchAsync(async (req, res) => {
    await perfilService.eliminarCuenta(req.user.id);
    return res.status(204).end();
}));

module.exports = router;
