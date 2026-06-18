# Prompt para reconstruir epic_simulador/style.css

Usa este prompt para reconstruir solo los estilos del Simulador.

```text
Actua como disenador frontend senior especializado en interfaces tecnicas densas y SVG.

Reconstruye exclusivamente epic_simulador/style.css. Antes de escribir codigo, inspecciona:

- epic_simulador/style.css
- epic_simulador/index.html
- epic_simulador/simulator.js

Objetivo:

Crear estilos profesionales para una herramienta de simulacion, con layout claro, controles legibles, SVG visible y animaciones suaves.

Responsabilidades:

1. Layout principal con sidebar y workspace.
2. Cards solo para paneles o items repetidos, no para secciones anidadas innecesarias.
3. Toolbar compacta.
4. Tabs claras.
5. Dropzone usable.
6. Trace log legible.
7. Vista de cajitas responsive.
8. Vista global con pan/zoom usable.
9. Estilos SVG para sets, relations, bolitas y particulas.
10. Estados por valor: V, F, N, B.
11. Estilos para editor interactivo temporal.
12. Estados de error, carga, disabled y foco visible.
13. Soporte para particulas V, F y B sin codificar reglas logicas en CSS.

Reglas:

1. Texto no debe salirse de botones o cards.
2. No usar una paleta de un solo tono.
3. Evitar decoracion innecesaria que opaque el grafo.
4. Mantener buen contraste.
5. Las circunferencias y flechas deben ser faciles de inspeccionar.
6. No depender de imagenes externas.
7. No ocultar controles en mobile.
8. Mantener dimensiones estables de toolbar, tabs, tablero y cajitas para evitar saltos durante el trace.
9. No seleccionar entidades por valor logico de forma que CSS decida su comportamiento; solo su presentacion.

SOLID verificable: SRP porque style.css presenta estados ya calculados. La separacion CSS/JS no prueba por si sola todos los principios SOLID.

Clases importantes:

- svg-set
- svg-set-label
- svg-relation-path
- svg-instance
- val-v
- val-f
- val-n
- val-b
- boxes-grid
- box-card
- global-canvas-container
- trace-item

Fallos comunes:

- Animaciones CSS que pelean con animaciones JS.
- SVG muy pequeno o recortado.
- Controles que cambian de tamano al hacer hover.
- Texto roto en pantallas pequenas.
```

## Prompt de correccion rapida

```text
Audita style.css visualmente. La prioridad es claridad del grafo y controles estables. Ajusta tamanos, contrastes y overflow antes de agregar decoracion.

Verifica capturas en escritorio y movil con presets simple, contradiccion y ciclo. Revisa que labels, flechas, particulas y paneles no se solapen.
```
