CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.perfiles (
        id,
        rol,
        nombre_completo,
        documento_identidad
    )
    VALUES (
        NEW.id,
        'Estudiante'::public.rol_usuario,
        COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'nombre_completo', ''), 'Estudiante'),
        NULLIF(NEW.raw_user_meta_data ->> 'documento_identidad', '')
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS en_registro_usuario ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP FUNCTION IF EXISTS public.manejar_nuevo_usuario();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();
