class BitacoraMapper {
    static toApiContract(registroDb, totalAcumulado) {
        return {
            id_registro: registroDb.id,
            estado_actual: registroDb.estado,
            horas_diarias: Number(registroDb.horas_invertidas),
            total_horas_acumuladas: totalAcumulado
        };
    }
}

module.exports = BitacoraMapper;