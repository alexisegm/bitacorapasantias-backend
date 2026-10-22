const ofertasStore = require('../stores/ofertas.store');
const OfertasMapper = require('../mappers/ofertas.mapper');

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
}

module.exports = new OfertasService();