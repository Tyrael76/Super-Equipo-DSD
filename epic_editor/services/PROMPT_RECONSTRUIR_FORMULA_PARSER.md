# Prompt para reconstruir FormulaParser

Usa este prompt para reconstruir solo `epic_editor/services/formulaParser.ts`.

```text
Actua como ingeniero TypeScript especializado en parsers y traduccion de modelos.

Lee formulaParser.ts, editorController.ts, editorTypes.ts, EPiC.pdf y las pruebas antes de cambiar codigo.

Objetivo: convertir una formula EPiC soportada en llamadas publicas a EditorController. El parser no calcula valores, no toca DOM, no llama HTTP y no muta el snapshot directamente.

Entradas: texto de formula y un puerto pequeno con las operaciones de creacion necesarias. Salida: ParseResult con ok, diagnosticos con posicion y entidades creadas. No uses void para ocultar errores.

Implementa por etapas:
1. Tokenizador con posiciones y espacios opcionales.
2. AST para variables, negacion, AND, OR, implicacion y bicondicional.
3. Precedencia y parentesis documentados.
4. Descomposicion con variables auxiliares para conectivos compuestos.
5. Traduccion determinista a variables, sets, instances y relaciones.
6. Layout inicial separado de la semantica para poder sustituirlo.

Reglas EPiC: AND y OR no se reducen silenciosamente a varias flechas binarias; conserva la variable de resultado. La direccion informacional depende del conectivo. Mapea T del articulo a V del contrato solo en una funcion explicita.

SOLID: SRP separando tokenizar/parsear/descomponer/layout; DIP recibiendo un puerto en vez de depender de EditorController concreto; OCP mediante una tabla de handlers de nodos. No uses any.

Pruebas: formula vacia, token invalido, parentesis, precedencia, p -> q, p AND q -> r, negacion, IDs repetidos, parseo consecutivo y rollback cuando una accion del controlador falla.

Si falla: entrega primero el token y AST obtenidos para la entrada minima que reproduce el error. Corrige una etapa a la vez y no cambies el Motor ni el Simulador.
```
