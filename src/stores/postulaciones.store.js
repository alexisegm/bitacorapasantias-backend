const supabase = require('../config/supabase');

class PostulacionesStore {
    async verificarPostulacionPrevia(id_estudiante, id_oferta) {
        const { data, error } = await supabase
            .from('postulaciones')
            .select('id')
            .eq('id_estudiante', id_estudiante)
            .eq('id_oferta', id_oferta)
            .single();
        
        return !!data; // Retorna true si ya existe
    }

    async crearPostulacion(id_estudiante, id_oferta) {
        const { data, error } = await supabase
            .from('postulaciones')
            .insert([{
                id_estudiante,
                id_oferta
                // El estado 'Enviada' se asigna por defecto en BD
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async obtenerDetallesPostulacion(id_postulacion) {
        // Hacemos un JOIN con ofertas para obtener el id_empresa y validar propiedad
        const { data, error } = await supabase
            .from('postulaciones')
            .select(`
                id,
                estado,
                ofertas_pasantias ( id_empresa )
            `)
            .eq('id', id_postulacion)
            .single();

        if (error || !data) return null;
        return data;
    }

    async actualizarEstado(id_postulacion, nuevo_estado) {
        const { data, error } = await supabase
            .from('postulaciones')
            .update({ estado: nuevo_estado })
            .eq('id', id_postulacion)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}

module.exports = new PostulacionesStore();