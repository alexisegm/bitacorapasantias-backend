class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Identifica si es un error controlado por nosotros
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;