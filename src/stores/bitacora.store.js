const supabase = require('../config/supabase');

class BitacoraStore {
    async obtenerDetallesPostulacion(id_postulacion) {
        const { data, error } = await supabase
            .from('postulaciones')
            .select('estado, id_estudiante')
            .eq('id', id_postulacion)
            .single();
        
        if (error) return null;
        return data;
    }

    async verificarRegistroExistente(id_postulacion, fecha) {
        const { data, error } = await supabase
            .from('bitacora_horas')
            .select('id')
            .eq('id_postulacion', id_postulacion)
            .eq('fecha', fecha)
            .single();
        
        return !!data;
    }

    async crearRegistro(registroData) {
        const { data, error } = await supabase
            .from('bitacora_horas')
            .insert([{
                id_postulacion: registroData.id_postulacion,
                fecha: registroData.fecha,
                horas_invertidas: registroData.horas_invertidas,
                descripcion: registroData.descripcion
                // El estado 'Registro_Creado' se asigna automáticamente por defecto en la BD
            }])
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async calcularHorasAcumuladas(id_postulacion) {
        const { data, error } = await supabase
            .from('bitacora_horas')
            .select('horas_invertidas')
            .eq('id_postulacion', id_postulacion)
            // Solo sumamos horas que no hayan sido rechazadas
            .neq('estado', 'Horas_Rechazadas'); 

        if (error) throw new Error(error.message);
        
        const total = data.reduce((acc, curr) => acc + Number(curr.horas_invertidas), 0);
        return total;
    }

    async obtenerDetallesRegistro(id_registro) {
        // Hacemos JOIN profundo para obtener quién es el estudiante y quién es la empresa dueña
        const { data, error } = await supabase
            .from('bitacora_horas')
            .select(`
                id,
                estado,
                postulaciones (
                    id_estudiante,
                    ofertas_pasantias ( id_empresa )
                )
            `)
            .eq('id', id_registro)
            .single();
        
        if (error || !data) return null;
        return data;
    }

    async actualizarEstado(id_registro, nuevo_estado) {
        const { data, error } = await supabase
            .from('bitacora_horas')
            .update({ estado: nuevo_estado })
            .eq('id', id_registro)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }
}

module.exports = new BitacoraStore();