const perfilStore = require('../stores/perfil.store');
const AppError = require('../utils/AppError');

class PerfilService {
    async obtener(idUsuario) {
        const perfil = await perfilStore.obtener(idUsuario);
        if (!perfil) {
            throw new AppError('No se encontró el perfil. Verifica que el trigger de registro haya creado la fila en perfiles.', 404);
        }
        return perfil;
    }

    actualizar(idUsuario, datos) {
        return perfilStore.actualizar(idUsuario, datos);
    }

    async listarUsuarios() {
        return perfilStore.listarUsuarios();
    }

    async actualizarRol(idSolicitante, idUsuario, rol) {
        if (idSolicitante === idUsuario) {
            throw new AppError('No puedes cambiar tu propio rol desde este panel.', 400);
        }
        const perfil = await perfilStore.obtener(idUsuario);
        if (!perfil) {
            throw new AppError('No se encontró el perfil indicado.', 404);
        }
        return perfilStore.actualizarRol(idUsuario, rol);
    }

    eliminarCuenta(idUsuario) {
        return perfilStore.eliminarCuenta(idUsuario);
    }
}

module.exports = new PerfilService();
