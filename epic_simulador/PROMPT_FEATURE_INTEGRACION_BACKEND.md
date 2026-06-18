# Prompt para implementar Feature: Integración con API Backend y Editor Interactivo

Usa este prompt para conectar el Simulador con el exterior (el Motor Python) y permitir edición interactiva rudimentaria.

```text
Actúa como integrador de sistemas y desarrollador fullstack.

Objetivo:
Crear el `editor-bridge.js` que conecte la SPA estática con el servidor backend FastAPI para que el usuario pueda dibujar escenarios dinámicos y pedirle al Motor que calcule las trazas.

Responsabilidades:
1. Construir un formulario temporal (Sandbox) en el simulador para agregar conjuntos, variables y flechas al instante.
2. Empaquetar este estado en un JSON válido según el contrato `PlaygroundSnapshot`.
3. Hacer la petición POST asíncrona hacia `/calcular` (Motor API).
4. Recibir el `execution_trace` inyectado y pasarlo directamente al motor visual.
5. Proveer una API JavaScript estable (Bridge) que aísle al simulador de los detalles de red y manejo de errores.

Reglas:
1. El backend podría fallar (HTTP 422, etc.). Captura estos errores y muéstralos en la UI.
2. Aísla las llamadas de fetch en el Bridge. `simulator.js` no debe conocer la URL del backend ni manejar los headers HTTP.
3. Inyectar `VITE_MOTOR_URL` mediante variables de entorno para facilitar despliegues locales y de producción.

SOLID verificable:
- DIP (Dependency Inversion Principle): `simulator.js` (capa visual de alto nivel) no depende del cliente HTTP o fetch de bajo nivel, sino que consume directamente la abstracción `editor-bridge.js`.
- ISP (Interface Segregation Principle): El bridge debe exponer solo funciones pequeñas y modulares (`executeWithMotor`, `currentSnapshot`) en vez de exportar un objeto monolítico con todas las tripas.

Fallos comunes:
- El simulador sobreescribe su estado antes de que el motor devuelva éxito.
- Desfase entre el contrato esperado por Pydantic (Backend) y el JSON generado por el frontend.
- Cuelgues en la UI porque no hay estado de "Cargando..." mientras se espera la respuesta del Motor.
```

## Prompt de corrección de Red y Contratos

```text
Verifica el payload que envías a `/calcular`. Asegúrate de que `visual` se envíe intacto, y que `logic.variables` sea un array o diccionario, según lo exija el esquema estricto de Pydantic en Python. Agrega un bloque `try/catch` envolviendo el `fetch` para liberar el botón de carga en caso de error.
```
