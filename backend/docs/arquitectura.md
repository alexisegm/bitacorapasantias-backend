# Arquitectura del Sistema 🏗️

El backend de BitácoraPasantías está diseñado bajo el patrón de **Arquitectura Limpia (Clean Architecture)**. El objetivo principal es la separación de responsabilidades, asegurando que la lógica de negocio sea independiente de los controladores web y de la base de datos.

## Estructura de Capas

El flujo de una petición HTTP atraviesa las siguientes capas, estrictamente en este orden:

1. **Routes (Capa de Red):** Recibe la petición HTTP, ejecuta los middlewares de seguridad (JWT, Roles) y de validación de esquemas (Zod). Si todo es correcto, delega la petición a la capa Service.
2. **Services (Capa de Negocio):** El "cerebro" de la aplicación. Aquí residen las reglas de negocio, las validaciones de las Máquinas de Estado y el control de accesos lógicos (ej. ¿Esta postulación pertenece a este estudiante?).
3. **Stores (Capa de Acceso a Datos):** Es la única capa autorizada para comunicarse con PostgreSQL (Supabase). Se encarga de las consultas, inserciones y mutaciones. No contiene lógica de negocio.
4. **Mappers (Capa de Transformación):** Recibe los datos "crudos" de la base de datos y los formatea según el Contrato de API, filtrando llaves foráneas o datos sensibles antes de enviarlos al frontend.

Los controladores de Route envuelven operaciones asíncronas con `catchAsync`. Los errores pasan al `errorHandler` global; los errores de validación de Zod se responden directamente con HTTP 400.

## Modelo Relacional de Base de Datos

El esquema en PostgreSQL se compone de 4 entidades fundamentales:
* **Perfiles:** Extensión de `auth.users`. Maneja el Rol (`Estudiante`, `Empresa`, `Institucion`).
* **Ofertas de Pasantías:** Vacantes publicadas por las empresas.
* **Postulaciones:** Tabla transaccional (Estudiante <> Oferta).
* **Bitácora de Horas:** Registros diarios atados obligatoriamente a una postulación que haya sido "Seleccionada".

*(Las reglas y limitaciones de aislamiento de datos se explican en `seguridad.md`.)*