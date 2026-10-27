const bitacoraStore = require('../stores/bitacora.store');
const BitacoraMapper = require('../mappers/bitacora.mapper');

class BitacoraService {
    static TRANSICIONES_VALIDAS = {
        'Registro_Creado': ['Pendiente_De_Aprobación'],
        'Pendiente_De_Aprobación': ['Horas_Aprobadas', 'Horas_Rechazadas'],
        'Horas_Aprobadas': [],
        'Horas_Rechazadas': []
    };

    async registrarHoras(datos, idAutenticado) {
        // Validar existencia, pertenencia y estado de la postulación.
        const detallesPostulacion = await bitacoraStore.obtenerDetallesPostulacion(datos.id_postulacion);
        
        if (!detallesPostulacion) {
            const error = new Error('Postulación no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        if (detallesPostulacion.id_estudiante !== idAutenticado) {
            const error = new Error('Operación denegada. Esta postulación no te pertenece.');
            error.statusCode = 403; // Forbidden
            throw error;
        }

        const estadoPostulacion = detallesPostulacion.estado;
        
        if (estadoPostulacion !== 'Seleccionado') {
            const error = new Error('Operación denegada. La postulación no está en estado "Seleccionado".');
            error.statusCode = 403;
            throw error;
        }

        // Evitar registros duplicados para la misma fecha.
        const existeRegistro = await bitacoraStore.verificarRegistroExistente(datos.id_postulacion, datos.fecha);
        if (existeRegistro) {
            const error = new Error('Ya existe un registro para esta fecha.');
            error.statusCode = 400;
            throw error;
        }

        // Ejecutar creación
        const nuevoRegistro = await bitacoraStore.crearRegistro(datos);

        // Calcular total
        const horasAcumuladas = await bitacoraStore.calcularHorasAcumuladas(datos.id_postulacion);

        // Retornar datos mapeados
        return BitacoraMapper.toApiContract(nuevoRegistro, horasAcumuladas);
    }

    async avanzarEstado(idRegistro, nuevoEstado, usuarioAutenticado) {
        const registro = await bitacoraStore.obtenerDetallesRegistro(idRegistro);

        if (!registro) {
            const error = new Error('Registro de bitácora no encontrado.');
            error.statusCode = 404;
            throw error;
        }

        const estadoActual = registro.estado;
        const transicionesPermitidas = BitacoraService.TRANSICIONES_VALIDAS[estadoActual];
        if (!transicionesPermitidas || !transicionesPermitidas.includes(nuevoEstado)) {
            const error = new Error(`Transición ilegal en máquina de estado de bitácora. No se puede pasar de [${estadoActual}] a [${nuevoEstado}].`);
            error.statusCode = 400;
            throw error;
        }

        const idEstudiante = registro.postulaciones.id_estudiante;
        const idEmpresa = registro.postulaciones.ofertas_pasantias.id_empresa;

        if (nuevoEstado === 'Pendiente_De_Aprobación') {
            if (usuarioAutenticado.rol !== 'Estudiante' || usuarioAutenticado.id !== idEstudiante) {
                const error = new Error('Operación denegada. Solo el estudiante titular puede enviar horas a revisión.');
                error.statusCode = 403;
                throw error;
            }
        } else if (nuevoEstado === 'Horas_Aprobadas' || nuevoEstado === 'Horas_Rechazadas') {
            if (usuarioAutenticado.rol !== 'Empresa' || usuarioAutenticado.id !== idEmpresa) {
                const error = new Error('Operación denegada. Solo la empresa tutora puede aprobar o rechazar horas.');
                error.statusCode = 403;
                throw error;
            }
        }

        const registroActualizado = await bitacoraStore.actualizarEstado(idRegistro, nuevoEstado);
        const horasAcumuladas = await bitacoraStore.calcularHorasAcumuladas(registro.postulaciones.id);

        return BitacoraMapper.toApiContract(registroActualizado, horasAcumuladas);
    }
}

module.exports = new BitacoraService();