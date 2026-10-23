const { z } = require('zod');

const crearPostulacionSchema = z.object({
    id_oferta: z.string().uuid({ message: "El ID de la oferta debe ser un UUID válido." })
}).strict();

// El frontend debe enviar exactamente el string del Enum esperado
const actualizarEstadoSchema = z.object({
    nuevo_estado: z.enum([
        'En_Revisión_Por_Empresa', 
        'Entrevista_Asignada', 
        'Seleccionado', 
        'Rechazado'
    ], { message: "Transición a estado no reconocido o inválido." })
}).strict();

module.exports = { crearPostulacionSchema, actualizarEstadoSchema };