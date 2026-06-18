# Prompt para reconstruir editor-bridge.js

```text
Actua como ingeniero JavaScript especializado en adaptadores entre modulos.

Reconstruye solo epic_simulador/editor-bridge.js. Lee los modulos compilados en dist, EditorController, MotorApiClient, FormulaParser, simulator.js, package.json y tsconfig.json.

Objetivo: ofrecer al Simulador una API estable para crear/editar/eliminar entidades, observar estado, validar, ejecutar y parsear formulas. El bridge no calcula Belnap, no dibuja SVG y no mantiene un segundo grafo logico.

Requisitos:
1. initializeEditorBridge guarda de forma explicita la URL activa.
2. resetEditor reutiliza esa URL y vuelve a publicar el snapshot inicial; no debe referenciar variables fuera de alcance.
3. Cada wrapper devuelve ControllerResult sin convertir errores en exito.
4. La suscripcion se instala una sola vez por controlador.
5. currentSnapshot refleja siempre el estado del controlador.
6. executeWithMotor devuelve trace y snapshot final coherentes.
7. No exportes los objetos mutables internos salvo necesidad demostrada.

SOLID: SRP como adaptador de frontera; ISP mediante una API de funciones pequenas; DIP en simulator.js, que consume el bridge en vez de conocer el controlador y el cliente HTTP. LSP se verifica entre MotorApiClient y MockMotorClient, no en el bridge.

Pruebas: inicializacion, callbacks, reset antes/despues de inicializar, errores de validacion, error de red, parseFormula y ejecucion exitosa. Ejecuta npm run build al terminar.

Si falla: reproduce el problema con una secuencia de llamadas al bridge, inspecciona currentSnapshot y corrige el ciclo de vida sin modificar el Motor.
```
