# Máquinas de Estado Finitas (FSM) ⚙️

Para garantizar la integridad de los flujos del sistema, se han implementado dos Máquinas de Estado controladas desde la Capa Service. El servidor rechazará (HTTP 400) cualquier intento de transición ilegal o saltos de estado.

## 1. Máquina de Estado de Postulaciones

Controla el embudo de reclutamiento. **Solo el usuario con rol `Empresa` dueño de la oferta puede hacer transiciones.**

* **[Enviada]** *(Estado inicial por defecto al postularse)*
  * ➡️ Puede avanzar a: `En_Revisión_Por_Empresa` o `Rechazado`.
* **[En_Revisión_Por_Empresa]**
  * ➡️ Puede avanzar a: `Entrevista_Asignada` o `Rechazado`.
* **[Entrevista_Asignada]**
  * ➡️ Puede avanzar a: `Seleccionado` o `Rechazado`.
* **[Seleccionado]** / **[Rechazado]**
  * ⛔ Estados finales. No hay transiciones de salida.

> 💡 **Nota Arquitectónica:** Cuando una postulación alcanza el estado `Seleccionado`, el sistema desbloquea automáticamente la creación de registros en la Bitácora de Horas para ese estudiante.

## 2. Máquina de Estado de la Bitácora de Horas

Controla el flujo de validación de horas prácticas. Esta máquina tiene **Control de Acceso Dual** (depende del rol de quien intenta hacer la transición).

* **[Registro_Creado]** *(Estado inicial)*
  * ➡️ Transición: `Pendiente_De_Aprobación`.
  * 👤 **Autorizado:** SOLO el `Estudiante` titular.
* **[Pendiente_De_Aprobación]**
  * ➡️ Transición: `Horas_Aprobadas` o `Horas_Rechazadas`.
  * 🏢 **Autorizado:** SOLO la `Empresa` tutora.
* **[Horas_Aprobadas]** / **[Horas_Rechazadas]**
  * ⛔ Estados finales.