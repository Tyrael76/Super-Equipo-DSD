# Prompt para reconstruir epic_simulador/simulator.js

Usa este prompt para reconstruir el archivo principal de comportamiento del Simulador.

```text
Actua como desarrollador frontend senior especializado en JavaScript vanilla, SVG y animaciones de grafos.

Reconstruye exclusivamente epic_simulador/simulator.js. Antes de escribir codigo, inspecciona:

- epic_simulador/simulator.js
- epic_simulador/index.html
- epic_simulador/style.css
- epic_simulador/e2e-real-trace.json
- epic_simulador/editor-bridge.js
- epic_simulador/package.json
- epic_editor/domain/editorTypes.ts
- epic_motor/models/snapshot.py

Objetivo:

Implementar toda la logica de carga, normalizacion, renderizado SVG y reproduccion del PlaygroundSnapshot.

Responsabilidades:

1. Definir presets.
2. Mantener simState.
3. Cargar JSON desde archivo, textarea y presets.
4. Normalizar variables, sets, relations y actions.
5. Construir variableHistory por step.
6. Calcular coordenadas relativas de instancias dentro de conjuntos.
7. Extraer pares de cajitas.
8. Renderizar vista por cajitas.
9. Renderizar vista global.
10. Dibujar sets, bolitas y relaciones SVG.
11. Animar particulas sobre paths.
12. Avanzar paso a paso.
13. Reproducir toda la secuencia.
14. Pausar, reiniciar y retroceder.
15. Implementar sandbox temporal de Editor Interactivo si se conserva.
16. Consumir las operaciones del Editor solo mediante EditorBridge.
17. Leer `VITE_MOTOR_URL` y no fijar el endpoint en funciones internas.
18. Mantener una unica fuente de estado para el editor; no sincronizar manualmente dos grafos mutables sin una funcion de frontera probada.

Reglas:

1. No calcular Belnap.
2. No modificar el resultado logico del Motor.
3. No asumir que solo existe una instancia por variable.
4. No animar acciones de estabilizacion.
5. No usar frameworks pesados.
6. No depender de scripts externos para datos de usuario.
7. Soportar formato publico y formato Python interno.
8. Normalizar el snapshot en una funcion sin mutar la entrada del usuario, o documentar y probar la mutacion.
9. Actualizar todas las instancias DOM del mismo variable_id; evita querySelector cuando se requieren todas.
10. Si falta relation_id/origen en una accion ambigua, mostrar diagnostico o usar una regla determinista probada.

SOLID verificable:

- DIP: simulator.js consume EditorBridge y no construye EditorController ni MotorApiClient.
- SRP existe en funciones de normalizacion, historial, render y animacion, aunque el archivo siga siendo un candidato a modularizacion.
- OCP: renderers y normalizadores deben aceptar nuevos metadatos sin reescribir el flujo principal.

Movimiento correcto:

- V avanza en direccion de la flecha.
- F retrocede sobre el mismo path.
- N se oculta o queda neutra segun historia.
- B se representa como estado combinado.
- La particula debe viajar antes de re-renderizar el nuevo step.
- Al terminar, actualiza todas las instancias del variable_id afectado.
- Para F, identifica primero el origen logico correcto y luego recorre el path inverso; no basta invertir una particula dirigida al target equivocado.
- Oculta el origen solo durante la transicion y deja que el estado del siguiente step determine su visibilidad final.

Pruebas manuales:

- Preset simple.
- Preset contraposicional.
- Preset contradiccion.
- Preset ciclo.
- Cargar e2e-real-trace.json.
- Probar una variable con dos instancias en cajitas distintas.
- Probar dos relaciones que llegan al mismo target en el mismo step.
- Pegar JSON valido.
- Boton siguiente avanza un movimiento.
- Play reproduce hasta el final.

Fallos comunes:

- Usar target_id en unos lugares y variable_id en otros sin normalizar.
- Mostrar una bolita en origen y destino toda la transicion.
- Calcular resultados logicos en el frontend.
- Renderizar cajitas sin repetir el set intermedio.
```

## Prompt de correccion rapida

```text
Audita simulator.js separando funciones: normalizacion, historial, render y animacion. Corrige primero normalizacion de actions; luego movimiento; luego UI. No mezcles arreglos grandes de DOM con calculo de steps.

Si el movimiento falla, captura `accion`, `relacion elegida`, `path`, `step anterior` y `step siguiente`. Agrega un fixture minimo antes de cambiar la animacion. Ejecuta npm run build y verifica Play, Siguiente, Anterior y Reset.
```
