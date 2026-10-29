# Políticas de seguridad

La seguridad se aplica en varias capas. Las garantías descritas aquí dependen de que cada endpoint nuevo siga los mismos controles y de que las relaciones y restricciones de PostgreSQL estén configuradas correctamente.

## 1. Validación de payloads

Los `POST` y `PATCH` validan el cuerpo con Zod. Los esquemas usan `.strict()` para rechazar propiedades no declaradas y el middleware responde `400` con los detalles de validación. Las rutas `GET` no validan cuerpo porque no lo requieren.

## 2. Autenticación y roles

`verificarToken` valida el access token contra Supabase Auth. `requerirRol` obtiene el rol de `perfiles` para el UUID autenticado; no debe confiarse en un rol enviado en el body ni en una metadata que el cliente pueda editar.

El registro público asigna exclusivamente el rol `Estudiante`. La migración `supabase/migrations/20261028010000_secure_profile_on_signup.sql` crea el perfil sin confiar en metadata de rol. Los roles privilegiados deben asignarse mediante un flujo confiable de administración. La ruta de perfil deriva siempre el ID del token y nunca acepta cambios del rol.

## 3. Aislamiento de datos

El backend usa `SUPABASE_SECRET_KEY` (o, por compatibilidad, `SUPABASE_SERVICE_ROLE_KEY`), que tiene privilegios elevados y omite RLS. Por ello, las consultas de Store que leen datos privados deben filtrar usando el ID y rol obtenidos del usuario autenticado, no parámetros del cliente. El filtro por sí solo no constituye una garantía matemática: debe revisarse y probarse cada consulta, incluyendo las relaciones y los permisos de mutación. RLS y restricciones de base de datos deben mantenerse como defensa adicional cuando sea posible. Estas claves son solo del servidor; únicamente las claves publicable/anon pertenecen al frontend.

## 4. CORS

Los orígenes de navegador se configuran mediante `CORS_ORIGINS`, una lista separada por comas. El valor predeterminado en desarrollo es `http://localhost:5173,http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000`; en producción la variable es obligatoria y el servidor no inicia si falta. CORS es una política aplicada por navegadores, no autentica clientes ni bloquea cURL o Postman. El servidor permite solicitudes sin `Origin` para herramientas no-browser; esas rutas siguen requiriendo autenticación cuando corresponda.

## 5. Errores

Los handlers asíncronos de las rutas usan `catchAsync` para enviar errores al `errorHandler` global. `AppError` identifica errores esperados y su código HTTP. El modo `development` incluye stack trace; en producción se debe configurar `NODE_ENV=production` para no exponer detalles de implementación.