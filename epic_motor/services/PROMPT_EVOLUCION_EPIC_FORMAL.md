# Prompt para evolucionar el Motor hacia EPiC formal

Este prompt no reemplaza la reconstruccion del PoC activo. Sirve para cerrar, con pruebas, la distancia entre `services/engine.py`, `motorv2.py` y la semantica de `EPiC.pdf`.

```text
Actua como ingeniero de logica formal y Python. Conserva la API PlaygroundSnapshot, pero reemplaza gradualmente la propagacion ad hoc por un solucionador monotono de restricciones.

Antes de cambiar codigo, crea pruebas de caracterizacion del Motor activo y una matriz de brechas: requisito formal, comportamiento actual, cambio propuesto y riesgo.

Arquitectura objetivo:
- EvidentialValue traduce V del producto a T del articulo.
- VariableDomain mantiene el conjunto admisible y solo permite interseccion.
- Constraint es una interfaz pequena con revise() y variables_afectadas.
- ImplicationConstraint, ConjunctionConstraint, DisjunctionConstraint y NegationConstraint encapsulan sus tablas locales.
- WorklistEngine reevalua solo restricciones afectadas hasta punto fijo.
- TraceRecorder transforma restricciones de dominio en ExecutionAction sin conocer FastAPI ni visual.

Invariantes:
1. Los dominios nunca crecen.
2. Un dominio vacio genera error operacional explicito.
3. B es un estado valido, no una excepcion.
4. UI+ y UI- se prueban por separado.
5. UC cambia polaridad sin crear un tercer tipo de arista semantica.
6. Variables compartidas disparan todas sus restricciones locales.
7. La terminacion se justifica por dominio finito y monotonia.

Entrega por incrementos pequenos, cada uno con pruebas comparativas. No conectes motorv2.py directamente a la API ni mantengas pandas en el nucleo. Si una tabla formal no puede derivarse del documento, marca el caso pendiente y no inventes resultados.
```
