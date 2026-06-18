# Prompt para implementar Feature: Motor de Animación Paso a Paso

Usa este prompt para la segunda fase, cuando el simulador necesita dar vida al grafo leyendo el `execution_trace`.

```text
Actúa como ingeniero frontend experto en JavaScript vanilla y animaciones interactivas de DOM/SVG.

Objetivo:
Implementar el motor de reproducción que lee el arreglo `execution_trace` (entregado por el backend) y anima la propagación de valores lógicos paso a paso.

Responsabilidades:
1. Implementar controles de reproducción (Siguiente, Anterior, Play, Pausa).
2. Leer cada acción del `execution_trace` y detectar si implica propagar un valor `V` (Verdadero) o `F` (Falso).
3. Animar una partícula SVG viajando a lo largo del path de la relación (`logic.relations`).
4. Si la propagación es `V`, la partícula avanza hacia adelante (from -> to). Si es `F`, la partícula retrocede (to -> from) por contrapositiva.
5. Actualizar el estado visual de la variable de destino al completar la animación.

Reglas:
1. El frontend NO debe recalcular Belnap, solo animar lo que el trace le dicte.
2. Las animaciones deben usar requestAnimationFrame o transiciones CSS de forma que se puedan pausar.
3. En las animaciones "hacia atrás" (F), asegúrate de que el recorrido siga fielmente la curva de la flecha existente.
4. Las bolitas de estado "N" deben permanecer invisibles hasta que reciban una propagación.

SOLID verificable:
- SRP: Separar funciones puras de normalización y renderizado SVG del bucle principal de animaciones interactivas.
- OCP (Open/Closed Principle): El procesador de acciones (actions parser) debe estar abierto a nuevos metadatos de animación pero cerrado a modificaciones en caso de que el backend envíe nuevos tipos de `action_type`.

Fallos comunes:
- Bolitas fantasma que aparecen de la nada en medio de la animación.
- Valores Falso que se animan hacia adelante en lugar de en reversa.
- Ciclos infinitos de requestAnimationFrame que bloquean la página.
```

## Prompt de corrección de Movimiento

```text
Audita la función de interpolación. Asegúrate de que, al cambiar de paso, limpias las partículas en tránsito. Si la partícula viaja al conjunto incorrecto, verifica que estás filtrando la `logic.relation` correcta donde coincidan tanto el origen como el destino esperado por el trace.
```
