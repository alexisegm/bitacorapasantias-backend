const { z } = require('zod');

const crearRegistroBitacoraSchema = z.object({
    id_postulacion: z.string().uuid({ message: "El ID de postulación debe ser un UUID válido." }),
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "El formato de fecha debe ser YYYY-MM-DD." }),
    horas_invertidas: z.number()
        .positive({ message: "Las horas deben ser mayores a 0." })
        .max(8, { message: "Regla de Negocio: No puedes registrar más de 8 horas en un solo día." }),
    descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." })
})
// .strict() ES VITAL: Si envían { ..., "estado": "Horas_Aprobadas" }, la petición será rechazada inmediatamente.
.strict({ message: "Carga útil rechazada: Se detectaron campos no autorizados en la petición." });

const actualizarEstadoBitacoraSchema = z.object({
    nuevo_estado: z.enum([
        'Pendiente_De_Aprobación',
        'Horas_Aprobadas',
        'Horas_Rechazadas'
    ], { message: "Transición a estado no reconocido o inválido." })
}).strict();

module.exports = { crearRegistroBitacoraSchema, actualizarEstadoBitacoraSchema };