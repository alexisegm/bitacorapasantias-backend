const postulacionesStore = require('../stores/postulaciones.store');
const PostulacionesMapper = require('../mappers/postulaciones.mapper');

class PostulacionesService {
    // Definimos las transiciones legales de la Máquina de Estado
    // Llave: Estado Actual | Valor: Array de Estados a los que puede avanzar
    static TRANSICIONES_VALIDAS = {
        'Enviada': ['En_Revisión_Por_Empresa', 'Rechazado'],
        'En_Revisión_Por_Empresa': ['Entrevista_Asignada', 'Rechazado'],
        'Entrevista_Asignada': ['Seleccionado', 'Rechazado'],
        'Seleccionado': [], // Estado Final: No hay transiciones salientes
        'Rechazado': []     // Estado Final
    };

    async postular(datos, idEstudiante) {
        // Regla 1: Un estudiante no puede postularse dos veces a la misma oferta
        const existe = await postulacionesStore.verificarPostulacionPrevia(idEstudiante, datos.id_oferta);
        if (existe) {
            const error = new Error('Ya te has postulado previamente a esta oferta.');
            error.statusCode = 400;
            throw error;
        }

        const nuevaPostulacion = await postulacionesStore.crearPostulacion(idEstudiante, datos.id_oferta);
        return PostulacionesMapper.toApiContract(nuevaPostulacion);
    }

    async avanzarEstado(idPostulacion, nuevoEstado, idEmpresa) {
        const postulacion = await postulacionesStore.obtenerDetallesPostulacion(idPostulacion);
        
        if (!postulacion) {
            const error = new Error('Postulación no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        // Seguridad: Verificar que la oferta pertenece a la empresa que intenta mutar el estado
        if (postulacion.ofertas_pasantias.id_empresa !== idEmpresa) {
            const error = new Error('Operación denegada. No eres el propietario de esta oferta.');
            error.statusCode = 403;
            throw error;
        }

        const estadoActual = postulacion.estado;

        // Validar Máquina de Estado
        const transicionesPermitidas = PostulacionesService.TRANSICIONES_VALIDAS[estadoActual];
        
        if (!transicionesPermitidas.includes(nuevoEstado)) {
            const error = new Error(`Transición ilegal en máquina de estado. No se puede pasar de [${estadoActual}] a [${nuevoEstado}].`);
            error.statusCode = 400;
            throw error;
        }

        // Si la validación pasa, ejecutamos la mutación
        const postulacionActualizada = await postulacionesStore.actualizarEstado(idPostulacion, nuevoEstado);
        
        return PostulacionesMapper.toApiContract(postulacionActualizada);
    }

            async listar(usuarioAutenticado) {
                const { id, rol } = usuarioAutenticado;
                const postulaciones = await postulacionesStore.listarPorUsuario(id, rol);
                return PostulacionesMapper.toListApiContract(postulaciones);
            }
}

module.exports = new PostulacionesService();