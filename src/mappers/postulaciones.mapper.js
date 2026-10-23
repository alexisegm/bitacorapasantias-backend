class PostulacionesMapper {
    static toApiContract(postulacionDb) {
        return {
            id_postulacion: postulacionDb.id,
            estado_actual: postulacionDb.estado,
            fecha_registro: postulacionDb.creado_en
        };
    }
}

module.exports = PostulacionesMapper;