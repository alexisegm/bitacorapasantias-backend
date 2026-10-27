const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// 1. Verifica que el token sea válido y no esté expirado
const verificarToken = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Acceso denegado. Token no proporcionado o formato incorrecto.', 401);
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        throw new AppError('Token inválido o expirado. Inicia sesión nuevamente.', 401);
    }

    req.user = user;
    next();
});

// 2. Verifica que el usuario tenga el rol necesario en la tabla "perfiles"
const requerirRol = (rolesPermitidos) => {
    return catchAsync(async (req, res, next) => {
        const { data: perfil, error } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', req.user.id)
            .maybeSingle();

        if (error) throw error;
        if (!perfil) {
            throw new AppError('No se pudo verificar el perfil del usuario.', 403);
        }

        if (!rolesPermitidos.includes(perfil.rol)) {
            throw new AppError(
                `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
                403
            );
        }

        req.user.rol = perfil.rol;
        next();
    });
};

module.exports = { verificarToken, requerirRol };