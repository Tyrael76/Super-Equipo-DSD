# Prompt para reconstruir epic_motor/api

Usa este prompt para reconstruir solo la capa API del Motor.

```text
Actua como ingeniero backend senior especializado en FastAPI.

Reconstruye exclusivamente epic_motor/api. Antes de escribir codigo, inspecciona:

- epic_motor/api/routes.py
- epic_motor/api/app.py
- epic_motor/main.py
- epic_motor/models/snapshot.py
- epic_motor/services/engine.py
- epic_motor/logic/connectives.py
- epic_motor/start_motor.ps1
- render.yaml

Objetivo:

Exponer la API REST del Motor sin meter logica de propagacion dentro de los handlers.

Punto de entrada activo: `epic_motor/main.py` importa `api/routes.py`. `api/app.py` pertenece al contrato legacy y no debe usarse en los comandos actuales.

Archivos esperados:

- routes.py
- app.py si el proyecto lo usa
- __init__.py

Endpoints:

1. GET /health devuelve estado ok y version.
2. GET /conectivos devuelve conectivos disponibles.
3. POST /calcular recibe PlaygroundSnapshot y devuelve PlaygroundSnapshot con execution_trace.

Reglas:

1. El endpoint /calcular solo debe delegar a run_propagation.
2. No procesar visual en routes.
3. No implementar matrices en routes.
4. No crear modelos inline si ya existen en models.
5. Mantener CORS compatible con localhost:3000, 127.0.0.1:3000 y el frontend Vite si aplica.
6. Dejar que Pydantic valide el body.
7. Devolver errores HTTP claros cuando haya excepciones esperadas.
8. Mantener alineados start_motor.ps1, README y render.yaml con `main:app`.
9. Configurar CORS por entorno para produccion; si se conserva `*`, documentar el riesgo y la incompatibilidad con credenciales.

SOLID verificable: SRP en handlers delgados; DIP en el composition root si el router recibe el servicio por dependencia; ISP en endpoints y DTOs pequenos. FastAPI por si solo no demuestra DIP.

Pruebas sugeridas:

- GET /health retorna 200.
- GET /conectivos incluye PROPAGATION e IMPLIES.
- POST /calcular acepta snapshot minimo.
- POST /calcular preserva visual.
- POST /calcular agrega execution_trace.
- OpenAPI muestra el PlaygroundSnapshot activo, no MotorInput/MotorOutput legacy.

Fallos comunes:

- Calcular dentro del route.
- Devolver MotorOutput viejo mientras el cliente espera PlaygroundSnapshot.
- Romper CORS.
```

## Prompt de correccion rapida

```text
Limpia routes.py. Los handlers deben ser delgados: validar por modelo, llamar servicio y devolver resultado. Cualquier calculo pertenece a services/engine.py.

Arranca `python -m uvicorn main:app --reload --port 8000` desde epic_motor y prueba /health, /conectivos y /calcular. Si una guia recomienda api.app:app, actualizala.
```
