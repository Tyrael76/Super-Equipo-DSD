import type { EditorController } from "../controllers/editorController";
import type { MotorConnective } from "../domain/editorTypes";

// Definición de Tokens
type TokenType = 'LPAREN' | 'RPAREN' | 'AND' | 'OR' | 'IMPLIES' | 'BICONDITIONAL' | 'NOT' | 'VAR' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
}

// Nodos del AST
interface ASTNode {
  type: 'VAR' | 'AND' | 'OR' | 'IMPLIES' | 'BICONDITIONAL' | 'NOT';
  value?: string;
  left?: ASTNode;
  right?: ASTNode;
}

/**
 * Parser de fórmulas lógicas a grafos EPiC.
 * Construye un AST para manejar precedencia y paréntesis,
 * y luego genera los contextos y relaciones visuales.
 */
export class FormulaParser {
  private controller: EditorController;
  private setCounter: number = 0;
  private currentX: number = 100;
  private currentY: number = 150;

  constructor(controller: EditorController) {
    this.controller = controller;
    this.setCounter = 0;
  }

  private getNextSetName(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const name = letters[this.setCounter % letters.length];
    this.setCounter++;
    return name;
  }

  // --- LEXER ---
  private tokenize(formula: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    while (i < formula.length) {
      const char = formula[i];
      if (/\s/.test(char)) {
        i++;
        continue;
      }
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(' });
        i++;
        continue;
      }
      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')' });
        i++;
        continue;
      }
      
      // Manejar "->" o "<->"
      if (formula.startsWith('->', i)) {
        tokens.push({ type: 'IMPLIES', value: '->' });
        i += 2;
        continue;
      }
      if (formula.startsWith('<->', i)) {
        tokens.push({ type: 'BICONDITIONAL', value: '<->' });
        i += 3;
        continue;
      }

      // Identificadores o palabras clave
      let word = '';
      while (i < formula.length && /[a-zA-Z0-9_]/.test(formula[i])) {
        word += formula[i];
        i++;
      }

      if (word.length > 0) {
        const upper = word.toUpperCase();
        if (upper === 'AND') tokens.push({ type: 'AND', value: word });
        else if (upper === 'OR') tokens.push({ type: 'OR', value: word });
        else if (upper === 'IMPLIES') tokens.push({ type: 'IMPLIES', value: word });
        else if (upper === 'BICONDITIONAL') tokens.push({ type: 'BICONDITIONAL', value: word });
        else if (upper === 'NOT') tokens.push({ type: 'NOT', value: word });
        else tokens.push({ type: 'VAR', value: word });
      } else {
        // Fallback para caracteres inesperados
        i++;
      }
    }
    tokens.push({ type: 'EOF', value: '' });
    return tokens;
  }

  // --- PARSER (Recursive Descent) ---
  private parseAST(tokens: Token[]): ASTNode | null {
    let pos = 0;

    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];

    const parsePrimary = (): ASTNode => {
      const t = peek();
      if (t.type === 'LPAREN') {
        consume();
        const node = parseExpression();
        if (peek().type === 'RPAREN') {
          consume();
        }
        return node;
      }
      if (t.type === 'NOT') {
        consume();
        return { type: 'NOT', left: parsePrimary() };
      }
      if (t.type === 'VAR') {
        consume();
        return { type: 'VAR', value: t.value };
      }
      throw new Error(`Unexpected token: ${t.value}`);
    };

    const parseAnd = (): ASTNode => {
      let node = parsePrimary();
      while (peek().type === 'AND') {
        consume();
        node = { type: 'AND', left: node, right: parsePrimary() };
      }
      return node;
    };

    const parseOr = (): ASTNode => {
      let node = parseAnd();
      while (peek().type === 'OR') {
        consume();
        node = { type: 'OR', left: node, right: parseAnd() };
      }
      return node;
    };

    const parseImplication = (): ASTNode => {
      let node = parseOr();
      while (peek().type === 'IMPLIES' || peek().type === 'BICONDITIONAL') {
        const op = consume().type;
        // Implicación es asociativa por la derecha normalmente, pero lo hacemos por la izquierda por simplicidad
        node = { type: op as 'IMPLIES' | 'BICONDITIONAL', left: node, right: parseOr() };
      }
      return node;
    };

    const parseExpression = (): ASTNode => {
      return parseImplication();
    };

    if (peek().type === 'EOF') return null;
    return parseExpression();
  }

  // --- GRAPH BUILDER ---
  
  private stringifyAST(node: ASTNode): string {
    if (node.type === 'VAR') return node.value!;
    if (node.type === 'NOT') return `NOT_${this.stringifyAST(node.left!)}`;
    return `${this.stringifyAST(node.left!)}_${node.type}_${this.stringifyAST(node.right!)}`;
  }

  private flattenAST(node: ASTNode, type: 'AND' | 'OR'): ASTNode[] {
    if (node.type === type) {
      return [...this.flattenAST(node.left!, type), ...this.flattenAST(node.right!, type)];
    }
    return [node];
  }

  /**
   * Recorre el AST y construye el grafo (Topología DAG).
   * Retorna un array de variables "salida" del nodo.
   */
  private buildGraph(node: ASTNode, currentLevelX: number, initialValues: Record<string, string>): string[] {
    if (node.type === 'VAR') {
      const varName = node.value!;
      const val = (initialValues[varName] || "N") as any;
      const setId = `Set_${varName}`;

      if (!this.controller.getState().snapshot.logic.variables.some(v => v.id === varName)) {
        this.controller.crearVariable(varName, val);
        this.controller.dibujarInstancia(`inst_${varName}`, varName, currentLevelX, this.currentY);
        
        if (!this.controller.getState().snapshot.visual.sets[setId]) {
          this.controller.crearContexto(setId, "PROPAGATION", currentLevelX, this.currentY, 60, "circle", "#64748b");
          this.controller.asignarVariableAContexto(varName, setId);
        }
        this.currentY += 100;
      } else {
        this.controller.actualizarVariable(varName, { truth_value: val });
        if (!this.controller.getState().snapshot.visual.sets[setId]) {
          const inst = this.controller.getState().snapshot.visual.instances[`inst_${varName}`];
          const x = inst ? inst.x : currentLevelX;
          const y = inst ? inst.y : this.currentY;
          this.controller.crearContexto(setId, "PROPAGATION", x, y, 60, "circle", "#64748b");
          this.controller.asignarVariableAContexto(varName, setId);
        }
      }
      return [varName];
    }

    if (node.type === 'NOT') {
      return this.buildGraph(node.left!, currentLevelX, initialValues);
    }

    if (node.type === 'AND' || node.type === 'OR') {
      const flattenedNodes = this.flattenAST(node, node.type);
      const propName = flattenedNodes.map(n => this.stringifyAST(n)).join(`_${node.type}_`);
      
      const resVar = `res_${propName}`;
      const resSet = propName; // El conjunto resultado lleva el nombre de la proposición aplanada
      
      const connective: MotorConnective = node.type === 'AND' ? 'AND' : 'OR';
      const color = node.type === 'AND' ? "#3b82f6" : "#eab308";

      // Crear la variable intermedia (siempre inicializada en 'N') si no existe
      if (!this.controller.getState().snapshot.logic.variables.some(v => v.id === resVar)) {
        this.controller.crearVariable(resVar, "N");
        this.controller.dibujarInstancia(`inst_${resVar}`, resVar, currentLevelX + 150, this.currentY);
        
        this.controller.crearContexto(resSet, connective, currentLevelX + 150, this.currentY, 80, "circle", color);
        this.controller.asignarVariableAContexto(resVar, resSet);
        this.currentY += 100;
      }

      // Conectar los sub-árboles a este nodo resultado (evitando duplicados)
      flattenedNodes.forEach(childNode => {
        const childVars = this.buildGraph(childNode, currentLevelX, initialValues);
        
        childVars.forEach(cv => {
          const relations = Object.values(this.controller.getState().snapshot.logic.relations);
          const existingRel = relations.find(rel => rel.from_variable === cv && rel.to_variable === resVar && rel.connective === connective);
          
          if (!existingRel) {
            this.controller.conectar(`rel_${cv}_to_${resVar}_${Date.now()}_${Math.floor(Math.random()*1000)}`, cv, resVar, connective, "#94a3b8", "unidirectional");
          }
        });
      });

      return [resVar];
    }

    if (node.type === 'IMPLIES' || node.type === 'BICONDITIONAL') {
      const leftVars = this.buildGraph(node.left!, currentLevelX, initialValues);
      const rightVars = this.buildGraph(node.right!, currentLevelX + 300, initialValues);

      const connective: MotorConnective = node.type === 'IMPLIES' ? 'PROPAGATION' : 'BICONDITIONAL';
      const direction = node.type === 'IMPLIES' ? 'unidirectional' : 'bidirectional';

      leftVars.forEach(lv => {
        rightVars.forEach(rv => {
          const relations = Object.values(this.controller.getState().snapshot.logic.relations);
          const existingRel = relations.find(rel => rel.from_variable === lv && rel.to_variable === rv && rel.connective === connective);
          
          if (!existingRel) {
            this.controller.conectar(`rel_${lv}_to_${rv}_${Date.now()}_${Math.floor(Math.random()*1000)}`, lv, rv, connective, "#94a3b8", direction);
          }
        });
      });

      return rightVars;
    }

    return [];
  }

  public extractVariables(formula: string): string[] {
    const tokens = this.tokenize(formula);
    const vars = new Set<string>();
    tokens.forEach(t => {
      if (t.type === 'VAR') vars.add(t.value);
    });
    return Array.from(vars);
  }

  public parse(formula: string, initialValues: Record<string, string> = {}): void {
    try {
      this.currentX = 100;
      this.currentY = 150;
      this.setCounter = 0;

      const tokens = this.tokenize(formula);
      const ast = this.parseAST(tokens);
      if (ast) {
        this.buildGraph(ast, this.currentX, initialValues);
      }
    } catch (e) {
      console.error("Error parsing formula:", e);
      // Podríamos despachar un evento de error de validación aquí
    }
  }
}
