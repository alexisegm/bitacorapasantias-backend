const validateSchema = (schema) => (req, res, next) => {
    try {
        // .parse arroja error si falta un campo requerido, si el tipo es incorrecto
        // o si hay campos adicionales no declarados (gracias a .strict() en el esquema)
        req.body = schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Payload inválido o intento de inyección de campos no autorizados.',
            detalles: error.errors.map(err => ({
                campo: err.path.join('.'),
                mensaje: err.message
            }))
        });
    }
};

module.exports = validateSchema;