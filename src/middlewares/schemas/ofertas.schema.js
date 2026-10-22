const { z } = require('zod');

const crearOfertaSchema = z.object({
    titulo: z.string()
        .min(5, { message: "El título debe tener al menos 5 caracteres." })
        .max(150, { message: "El título no puede exceder los 150 caracteres." }),
    descripcion: z.string()
        .min(20, { message: "La descripción es muy corta. Detalla los requerimientos." })
}).strict({ message: "Payload rechazado: No se permiten campos adicionales (como id o activa)." });

module.exports = { crearOfertaSchema };