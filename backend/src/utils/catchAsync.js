// Envuelve el controlador y pasa cualquier error automáticamente al middleware global (next)
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

module.exports = catchAsync;