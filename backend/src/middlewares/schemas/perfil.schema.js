const { z } = require('zod');

const actualizarPerfilSchema = z.object({
    nombre_completo: z.string()
        .trim()
        .min(3, { message: 'El nombre debe tener al menos 3 caracteres.' })
        .max(120, { message: 'El nombre no puede exceder 120 caracteres.' }),
    documento_identidad: z.string()
        .trim()
        .min(3, { message: 'El documento debe tener al menos 3 caracteres.' })
        .max(40, { message: 'El documento no puede exceder 40 caracteres.' })
}).strict();

const actualizarRolSchema = z.object({
    rol: z.enum(['Estudiante', 'Empresa', 'Institucion'])
}).strict();

const usuarioIdSchema = z.string().uuid({ message: 'El identificador debe ser un UUID válido.' });

module.exports = { actualizarPerfilSchema, actualizarRolSchema, usuarioIdSchema };
