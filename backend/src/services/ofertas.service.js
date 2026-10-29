const ofertasStore = require('../stores/ofertas.store');
const OfertasMapper = require('../mappers/ofertas.mapper');
const AppError = require('../utils/AppError');

class OfertasService {
    async publicarOferta(datos, idEmpresa) {
        // En este punto, el middleware ya garantizó que el usuario es rol 'Empresa'
        const nuevaOferta = await ofertasStore.crearOferta(datos, idEmpresa);
        
        // Retornamos el objeto mapeado para cumplir el contrato
        return OfertasMapper.toApiContract(nuevaOferta);
    }

    async listarActivas() {
        const ofertas = await ofertasStore.obtenerOfertasActivas();
        return OfertasMapper.toListApiContract(ofertas);
    }

    async actualizarOferta(idOferta, datos, usuario) {
        const oferta = await ofertasStore.obtenerPorId(idOferta);
        if (!oferta) throw new AppError('Oferta no encontrada.', 404);
        if (usuario.rol !== 'Institucion' && oferta.id_empresa !== usuario.id) {
            throw new AppError('No puedes editar una oferta que pertenece a otra empresa.', 403);
        }
        const actualizada = await ofertasStore.actualizar(idOferta, datos);
        return OfertasMapper.toApiContract(actualizada);
    }

    async desactivarOferta(idOferta, usuario) {
        const oferta = await ofertasStore.obtenerPorId(idOferta);
        if (!oferta) throw new AppError('Oferta no encontrada.', 404);
        if (usuario.rol !== 'Institucion' && oferta.id_empresa !== usuario.id) {
            throw new AppError('No puedes desactivar una oferta que pertenece a otra empresa.', 403);
        }
        const actualizada = await ofertasStore.actualizar(idOferta, { activa: false });
        return OfertasMapper.toApiContract(actualizada);
    }
}

module.exports = new OfertasService();