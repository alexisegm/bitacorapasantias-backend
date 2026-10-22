const supabase = require('../config/supabase');

// 1. Verifica que el token sea válido y no esté expirado
const verificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado o formato incorrecto.' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verificamos el token directamente contra el proveedor de identidad de Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
        }

        // Inyectamos el usuario autenticado en la request para su uso en los controladores
        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ error: 'Error interno en la capa de autenticación.' });
    }
};

// 2. Verifica que el usuario tenga el rol necesario en la tabla "perfiles"
const requerirRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        try {
            // Utilizamos el ID del usuario inyectado por verificarToken
            const { data: perfil, error } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', req.user.id)
                .single();

            if (error || !perfil) {
                return res.status(403).json({ error: 'No se pudo verificar el perfil del usuario.' });
            }

            if (!rolesPermitidos.includes(perfil.rol)) {
                return res.status(403).json({ 
                    error: `Acceso denegado. Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}` 
                });
            }

            req.user.rol = perfil.rol; // Guardamos el rol en memoria por si el servicio lo necesita
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Error interno al verificar permisos de rol.' });
        }
    };
};

module.exports = { verificarToken, requerirRol };