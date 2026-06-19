/*
Creacion de todo el archivo editorController.ts utilizando Gemini, prompt utilizado:
Con el anterior contexto de la conversacion y tomando en cuenta los cambios utilizados por el profesor,
realiza primero el editorController.ts, siendo este el cerebro del sistema:
coordina el estado, valida que no haya basura y se comunica con el Motor usando el nuevo estándar.
*/
import type {
  PlaygroundSnapshot,
  BelnapValue,
  MotorConnective,
  ValidationResult,
  ExecutionTrace,
} from "../domain/editorTypes";
import { createInitialState } from "../domain/editorState";
import type { EditorState } from "../domain/editorState";
import * as actions from "../domain/editorActions";
import { validarSnapshot } from "../validators/editorValidation";
import type { IMotorClient } from "../services/motorApiClient";

export type ControllerResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; errors: ValidationResult["errors"] };

// SOLID - SRP: el controlador orquesta acciones, validacion y ejecucion sin
// implementar sus detalles. DIP: recibe IMotorClient en vez de construir un
// cliente HTTP concreto. OCP: subscribe admite nuevas vistas sin cambiar el dominio.

/**
 * Controlador principal del editor EPiC. Coordina el estado, valida snapshots
 * y se comunica con el motor de razonamiento usando el estándar PlaygroundSnapshot.
 */
export class EditorController {
  private state: EditorState;
  private readonly motorClient: IMotorClient;
  private readonly subscribers: Array<(state: EditorState) => void> = [];

  constructor(motorClient: IMotorClient) {
    this.state = createInitialState();
    this.motorClient = motorClient;
  }

  /**
   * Suscribe un observador a cambios de estado para actualizar la UI reactivamente.
   * Retorna función para cancelar la suscripción.
   */
  subscribe(cb: (state: EditorState) => void): () => void {
    this.subscribers.push(cb);
    return () => {
      const idx = this.subscribers.indexOf(cb);
      if (idx >= 0) this.subscribers.splice(idx, 1);
    };
  }

  /**
   * Obtiene el estado actual del editor de forma inmutable.
   * Permite consultar el snapshot sin modificarlo.
   */
  getState(): Readonly<EditorState> {
    return this.state;
  }

  /**
   * Actualiza el estado interno y notifica a todos los suscriptores.
   * Método privado usado por las acciones del controlador.
   */
  private setState(newState: EditorState): void {
    this.state = newState;
    this.subscribers.forEach((cb) => cb(this.state));
  }

  /**
   * Crea una variable lógica con valor Belnap inicial.
   * Valida que no exista duplicado antes de agregarla al inventario.
   */
  crearVariable(id: string, valor: BelnapValue = "N"): ControllerResult {
    if (this.state.snapshot.logic.variables.some((v) => v.id === id)) {
      return {
        ok: false,
        errors: [
          {
            field: "logic.variables",
            message: "ID de variable duplicado.",
            severity: "error",
            entityId: id,
          },
        ],
      };
    }
    this.setState(actions.crearVariableLogica(this.state, id, valor));
    return { ok: true, data: undefined };
  }

  /**
   * Elimina una variable del inventario lógico y todas sus representaciones visuales.
   * Limpia relaciones y contextos asociados.
   */
  eliminarVariable(id: string): ControllerResult {
    this.setState(actions.eliminarVariableLogica(this.state, id));
    return { ok: true, data: undefined };
  }

  /**
   * Asigna una variable a un contexto para que participe en su operación lógica.
   * Establece la membresía en la capa lógica.
   */
  asignarVariableAContexto(variable_id: string, set_id: string): ControllerResult {
    this.setState(actions.asignarVariableAContexto(this.state, variable_id, set_id));
    return { ok: true, data: undefined };
  }

  /**
   * Crea una instancia visual de una variable en coordenadas específicas del canvas.
   * Valida que no exista duplicado de instancia.
   */
  dibujarInstancia(
    instance_id: string,
    variable_id: string,
    x: number,
    y: number,
  ): ControllerResult {
    if (this.state.snapshot.visual.instances[instance_id]) {
      return {
        ok: false,
        errors: [
          {
            field: "visual.instances",
            message: "ID de instancia duplicado.",
            severity: "error",
            entityId: instance_id,
          },
        ],
      };
    }
    this.setState(
      actions.crearInstanciaVisual(this.state, instance_id, variable_id, x, y),
    );
    return { ok: true, data: undefined };
  }

  /**
   * Elimina una instancia visual sin afectar la variable lógica subyacente.
   * La variable permanece en el inventario.
   */
  eliminarInstancia(instance_id: string): ControllerResult {
    this.setState(actions.eliminarInstanciaVisual(this.state, instance_id));
    return { ok: true, data: undefined };
  }

  /**
   * Actualiza la posición de una instancia visual existente.
   */
  actualizarInstanciaVisual(
    instance_id: string,
    payload: { x?: number; y?: number }
  ): ControllerResult {
    this.setState(actions.actualizarInstanciaVisual(this.state, instance_id, payload));
    return { ok: true, data: undefined };
  }

  /**
   * Crea un contexto (conjunto) con un conectivo EPiC que agrupa variables.
   * Define la operación lógica que se aplicará sobre sus miembros.
   */
  crearContexto(
    id: string,
    connective: MotorConnective,
    x: number,
    y: number,
    radius: number = 65,
    shape: string = "circle",
    color?: string,
  ): ControllerResult {
    this.setState(actions.crearContexto(this.state, id, connective, x, y, radius, shape, color));
    return { ok: true, data: undefined };
  }

  /**
   * Elimina un contexto y limpia todas las referencias en variables y subconjuntos.
   * Mantiene la integridad del grafo lógico.
   */
  eliminarContexto(id: string): ControllerResult {
    this.setState(actions.eliminarContexto(this.state, id));
    return { ok: true, data: undefined };
  }

  /**
   * Crea una relación dirigida entre dos variables con un conectivo EPiC.
   * Define cómo se propaga la evidencia entre nodos del grafo.
   */
  conectar(
    id: string,
    from: string,
    to: string,
    connective: MotorConnective,
    color?: string,
    direction?: "unidirectional" | "bidirectional",
  ): ControllerResult {
    this.setState(actions.crearRelacion(this.state, id, from, to, connective, color, 2, direction));
    return { ok: true, data: undefined };
  }

  /**
   * Elimina una relación lógica del grafo.
   * Desconecta la propagación de evidencia entre las variables.
   */
  eliminarRelacion(id: string): ControllerResult {
    this.setState(actions.eliminarRelacion(this.state, id));
    return { ok: true, data: undefined };
  }

  /**
   * Actualiza propiedades de un contexto: conectivo, posición, radio y forma.
   * Modifica tanto la semántica lógica como la representación visual.
   */
  actualizarContexto(
    id: string,
    payload: { connective?: MotorConnective; x?: number; y?: number; radius?: number; shape?: string }
  ): ControllerResult {
    this.setState(actions.actualizarContexto(this.state, id, payload));
    return { ok: true, data: undefined };
  }

  /**
   * Actualiza el valor de verdad y/o membresía de una variable.
   * Permite cambiar la evidencia inicial y reasignar contextos.
   */
  actualizarVariable(
    id: string,
    payload: { truth_value?: BelnapValue; set_id?: string }
  ): ControllerResult {
    let newState = this.state;
    if (payload.truth_value) {
      newState = actions.actualizarValorVerdad(newState, id, payload.truth_value);
    }
    if (payload.set_id !== undefined) {
      const currentVar = newState.snapshot.logic.variables.find((v) => v.id === id);
      if (currentVar) {
        currentVar.memberships.forEach((m) => {
          newState = actions.quitarVariableDeContexto(newState, id, m);
        });
        if (payload.set_id !== "") {
          newState = actions.asignarVariableAContexto(newState, id, payload.set_id);
        }
      }
    }
    this.setState(newState);
    return { ok: true, data: undefined };
  }

  /**
   * Actualiza propiedades de una relación: conectivo, color y grosor.
   * Modifica la semántica y apariencia de la arista.
   */
  actualizarRelacion(
    id: string,
    payload: { connective?: MotorConnective; color?: string; thickness?: number }
  ): ControllerResult {
    this.setState(actions.actualizarRelacion(this.state, id, payload));
    return { ok: true, data: undefined };
  }

  /**
   * Carga los conectivos disponibles desde el motor EPiC.
   * Actualiza la lista de operadores lógicos que el usuario puede usar.
   */
  async cargarConectivos(): Promise<void> {
    try {
      const conectivos = await this.motorClient.getConectivos();
      this.setState({ ...this.state, available_connectives: conectivos });
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Valida el snapshot actual antes de enviarlo al motor.
   * Verifica integridad referencial entre capas lógica y visual.
   */
  validar(): ValidationResult {
    return validarSnapshot(
      this.state.snapshot,
      this.state.available_connectives,
    );
  }

  /**
   * Ejecuta el razonamiento EPiC enviando el snapshot al motor.
   * Retorna el rastro de propagación de evidencia paso a paso.
   */
  async ejecutar(): Promise<ControllerResult<ExecutionTrace>> {
    const validation = this.validar();
    if (!validation.valid) {
      return { ok: false, errors: validation.errors };
    }

    try {
      const resultSnapshot = await this.motorClient.calcular(
        this.state.snapshot,
      );

      this.setState(
        actions.guardarResultadoEjecucion(
          this.state,
          resultSnapshot.execution_trace,
        ),
      );

      if (!resultSnapshot.execution_trace) {
        return {
          ok: false,
          errors: [
            {
              field: "motor",
              message: "El motor no devolvió un rastro de ejecución.",
              severity: "error",
            },
          ],
        };
      }

      return { ok: true, data: resultSnapshot.execution_trace };
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error de red con el Motor.";
      return {
        ok: false,
        errors: [{ field: "motor", message: msg, severity: "error" }],
      };
    }
  }

  /**
   * Regresa del modo ejecución al modo edición.
   * Limpia el rastro de ejecución para permitir nuevas modificaciones.
   */
  regresarAEdicion(): void {
    this.setState(actions.guardarResultadoEjecucion(this.state, undefined));
  }

  /**
   * Carga un snapshot completo desde un JSON externo.
   */
  cargarSnapshot(snapshot: PlaygroundSnapshot): ControllerResult {
    this.setState(actions.cargarSnapshot(this.state, snapshot));
    return { ok: true, data: undefined };
  }
}
