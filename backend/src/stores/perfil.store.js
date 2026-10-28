const supabase = require('../config/supabase');

class PerfilStore {
    async obtener(id) {
        const { data, error } = await supabase
            .from('perfiles')
            .select('id, rol, nombre_completo, documento_identidad')
            .eq('id', id)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return data;
    }

    async actualizar(id, datos) {
        const { data, error } = await supabase
            .from('perfiles')
            .update({
                nombre_completo: datos.nombre_completo,
                documento_identidad: datos.documento_identidad
            })
            .eq('id', id)
            .select('id, rol, nombre_completo, documento_identidad')
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}

module.exports = new PerfilStore();
