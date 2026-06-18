# Prompt para reconstruir epic_motor/services

Usa este prompt para reconstruir solo los servicios activos del Motor.

```text
Actua como ingeniero Python senior especializado en motores de propagacion y separacion de capas.

Reconstruye exclusivamente epic_motor/services. Antes de escribir codigo, inspecciona:

- epic_motor/services/engine.py
- epic_motor/models/snapshot.py
- epic_motor/logic/belnap.py
- epic_motor/logic/connectives.py
- epic_motor/motorv2.py
- epic_motor/api/routes.py
- epic_motor/tests/test_motor.py

Objetivo:

Implementar el servicio run_propagation que recibe PlaygroundSnapshot y devuelve el mismo snapshot con execution_trace.

Situacion actual: el servicio recorre relaciones binarias y acumula con k-join. Esto es el PoC activo, pero no representa aun dominios futuros admisibles ni restricciones ternarias completas del articulo.

Archivo esperado:

- engine.py

Responsabilidades:

1. Inicializar ExecutionTrace.
2. Recorrer iteraciones hasta max_iterations.
3. Recorrer relations en orden estable.
4. Buscar variables origen y destino.
5. Aplicar conectivo normal o contraposicional.
6. Combinar evidencia con bv_kjoin.
7. Mutar valor de destino si cambia.
8. Registrar ExecutionAction por cada cambio.
9. Registrar estabilizacion cuando una iteracion no cambia nada.
10. Marcar stabilized y total_iterations.
11. Devolver snapshot con visual intacto.
12. Mantener orden determinista de acciones para que el Simulador pueda reproducirlas.
13. Incluir `relation_id` u origen opcional en la traza si se necesita una animacion no ambigua.

Reglas:

1. No usar FastAPI aqui.
2. No usar fetch.
3. No renderizar ni leer coordenadas.
4. No crear modelos HTTP.
5. No ocultar relaciones invalidas; si se decide ignorarlas, documentarlo y probarlo.
6. No agregar acciones para pasos que no cambiaron salvo estabilizacion.
7. No usar `copy` o mutacion sin una politica explicita sobre si se modifica el objeto de entrada.
8. No vender el k-join por aristas como implementacion completa de EPiC formal.

SOLID verificable: SRP porque el servicio calcula y registra trace, sin HTTP ni visual; OCP porque obtiene conectivos del registro. Para DIP formal, el motor de trabajo debe depender de protocolos `Constraint` y `TraceRecorder`, no de clases concretas.

Pruebas:

- Sin relaciones estabiliza.
- V propaga a N.
- F puede viajar por regla contraria si corresponde.
- Dos fuentes V y F producen B.
- Contraposicional invierte direccion logica.
- Trace contiene una accion por mutacion.
- Trace final tiene estabilizacion.
- visual sale igual que entro.
- Acciones del mismo step tienen orden estable.
- Una relacion invalida produce diagnostico acordado, no un continue silencioso no probado.

Fallos comunes:

- Crear trace pero no asignarlo a snapshot.
- Actualizar value pero no registrar old_value.
- Usar max_iterations incorrecto.
- Animar o decidir detalles visuales desde el Motor.
```

## Prompt de correccion rapida

```text
Audita run_propagation. Debe ser puro respecto a visual y concentrarse en logic. Agrega pruebas donde visual tenga metadata arbitraria para garantizar que no se toca.

Si el fallo es semantico, clasificalo como PoC topologico o EPiC formal. Para el segundo usa PROMPT_EVOLUCION_EPIC_FORMAL.md y migra por pruebas, no pegando motorv2.py dentro del endpoint.
```
