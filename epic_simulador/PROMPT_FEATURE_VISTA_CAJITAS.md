# Prompt para implementar Feature: Vista Alternativa por Cajitas

Usa este prompt cuando necesites organizar el grafo complejo en sub-grafos digeribles para propósitos didácticos.

```text
Actúa como desarrollador frontend enfocado en visualización de datos y UX.

Objetivo:
Agregar una pestaña secundaria en el simulador que rompa el grafo global (que puede ser muy enredado) en pares secuenciales de implicación lógicas, llamados "Cajitas".

Responsabilidades:
1. Analizar el `PlaygroundSnapshot` para extraer relaciones individuales.
2. Por cada relación `A -> B`, generar una vista aislada (una "cajita" o card) que contenga solo el conjunto A y el conjunto B.
3. Si existe una cadena `A -> B -> C`, generar dos cajitas: [A y B] y [B y C]. El conjunto B debe aparecer clonado en ambas cajitas.
4. Sincronizar el estado de las variables clonadas. Si la bolita `p` en la cajita 1 cambia a verde, la clon de `p` en la cajita 2 debe cambiar instantáneamente a verde.

Reglas:
1. Todas las instancias visuales de una misma variable lógica (`variable_id`) deben reflejar el mismo estado en tiempo real.
2. Usa un grid responsivo para alinear las cajitas de manera limpia.
3. El motor de animación paso a paso debe aplicarse globalmente, de modo que las partículas se animen simultáneamente en todas las cajitas correspondientes.

SOLID verificable:
- SRP: La extracción de pares de cajitas se encarga únicamente de agrupar relaciones lógicas (transformación de datos), desligándola del renderizado y manipulación del DOM real.

Fallos comunes:
- Solo se anima la primera cajita y las demás se quedan estáticas (uso de `querySelector` en vez de `querySelectorAll`).
- Se duplican eventos al intentar gestionar el estado por cada cajita.
```

## Prompt de corrección para Clonación y Sincronización

```text
Revisa el algoritmo de renderizado de las cajitas. En lugar de crear un estado visual independiente para cada cajita, asegúrate de que todas consuman la misma fuente de verdad global. Usa el atributo `data-variable-id` en el DOM para actualizar todas las réplicas con un simple `querySelectorAll('[data-variable-id="x"]')`.
```
