import type { EditorController } from "../controllers/editorController";

export class FormulaParser {
  private controller: EditorController;

  constructor(controller: EditorController) {
    this.controller = controller;
  }

  /**
   * Parsea una fórmula simple y genera el grafo en el estado.
   * Ejemplos soportados:
   * "p -> q"
   * "p AND q -> r"
   * "A OR B IMPLIES C"
   */
  public parse(formula: string): void {
    const tokens = formula.split(/\s+/).filter((t) => t.length > 0);
    if (tokens.length === 0) return;

    // Reiniciar editor para lienzo limpio
    // En lugar de reiniciar, solo añadimos al lienzo con offset

    // Identificar variables y conectivos
    const variables = new Set<string>();
    const relations: Array<{from: string, to: string, connective: string}> = [];

    let currentLhs: string[] = [];
    let currentConnective = "PROPAGATION";
    let target: string | null = null;
    let setConnective = "PROPAGATION";

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const upperToken = token.toUpperCase();

      if (upperToken === "->" || upperToken === "IMPLIES") {
        currentConnective = "PROPAGATION";
        if (i + 1 < tokens.length) {
          target = tokens[i + 1];
          variables.add(target);
          i++; // Skip target
        }
      } else if (upperToken === "<->" || upperToken === "BICONDITIONAL") {
        currentConnective = "BICONDITIONAL";
        if (i + 1 < tokens.length) {
          target = tokens[i + 1];
          variables.add(target);
          i++;
        }
      } else if (upperToken === "AND") {
        setConnective = "AND";
      } else if (upperToken === "OR") {
        setConnective = "OR";
      } else {
        // Es una variable
        currentLhs.push(token);
        variables.add(token);
      }
    }

    // Dibujar
    let startX = 100;
    let startY = 150;

    // Crear el conjunto fuente
    const sourceSetId = `set_source_${Date.now()}`;
    this.controller.crearContexto(sourceSetId, setConnective as any, startX, startY, 80, "circle", "#3b82f6");

    let varOffsetX = -30;
    for (const v of currentLhs) {
      this.controller.crearVariable(v, "N");
      this.controller.dibujarInstancia(`inst_${v}`, v, startX + varOffsetX, startY);
      varOffsetX += 60;
    }

    if (target) {
      const targetSetId = `set_target_${Date.now()}`;
      const targetX = startX + 300;
      this.controller.crearContexto(targetSetId, "PROPAGATION", targetX, startY, 80, "circle", "#22c55e");
      
      this.controller.crearVariable(target, "N");
      this.controller.dibujarInstancia(`inst_${target}`, target, targetX, startY);

      // Conectar lhs a target
      for (const v of currentLhs) {
        this.controller.conectar(
          `rel_${v}_${target}_${Date.now()}`,
          v,
          target,
          currentConnective as any,
          "#94a3b8",
          currentConnective === "BICONDITIONAL" ? "bidirectional" : "unidirectional"
        );
      }
    }
  }
}
