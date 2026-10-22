const bitacoraStore = require('../stores/bitacora.store');
const BitacoraMapper = require('../mappers/bitacora.mapper');

class BitacoraService {
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
}

module.exports = new BitacoraService();