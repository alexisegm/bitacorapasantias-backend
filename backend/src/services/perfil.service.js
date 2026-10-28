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
}

module.exports = new PerfilService();
