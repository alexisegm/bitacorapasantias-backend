class OfertasMapper {
    static toApiContract(ofertaDb) {
        return {
            id_oferta: ofertaDb.id,
            titulo: ofertaDb.titulo,
            descripcion: ofertaDb.descripcion,
            empresa: ofertaDb.perfiles ? ofertaDb.perfiles.nombre_completo : null,
            fecha_publicacion: ofertaDb.creado_en
        };
    }

    static toListApiContract(ofertasDb) {
        return ofertasDb.map(this.toApiContract);
    }
}

module.exports = OfertasMapper;