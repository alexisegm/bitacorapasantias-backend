const errorHandler = (err, req, res, next) => {
    const statusCode = Number(err.statusCode ?? err.status) || 500;
    err.statusCode = statusCode;
    err.status = err.status || 'error';

    // Si estamos en desarrollo, enviamos el stack trace para depurar en VS Code
    const env = process.env.NODE_ENV || 'development';

    if (env === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // Si estamos en producción, ocultamos el stack trace al frontend
    if (err.isOperational || (statusCode >= 400 && statusCode < 500)) {
        // Errores controlados (Reglas de negocio, 404, 403, etc.)
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Errores de programación o librerías externas (500)
        console.error('ERROR CRÍTICO 💥', err);
        return res.status(500).json({
            status: 'error',
            message: 'Algo salió mal en el servidor.'
        });
    }
};

module.exports = errorHandler;