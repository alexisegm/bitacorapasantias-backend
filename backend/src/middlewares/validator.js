const validateSchema = (schema) => (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
        return res.status(400).json({
            error: 'Payload inválido o intento de inyección de campos no autorizados.',
            detalles: resultado.error.issues.map(err => ({
                campo: err.path.join('.'),
                mensaje: err.message
            }))
        });
    }

    req.body = resultado.data;
    return next();
};

module.exports = validateSchema;