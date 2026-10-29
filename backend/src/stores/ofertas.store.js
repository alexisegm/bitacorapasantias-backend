const supabase = require('../config/supabase');

class OfertasStore {
    async crearOferta(datos, id_empresa) {
        const { data, error } = await supabase
            .from('oferta_pasantia')
            .insert([{
                id_empresa: id_empresa,
                titulo: datos.titulo,
                descripcion: datos.descripcion
                // 'activa' es true por defecto según el DDL
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async obtenerOfertasActivas() {
        const { data, error } = await supabase
            .from('oferta_pasantia')
            .select(`
                id,
                titulo,
                descripcion,
                creado_en,
                perfiles ( nombre_completo )
            `)
            .eq('activa', true)
            .order('creado_en', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }
}

module.exports = new OfertasStore();