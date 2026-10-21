const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las credenciales de Supabase en el archivo .env');
}

// Usamos la Service Role Key para que el Backend tenga permisos absolutos.
// Las validaciones de RLS se manejarán asegurando que pasemos el ID del usuario en las consultas.
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;