# Prompt para reconstruir datos de ejemplo del Simulador

Usa este prompt para reconstruir presets y archivos JSON de ejemplo.

```text
Actua como ingeniero de QA frontend especializado en fixtures de datos.

Reconstruye exclusivamente los datos de ejemplo de epic_simulador, especialmente e2e-real-trace.json y presets dentro de simulator.js. Antes de escribir datos, inspecciona:

- epic_simulador/e2e-real-trace.json
- epic_simulador/simulator.js
- epic_editor/domain/editorTypes.ts
- epic_motor/models/snapshot.py

Objetivo:

Crear snapshots pequenos pero representativos para probar visualizacion, cajitas y animacion.

Fixtures obligatorios:

1. Implicacion simple: p(V) -> q(N), q termina V.
2. Contraposicion: q(F) obliga movimiento inverso hacia p.
3. Contradiccion: p(V) y r(F) llegan a q(B).
4. Cadena: A -> B -> C para verificar cajitas repetidas.
5. Ciclo controlado para verificar que no aparecen bolitas del lado incorrecto.
6. Variable repetida en varias instancias visuales para verificar sincronizacion.
7. Dos relaciones candidatas hacia el mismo target para exigir relation_id u origen no ambiguo.
8. Formula compuesta con variable auxiliar cuando el Motor formal la soporte.

Reglas:

1. Usar PlaygroundSnapshot publico como base.
2. Incluir meta, logic, visual y execution_trace.
3. Las coordenadas deben ubicar instancias dentro de sus sets.
4. Cada relation debe tener visual.relations compatible.
5. Actions deben poder normalizarse a variable_id/new_value.
6. No crear datos gigantes.
7. Distinguir fixtures del contrato publico y respuestas internas Python; cada archivo declara su forma.
8. `final_logic` o el estado final debe coincidir con la ultima accion cuando ese campo exista.

Validaciones manuales:

- Cargar cada fixture no lanza error.
- Se dibujan todas las circunferencias.
- Se dibujan todas las flechas.
- Play termina.
- Siguiente avanza solo un movimiento.
- Variables repetidas se sincronizan.
- El fixture puede enviarse a /calcular o marcarse claramente como salida ya calculada.
- Cada accion referencia variable y relacion existentes cuando esos campos no son comodines.

SOLID verificable: los fixtures son datos de prueba y no implementan SOLID. Se usan para demostrar las fronteras y responsabilidades de los modulos.

Fallos comunes:

- Action apunta a variable inexistente.
- visual.instance apunta a fantasma.
- Coordenadas fuera del set y cajitas mal calculadas.
- Trace final no coincide con final_logic.
```

## Prompt de correccion rapida

```text
Revisa todos los fixtures contra editorTypes.ts. Corrige referencias rotas antes de tocar el renderizador.

Valida tambien contra models/snapshot.py despues de pasar por MotorApiClient. Si el fallo solo ocurre en una forma, corrige el adaptador o el normalizador y conserva un fixture de regresion.
```
