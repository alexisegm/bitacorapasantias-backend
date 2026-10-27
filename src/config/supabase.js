const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Faltan las credenciales de Supabase en el archivo .env');
}

// Esta clave omite RLS: las consultas con datos privados deben aplicar sus propios filtros de autorización.
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;