const bitacoraStore = require('../stores/bitacora.store');
const BitacoraMapper = require('../mappers/bitacora.mapper');

class BitacoraService {
    async registrarHoras(datos) {
        // Regla 1: Validar Máquina de Estado de la Postulación
        const estadoPostulacion = await bitacoraStore.obtenerEstadoPostulacion(datos.id_postulacion);
        
        if (!estadoPostulacion) {
            const error = new Error('Postulación no encontrada.');
            error.statusCode = 404;
            throw error;
        }

        if (estadoPostulacion !== 'Seleccionado') {
            const error = new Error('Operación denegada. La postulación no está en estado "Seleccionado".');
            error.statusCode = 403;
            throw error;
        }

        // Regla 2: Evitar duplicidad de fechas (Validación de negocio previa a la BD)
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