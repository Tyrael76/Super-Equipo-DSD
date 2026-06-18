# Prompt para implementar Feature: UI Base y Renderizado Estático SVG

Usa este prompt para la fase inicial del EPiC Simulador, donde se construye la interfaz y se dibuja el grafo por primera vez.

```text
Actúa como desarrollador frontend senior especializado en interfaces web y SVG.

Objetivo:
Construir la estructura base (HTML/CSS) de la SPA y la lógica para leer un archivo JSON (`PlaygroundSnapshot`) y renderizar estáticamente el grafo lógico en un lienzo SVG.

Responsabilidades:
1. Crear el layout principal: Sidebar para carga de JSON, y un contenedor para el canvas.
2. Leer el estado inicial del snapshot y dibujar los conjuntos (`visual.sets`) como circunferencias SVG.
3. Dibujar las variables lógicas (`visual.instances`) como pequeñas bolitas ubicadas en el perímetro de sus conjuntos.
4. Trazar líneas direccionales (`logic.relations`) entre variables.
5. Asignar colores base según el valor de verdad inicial (V=Verde, F=Rojo, N=Gris, B=Mixto).

Reglas:
1. No incrustes lógica de negocio compleja en el HTML.
2. Mantén el SVG responsive y permite un pan/zoom rudimentario si es posible.
3. Separa el estado visual del estado lógico que viene del backend.

SOLID verificable:
- SRP (Single Responsibility Principle): El HTML mantiene su responsabilidad estructural pura sin guiones en línea (inline scripts), y los estilos manejan la presentación visual (ej. colores basados en V/F) sin que CSS intente deducir reglas lógicas complejas.

Fallos comunes:
- Las bolitas no coinciden con las coordenadas relativas de las circunferencias.
- El canvas no se actualiza al cargar un nuevo JSON.
- Texto o controles de UI rompiéndose en pantallas pequeñas.
```

## Prompt de corrección rápida para Layout

```text
Revisa la generación del SVG. Asegúrate de que las coordenadas de cada instancia visual se sumen a las coordenadas absolutas del conjunto contenedor. Verifica que el layout use Flexbox/Grid correctamente para no recortar el lienzo.
```
