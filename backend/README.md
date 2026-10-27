# Contrato de API para frontend

Este documento permite desarrollar pantallas y flujos con datos simulados antes de conectar el frontend con Supabase. Los ejemplos de respuesta son fixtures: en modo mock, el frontend debe devolverlos desde su servicio simulado sin llamar a este backend.

Documentación complementaria: [Contrato de API](docs/contrato_api.md), [Arquitectura](docs/arquitectura.md), [Máquinas de estado](docs/maquinas_de_estado.md) y [Seguridad](docs/seguridad.md).

## Ejecutar localmente

Requisitos: Node.js y credenciales de un proyecto Supabase de desarrollo.

1. Instalar dependencias con `npm install`.
2. Crear `.env` con `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `PORT` (opcional), `NODE_ENV` y `CORS_ORIGINS`.
3. Iniciar el servidor en desarrollo con `npm run dev`; para ejecutar el proceso de producción, usar `npm start` con `NODE_ENV=production`.
4. Confirmar que responde en `GET http://localhost:3000/api/health`.

No compartan `.env` ni expongan `SUPABASE_SERVICE_ROLE_KEY` al frontend. El proyecto no define actualmente un script `npm test`; las validaciones disponibles deben ejecutarse por archivo o añadirse al configurar una suite.

## Inicio con mocks

- Base URL local del backend: `http://localhost:3000`.
- Mantengan los mismos UUID entre fixtures relacionados: una postulación debe apuntar a una oferta y una bitácora a una postulación.
- Simulen los códigos HTTP y las formas de respuesta documentadas aquí para que la integración posterior requiera menos cambios.
- Las rutas reales están protegidas. Al conectar el backend, envíen el access token JWT de Supabase en `Authorization`; un token ficticio de mock no autentica una petición real.

### Headers

Para todas las rutas protegidas:

```http
Authorization: Bearer <ACCESS_TOKEN_SUPABASE>
```

Para `POST` y `PATCH` con cuerpo JSON:

```http
Content-Type: application/json
```

Los roles se leen desde `perfiles.rol`. Los nombres son sensibles a mayúsculas y deben coincidir exactamente con los indicados en cada endpoint.

### Registro y creación automática del perfil

Al registrarse un usuario con Supabase Auth, un trigger de PostgreSQL escucha la inserción en `auth.users` y crea automáticamente su fila en `public.perfiles`, usando el mismo UUID del usuario. El trigger toma estos valores de `raw_user_meta_data`:

- `rol`, convertido al tipo enum `rol_usuario`.
- `nombre_completo`.
- `documento_identidad`.

Por tanto, el frontend debe enviar esa metadata durante el registro. Ejemplo con Supabase JS:

```js
const { data, error } = await supabase.auth.signUp({
  email: 'ana@example.com',
  password: 'una-clave-segura',
  options: {
    data: {
      rol: 'Estudiante',
      nombre_completo: 'Ana Pérez',
      documento_identidad: 'ID-DE-PRUEBA'
    }
  }
});
```

El trigger crea el perfil; no intenten insertar una segunda fila en `perfiles` desde el frontend. Para llamar a las rutas protegidas, usen el `access_token` de la sesión cuando Supabase la entregue. Si el proyecto requiere confirmar el correo, la sesión podría no estar disponible hasta completar esa confirmación.

**Seguridad del rol:** `options.data` proviene del cliente y el usuario puede manipularla. El trigger actual copia `rol` directamente a `perfiles`, por lo que no se debe confiar en ese valor para conceder roles privilegiados como `Empresa` o `Institucion` mediante autorregistro abierto. Para producción, asignen un rol inicial seguro (por ejemplo, `Estudiante`) o validen/asignen los roles privilegiados mediante un flujo confiable del servidor o de administración. Los valores del enum también deben coincidir con los nombres de rol que valida la API.

### Configuración del servidor

El backend carga estas variables desde `.env`:

```dotenv
PORT=3000
NODE_ENV=development
SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<SECRET_SERVER_SIDE>
CORS_ORIGINS=http://localhost:5173
```

`CORS_ORIGINS` acepta una lista separada por comas de orígenes completos, por ejemplo `https://frontend.example.com,http://localhost:5173`. En desarrollo, si no se define, el servidor permite los orígenes locales `http://localhost:5173` y `http://localhost:3000`; en producción es obligatorio configurarlo y el proceso no iniciará si falta. CORS restringe el acceso desde navegadores; no sustituye la autenticación y no impide llamadas directas con cURL o Postman. Las solicitudes sin header `Origin` se permiten para herramientas de línea de comandos.

No compartan ni incluyan `SUPABASE_SERVICE_ROLE_KEY` en el frontend, el repositorio ni los logs. `.env` está excluido por `.gitignore`.

## Ofertas

### Listar ofertas

`GET /api/ofertas`

Roles permitidos: `Estudiante`, `Empresa`, `Institucion`.

Devuelve solo ofertas activas, ordenadas de la más reciente a la más antigua. Si no hay ofertas activas, devuelve `200` con `data` como arreglo vacío.

Respuesta mock `200 OK`:

```json
{
  "data": [
    {
      "id_oferta": "11111111-1111-4111-8111-111111111111",
      "titulo": "Desarrollador Junior React/Node",
      "descripcion": "Desarrollo de funcionalidades web con acompañamiento del equipo.",
      "empresa": "Mobilistics",
      "fecha_publicacion": "2026-10-13T10:00:00.000Z"
    }
  ]
}
```

### Crear oferta

`POST /api/ofertas`

Rol permitido: `Empresa`.

El payload acepta exactamente estos campos: `titulo` (5 a 150 caracteres) y `descripcion` (mínimo 20 caracteres). No envíen `id`, `id_empresa` ni `activa`.

Request:

```json
{
  "titulo": "Desarrollador Junior React/Node",
  "descripcion": "Desarrollo de funcionalidades web con acompañamiento del equipo."
}
```

Respuesta mock `201 Created`:

```json
{
  "mensaje": "Oferta de pasantía publicada exitosamente.",
  "data": {
    "id_oferta": "11111111-1111-4111-8111-111111111111",
    "titulo": "Desarrollador Junior React/Node",
    "descripcion": "Desarrollo de funcionalidades web con acompañamiento del equipo.",
    "empresa": null,
    "fecha_publicacion": "2026-10-13T10:00:00.000Z"
  }
}
```

`empresa` puede ser `null` en la respuesta de creación; el listado obtiene el nombre mediante la relación con el perfil.

## Postulaciones

### Listar postulaciones

`GET /api/postulaciones`

Roles permitidos: `Estudiante` y `Empresa`. No requiere body. El estudiante recibe únicamente sus postulaciones; la empresa, únicamente las asociadas a sus ofertas. Los resultados se ordenan de más recientes a más antiguos.

Respuesta mock `200 OK`:

```json
{
  "data": [
    {
      "id_postulacion": "22222222-2222-4222-8222-222222222222",
      "id_estudiante": "44444444-4444-4444-8444-444444444444",
      "id_oferta": "11111111-1111-4111-8111-111111111111",
      "titulo_oferta": "Desarrollador Junior React/Node",
      "estado_actual": "Enviada",
      "fecha_registro": "2026-10-13T10:30:00.000Z"
    }
  ]
}
```

Si no hay resultados para el usuario autenticado, responde `200` con `{"data":[]}`. El backend real requiere un token válido y un perfil cuyo rol sea uno de los permitidos.

### Postularse a una oferta

`POST /api/postulaciones`

Rol permitido: `Estudiante`.

Request: `id_oferta` debe ser un UUID de una oferta existente.

```json
{
  "id_oferta": "11111111-1111-4111-8111-111111111111"
}
```

Respuesta mock `201 Created`:

```json
{
  "mensaje": "Postulación enviada con éxito.",
  "data": {
    "id_postulacion": "22222222-2222-4222-8222-222222222222",
    "estado_actual": "Enviada",
    "fecha_registro": "2026-10-13T10:30:00.000Z"
  }
}
```

Un estudiante no puede postularse dos veces a la misma oferta; el backend responde `400` en ese caso.

### Cambiar estado de postulación

`PATCH /api/postulaciones/{id_postulacion}/estado`

Rol permitido: `Empresa` propietaria de la oferta asociada a la postulación.

Request:

```json
{
  "nuevo_estado": "En_Revisión_Por_Empresa"
}
```

Estados destino aceptados: `En_Revisión_Por_Empresa`, `Entrevista_Asignada`, `Seleccionado`, `Rechazado`. La transición también debe ser legal desde el estado actual:

| Estado actual | Estados destino permitidos |
| --- | --- |
| `Enviada` | `En_Revisión_Por_Empresa`, `Rechazado` |
| `En_Revisión_Por_Empresa` | `Entrevista_Asignada`, `Rechazado` |
| `Entrevista_Asignada` | `Seleccionado`, `Rechazado` |
| `Seleccionado` | Ninguno; estado final |
| `Rechazado` | Ninguno; estado final |

Respuesta mock `200 OK`:

```json
{
  "mensaje": "Postulación avanzada exitosamente al estado: En_Revisión_Por_Empresa",
  "data": {
    "id_postulacion": "22222222-2222-4222-8222-222222222222",
    "estado_actual": "En_Revisión_Por_Empresa",
    "fecha_registro": "2026-10-13T10:30:00.000Z"
  }
}
```

Una transición reconocida por el esquema pero no permitida por la máquina devuelve `400`. Por ejemplo, `Enviada` a `Seleccionado` es ilegal. También pueden ocurrir `403` si la empresa no es propietaria de la oferta y `404` si la postulación no existe.

## Bitácora

### Registrar horas

`POST /api/bitacora`

Rol permitido: `Estudiante` propietario de la postulación. La postulación debe existir y estar en estado `Seleccionado`.

El payload acepta exactamente estos campos:

- `id_postulacion`: UUID.
- `fecha`: texto con formato `YYYY-MM-DD`.
- `horas_invertidas`: número mayor que 0 y máximo 8.
- `descripcion`: texto de al menos 10 caracteres.

No envíen un campo `estado`.

Request:

```json
{
  "id_postulacion": "22222222-2222-4222-8222-222222222222",
  "fecha": "2026-10-20",
  "horas_invertidas": 4,
  "descripcion": "Desarrollo y prueba de una funcionalidad del proyecto."
}
```

Respuesta mock `200 OK`:

```json
{
  "mensaje": "Registro de bitácora creado exitosamente.",
  "data": {
    "id_registro": "33333333-3333-4333-8333-333333333333",
    "estado_actual": "Registro_Creado",
    "horas_diarias": 4,
    "total_horas_acumuladas": 4
  }
}
```

El store no inserta `estado`; `Registro_Creado` depende del valor predeterminado configurado en la base de datos. El backend responde `400` si ya existe un registro para esa postulación y fecha, `403` si no pertenece al estudiante o no está seleccionada, y `404` si no encuentra la postulación.

### Cambiar el estado de un registro

`PATCH /api/bitacora/{id_registro}/estado`

Roles aceptados por la ruta: `Estudiante` y `Empresa`. El servicio valida además que el usuario autenticado sea el titular o la empresa propietaria, según la transición.

El cuerpo acepta únicamente `nuevo_estado` y uno de estos valores:

| Estado actual | Estado destino | Quién puede solicitarlo |
| --- | --- | --- |
| `Registro_Creado` | `Pendiente_De_Aprobación` | Estudiante titular de la postulación |
| `Pendiente_De_Aprobación` | `Horas_Aprobadas` | Empresa propietaria de la oferta |
| `Pendiente_De_Aprobación` | `Horas_Rechazadas` | Empresa propietaria de la oferta |
| `Horas_Aprobadas` | Ninguno; estado final | Ninguno |
| `Horas_Rechazadas` | Ninguno; estado final | Ninguno |

Primera transición, solicitada por el estudiante:

```http
PATCH /api/bitacora/33333333-3333-4333-8333-333333333333/estado
Authorization: Bearer <TOKEN_DE_ESTUDIANTE>
Content-Type: application/json
```

```json
{
  "nuevo_estado": "Pendiente_De_Aprobación"
}
```

Respuesta mock `200 OK`:

```json
{
  "mensaje": "Registro avanzado exitosamente al estado: Pendiente_De_Aprobación",
  "data": {
    "id_registro": "33333333-3333-4333-8333-333333333333",
    "estado_actual": "Pendiente_De_Aprobación",
    "horas_diarias": 4,
    "total_horas_acumuladas": 4
  }
}
```

Después, la empresa propietaria puede enviar `{"nuevo_estado":"Horas_Aprobadas"}` o `{"nuevo_estado":"Horas_Rechazadas"}` al mismo endpoint, usando su token. Para ambos casos, la respuesta exitosa tiene el mismo formato y `estado_actual` coincide con el estado solicitado. Si se rechazan las horas, estas dejan de incluirse en `total_horas_acumuladas`.

En modo mock pueden simular estas respuestas sin que exista el registro en Supabase. Para una petición real, el registro y sus relaciones deben existir, y el token debe corresponder al usuario autorizado. Una transición ilegal devuelve `400`; usuario con rol o propiedad incorrectos, `403`; registro inexistente, `404`.

## Errores y requisitos de integración

- `401`: falta el token o es inválido/expiró.
- `403`: el perfil no existe, el rol no está permitido o el usuario no tiene acceso al recurso.
- `404`: no se encontró el recurso solicitado.
- `400`: payload inválido o regla de negocio incumplida, como duplicidad o transición ilegal.
- `500`: error inesperado del backend o de la base de datos.

Para probar la API real se necesitan un access token válido, un perfil con el rol requerido y los registros relacionados en Supabase. Las respuestas mock de este documento permiten avanzar en la UI sin esos datos; no sustituyen esas precondiciones al integrar el backend.

Los errores de payload inválido responden `400` con `error` y `detalles`. Los errores operacionales se procesan con el manejador global: en producción devuelven `status` y `message`; los errores no operacionales se responden con un mensaje genérico `500`. En desarrollo se incluye información de depuración, por lo que no se debe ejecutar con `NODE_ENV=development` en producción.

Riesgo pendiente: el cambio de estado de bitácora actualiza primero la fila y luego calcula el total. Si el cálculo falla después de la actualización, la API puede responder `500` aunque el cambio de estado haya quedado persistido. Para garantizar atomicidad, hace falta trasladar ambas operaciones a una función transaccional de PostgreSQL/RPC.