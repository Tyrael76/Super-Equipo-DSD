# Prompt para reconstruir epic_motor/models

Usa este prompt para reconstruir solo los modelos Pydantic del Motor.

```text
Actua como ingeniero Python senior especializado en Pydantic v2 y contratos JSON.

Reconstruye exclusivamente epic_motor/models. Antes de escribir codigo, inspecciona:

- epic_motor/models/snapshot.py
- epic_motor/models/schemas.py
- epic_editor/domain/editorTypes.ts
- epic_editor/services/motorApiClient.ts
- epic_motor/services/engine.py
- epic_motor/api/routes.py

Objetivo:

Definir modelos Pydantic estrictos para el contrato activo del endpoint /calcular y documentar o aislar el contrato viejo si permanece.

Mapa actual: `models/snapshot.py` alimenta `api/routes.py`; `models/schemas.py` solo alimenta `api/app.py` y `engine/propagation.py`. No mezcles ambos grafos de modelos en una misma peticion.

Archivos esperados:

- snapshot.py
- schemas.py solo si se conserva compatibilidad vieja
- __init__.py

Modelo activo recomendado:

- LogicVariable: id, value.
- LogicSet: id, elements.
- LogicRelation: id, source, target, connective, is_contrapositive.
- LogicGraph: variables, sets, relations como diccionarios.
- ExecutionAction: step, variable_id, old_value, new_value, description, is_stabilized.
- ExecutionTrace: actions, stabilized, total_iterations.
- PlaygroundMeta: max_iterations, version.
- PlaygroundSnapshot: meta, logic, visual, execution_trace opcional.

Reglas:

1. No procesar propagacion en modelos.
2. Normalizar valores Belnap con field_validator.
3. Respetar max_iterations 1 a 500.
4. Permitir visual como dict opaco.
5. No forzar que visual tenga coordenadas conocidas por el Motor.
6. Si schemas.py conserva ElementoIn/ConjuntoIn, marcarlo como compatibilidad vieja y no usarlo en routes.py nuevo.
7. Validar que las claves de los diccionarios coincidan con el `id` interno o normalizarlas en una fabrica explicita.
8. Definir una politica para campos extra y versionado del schema.
9. Si el dominio formal se incorpora, modelar dominios admisibles separados del valor efectivo; no sobrecargar `value`.

SOLID verificable: SRP porque los modelos validan/serializan pero no calculan; ISP porque cada modelo representa una porcion pequena del contrato. La dependencia de Pydantic es una decision de frontera y no demuestra DIP por si sola.

Pruebas:

- PlaygroundSnapshot minimo se instancia.
- Valor "true" o "v" normaliza a V si esa regla existe.
- Valor desconocido normaliza a N o falla segun decision del proyecto.
- max_iterations 0 falla.
- visual con campos arbitrarios se conserva.
- execution_trace puede estar ausente al entrar.
- Las claves de variables, sets y relations conservan identidad tras serializar.
- El modelo activo acepta la traza Python sin convertirla a nombres TypeScript dentro de Pydantic.

Fallos comunes:

- Definir arrays en Motor mientras el cliente envia diccionarios sin adaptacion.
- Bloquear visual por validacion demasiado estricta.
- Usar schemas.py viejo como response_model de /calcular.
```

## Prompt de correccion rapida

```text
Audita models. El endpoint activo /calcular debe usar PlaygroundSnapshot de snapshot.py. Si schemas.py existe, no debe arrastrar el contrato viejo al flujo nuevo salvo que se haya decidido explicitamente.

Ejecuta pruebas de serializacion de ida y vuelta y compara visual byte a byte o por igualdad profunda. Si cambia el contrato, actualiza MotorApiClient y fixtures en el mismo cambio.
```
