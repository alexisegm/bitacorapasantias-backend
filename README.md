# IMPLEMENTACION DE PROYECTO

## FASE 1: IMPLEMENTACION INICIAL (INFRAESTRUCTURA BASE CONTROL DE VERSIONES Y MODELADO DE DATOS)

## FASE 2: ARQUITECTURA LIMPIA, SEGURIDAD DE PAYLOADS Y LOGICA TRANSACCIONAL

Contrato de API para que comiencen a trabajar con Mocks (datos simulados) en el frontend sin bloqueos. Deben implementar la siguiente especificación exacta:

ENDPOINT: POST /api/bitacora
Descripción: Registra una nueva jornada de pasantías.
Headers requeridos: Authorization: Bearer <JWT_TOKEN> y Content-Type: application/json

Payload Esperado (Lo que el frontend debe enviar):

{
  "id_postulacion": "123e4567-e89b-12d3-a456-426614174000",
  "fecha": "2026-10-13",
  "horas_invertidas": 4.5,
  "descripcion": "Desarrollo de módulos frontend y conexión inicial con Mocks."
}


(Nota para el equipo de Frontend: NO enviar el campo estado, el servidor forzará automáticamente Registro_Creado y rechazará peticiones que incluyan estados manipulados).

Respuesta Exitosa Esperada - HTTP 200 OK (Lo que el frontend debe simular/recibir):

{
  "mensaje": "Registro de bitácora creado exitosamente.",
  "data": {
    "id_registro": "987fcdeb-51a2-43d7-9012-426614174000",
    "estado_actual": "Registro_Creado",
    "horas_diarias": 4.5,
    "total_horas_acumuladas": 120.5 
  }
}

Respuestas de Error (Para manejar alertas en la UI):

HTTP 400: Payload inválido... (Validación de formulario)

HTTP 400: Ya existe un registro para esta fecha. (Regla de negocio)

HTTP 403: Operación denegada. La postulación no está en estado "Seleccionado". (Máquina de estado)

## FASE 2: AUTENTICACION MEDIANTE JWT Y CONTROL DE ACCESO POR ROLES (RBAC)

* ** Para el Frontend **

A partir de ahora, todas las peticiones a endpoints protegidos deben incluir el header:

Authorization: Bearer <TOKEN_DE_SUPABASE>

## FASE 3: MODULO DE OFERTAS Y REGLAS DE ROL (MARKETPLACE)

Especificaciones para configurar los mocks correspondientes a la bolsa de trabajo:

1. Crear Oferta (POST /api/ofertas)

Headers: Authorization: Bearer <TOKEN> (Debe pertenecer a un usuario rol Empresa)

Payload:

{
  "titulo": "Desarrollador Junior React/Node",
  "descripcion": "Buscamos estudiante del I.T.S.U. para integrarse al equipo de desarrollo web..."
}

Respuesta Exitosa (HTTP 201): Retorna el objeto creado con id_oferta y fecha_publicacion.

2. Listar Ofertas (GET /api/ofertas)

Headers: Authorization: Bearer <TOKEN>

Respuesta Exitosa (HTTP 200):

{
  "data": [
    {
      "id_oferta": "uuid-generado",
      "titulo": "Desarrollador Junior React/Node",
      "descripcion": "Buscamos estudiante...",
      "empresa": "Mobilistics / DINAMIC",
      "fecha_publicacion": "2026-10-13T10:00:00.000Z"
    }
  ]
}