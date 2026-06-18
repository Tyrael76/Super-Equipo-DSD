# Prompt para reconstruir epic_editor/services

Usa este prompt para reconstruir solo los servicios del Editor.

```text
Actua como ingeniero TypeScript senior especializado en clientes HTTP, adaptadores de contrato y manejo de errores.

Reconstruye exclusivamente epic_editor/services. Antes de escribir codigo, inspecciona:

- epic_editor/services/motorApiClient.ts
- epic_editor/services/formulaParser.ts
- epic_editor/domain/editorTypes.ts
- epic_motor/models/snapshot.py
- epic_motor/api/routes.py
- epic_motor/services/engine.py
- epic_simulador/simulator.js

Objetivo:

Crear un cliente de Motor desacoplado que permita al Editor enviar PlaygroundSnapshot al endpoint /calcular y recibir un PlaygroundSnapshot publico con execution_trace normalizado.

Archivos esperados:

- motorApiClient.ts
- formulaParser.ts

Responsabilidades:

1. Definir IMotorClient con health, getConectivos y calcular.
2. Definir MotorApiClient real basado en fetch.
3. Definir MotorApiError con statusCode, detail y raw.
4. Definir MockMotorClient para pruebas.
5. Consultar GET /health.
6. Consultar GET /conectivos.
7. Enviar POST /calcular.
8. Adaptar contrato publico del Editor al formato que espera el Motor si difieren.
9. Normalizar respuesta del Motor al contrato publico del Editor.
10. Preservar visual intacto.
11. Parsear formulas en un servicio separado que solo use la API del controlador o un puerto equivalente.

Reglas:

1. Esta es la unica capa del Editor que puede usar fetch.
2. No calcular Belnap.
3. No renderizar.
4. No validar todo el snapshot aqui; eso pertenece a validators.
5. No filtrar silenciosamente errores 422 o 500.
6. No exponer el formato interno Python al resto del Editor.
7. Si el Motor usa variables como diccionario con value, adaptalo aqui.
8. Si el Editor usa arrays con truth_value, conserva esa forma hacia afuera.
9. Conserva `is_contrapositive` en la ida y vuelta cuando el contrato lo exponga; no lo fuerces siempre a false.
10. Evita `any`: define DTOs de frontera para snapshots y acciones Python.
11. FormulaParser no debe asignar V/N como efecto oculto salvo que esa politica sea un parametro visible.

Normalizacion minima:

Entrada publica:

- truth_value -> value
- from_variable -> source
- to_variable -> target
- max_iterations -> meta.max_iterations

Salida publica:

- value -> truth_value
- source -> from_variable
- target -> to_variable
- execution_trace.actions con variable_id/new_value -> target_id/result_value si el resto del Editor lo espera asi.

Elige una forma canonica de trace para el dominio y aplica la conversion una vez. Agrega `old_value`, `relation_id` u `origin_id` como opcionales si el Simulador los necesita, actualizando contratos y fixtures.

SOLID verificable:

- ISP: `IMotorClient` contiene solo health, conectivos y calcular.
- DIP/LSP: EditorController usa la interfaz y MockMotorClient conserva el mismo comportamiento observable.
- SRP: HTTP/adaptacion vive en MotorApiClient y parseo vive en FormulaParser.

Pruebas que debe soportar:

- health true cuando status es ok.
- getConectivos devuelve arreglo.
- calcular envia payload correcto.
- calcular mapea respuesta a PlaygroundSnapshot publico.
- 422 devuelve MotorApiError legible.
- 500 devuelve MotorApiError legible.
- MockMotorClient permite ejecutar sin servidor real.
- Ida y vuelta conserva visual, memberships, direction y bandera contraposicional.
- FormulaParser devuelve diagnosticos para sintaxis invalida.

Fallos comunes a evitar:

- Hacer que domain dependa del formato interno del Motor.
- Devolver diccionarios Python al Simulador cuando espera arrays.
- Perder execution_trace durante la normalizacion.
- Sobrescribir visual.
```

## Prompt de correccion rapida

```text
Corrige MotorApiClient para que sea una frontera limpia. El resto del Editor debe hablar PlaygroundSnapshot publico. Si /calcular necesita otro shape, convierte antes de fetch y reconvierte despues de recibir la respuesta.

Ejecuta una prueba contractual con un Response simulado que use la forma exacta de models/snapshot.py. Si el build falla por ExecutionAction, no lo fuerces con any: alinea el DTO y editorTypes.ts.
```

Para el parser usa tambien `PROMPT_RECONSTRUIR_FORMULA_PARSER.md`.
