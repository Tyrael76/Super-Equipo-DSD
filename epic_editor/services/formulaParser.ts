import type { EditorController } from "../controllers/editorController";

// SOLID - SRP parcial: el servicio aisla la traduccion de texto y no calcula
// Belnap ni llama al Motor. El layout y la dependencia de EditorController son
// puntos de mejora: extraer layout y recibir un puerto pequeno completaria SRP/DIP.

/**
 * Parser de fórmulas lógicas a grafos EPiC.
 * Traduce expresiones textuales (p -> q, A AND B) a variables, contextos y relaciones.
 */
export class FormulaParser {
  private controller: EditorController;
  private setCounter: number = 0;

  constructor(controller: EditorController) {
    this.controller = controller;
    this.setCounter = 0;
  }

  /**
   * Genera nombres secuenciales para contextos (A, B, C, ...).
   * Facilita identificación visual de conjuntos en el grafo.
   */
  private getNextSetName(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const name = letters[this.setCounter % letters.length];
    this.setCounter++;
    return name;
  }

  /**
   * Parsea una fórmula lógica y construye el grafo EPiC correspondiente.
   * Crea variables con valores iniciales, contextos con conectivos y relaciones dirigidas.
   * Soporta: "p -> q", "p AND q -> r", "A OR B IMPLIES C"
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

    // Crear el conjunto fuente con nombre simple
    const sourceSetId = this.getNextSetName();
    this.controller.crearContexto(sourceSetId, setConnective as any, startX, startY, 80, "circle", "#3b82f6");

    let varOffsetX = -30;
    for (const v of currentLhs) {
      // Asignar valor inicial V (verdadero) a las variables del lado izquierdo
      this.controller.crearVariable(v, "V");
      this.controller.dibujarInstancia(`inst_${v}`, v, startX + varOffsetX, startY);
      this.controller.asignarVariableAContexto?.(v, sourceSetId);
      varOffsetX += 60;
    }

    if (target) {
      const targetSetId = this.getNextSetName();
      const targetX = startX + 300;
      this.controller.crearContexto(targetSetId, "PROPAGATION", targetX, startY, 80, "circle", "#22c55e");
      
      // Asignar valor inicial N (neutro) a la variable objetivo
      this.controller.crearVariable(target, "N");
      this.controller.dibujarInstancia(`inst_${target}`, target, targetX, startY);
      this.controller.asignarVariableAContexto?.(target, targetSetId);

      // Conectar lhs a target con nombres simples
      for (const v of currentLhs) {
        this.controller.conectar(
          `rel_${v}_to_${target}`,
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
