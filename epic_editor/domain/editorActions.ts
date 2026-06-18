/*
Creacion de todo el archivo editorActions.ts utilizando Gemini, prompt utilizado:
Con el anterior contexto de la conversacion y tomando en cuenta los cambios utilizados por el profesor,
realiza el editorActions.ts, Las acciones ahora deben operar en dos capas. Si borras un círculo visual, solo se borra 
de la capa visual. La variable en la capa logic sigue existiendo (quizás en el inventario) hasta que el usuario decida purgarla.
*/
import type { EditorState } from "./editorState";
import type {
  BelnapValue,
  MotorConnective,
  ExecutionTrace,
} from "./editorTypes";

// SOLID - SRP: estas funciones solo transforman estado de dominio. Al ser
// independientes de HTTP, validacion global y DOM, pueden probarse aisladamente.

/**
 * Crea una nueva variable lógica en el inventario con un valor de verdad Belnap inicial.
 * En EPiC, las variables son los nodos del grafo informacional que propagan evidencia.
 */
export function crearVariableLogica(
  state: EditorState,
  id: string,
  truth_value: BelnapValue = "N",
): EditorState {
  if (state.snapshot.logic.variables.some((v) => v.id === id)) return state;

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: {
        ...state.snapshot.logic,
        variables: [
          ...state.snapshot.logic.variables,
          { id, truth_value, memberships: [] },
        ],
      },
    },
  };
}

/**
 * Elimina una variable lógica del inventario y todas sus instancias visuales y relaciones asociadas.
 * Limpia tanto la capa logic como visual para mantener coherencia.
 */
export function eliminarVariableLogica(
  state: EditorState,
  id: string,
): EditorState {
  const variables = state.snapshot.logic.variables.filter((v) => v.id !== id);
  const relations = state.snapshot.logic.relations.filter(
    (r) => r.from_variable !== id && r.to_variable !== id,
  );

  const instances = { ...state.snapshot.visual.instances };
  for (const key of Object.keys(instances)) {
    if (instances[key].variable_id === id) {
      delete instances[key];
    }
  }

  const visualRelations = { ...state.snapshot.visual.relations };
  for (const r of state.snapshot.logic.relations) {
    if (
      (r.from_variable === id || r.to_variable === id) &&
      visualRelations[r.id]
    ) {
      delete visualRelations[r.id];
    }
  }

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, variables, relations },
      visual: {
        ...state.snapshot.visual,
        instances,
        relations: visualRelations,
      },
    },
  };
}

/**
 * Crea una instancia visual de una variable lógica existente en coordenadas (x,y).
 * Permite que una misma variable aparezca múltiples veces en el canvas.
 */
export function crearInstanciaVisual(
  state: EditorState,
  instance_id: string,
  variable_id: string,
  x: number,
  y: number,
): EditorState {
  if (!state.snapshot.logic.variables.some((v) => v.id === variable_id))
    return state;

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      visual: {
        ...state.snapshot.visual,
        instances: {
          ...state.snapshot.visual.instances,
          [instance_id]: { id: instance_id, variable_id, x, y },
        },
      },
    },
  };
}

/**
 * Elimina una instancia visual del canvas sin afectar la variable lógica subyacente.
 * La variable permanece en el inventario lógico.
 */
export function eliminarInstanciaVisual(
  state: EditorState,
  instance_id: string,
): EditorState {
  const instances = { ...state.snapshot.visual.instances };
  delete instances[instance_id];

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      visual: { ...state.snapshot.visual, instances },
    },
  };
}

/**
 * Crea un contexto (conjunto) con un conectivo EPiC que agrupa variables.
 * Los contextos representan operaciones lógicas (AND, OR, IMPLIES) sobre sus miembros.
 */
export function crearContexto(
  state: EditorState,
  id: string,
  connective: MotorConnective,
  x: number,
  y: number,
  radius: number = 100,
  shape: string = "ellipse",
  color?: string,
): EditorState {
  if (state.snapshot.logic.sets.some((s) => s.id === id)) return state;

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: {
        ...state.snapshot.logic,
        sets: [
          ...state.snapshot.logic.sets,
          { id, connective, subsets: [], result_alias: null },
        ],
      },
      visual: {
        ...state.snapshot.visual,
        sets: {
          ...state.snapshot.visual.sets,
          [id]: { x, y, radius, shape, color },
        },
      },
    },
  };
}

/**
 * Elimina un contexto y limpia todas las referencias a él en variables y subconjuntos.
 * Mantiene la integridad referencial del grafo lógico.
 */
export function eliminarContexto(state: EditorState, id: string): EditorState {
  let newState = state;

  // Eliminar todas las variables que pertenecen a este contexto
  const varsToDelete = newState.snapshot.logic.variables
    .filter((v) => v.memberships.includes(id))
    .map((v) => v.id);

  for (const varId of varsToDelete) {
    newState = eliminarVariableLogica(newState, varId);
  }

  // Ahora limpiar el contexto mismo
  const sets = newState.snapshot.logic.sets.filter((s) => s.id !== id);

  const setsCleaned = sets.map((s) => ({
    ...s,
    subsets: s.subsets.filter((sub) => sub !== id),
  }));

  const visualSets = { ...newState.snapshot.visual.sets };
  delete visualSets[id];

  return {
    ...newState,
    snapshot: {
      ...newState.snapshot,
      logic: { ...newState.snapshot.logic, sets: setsCleaned },
      visual: { ...newState.snapshot.visual, sets: visualSets },
    },
  };
}

/**
 * Crea una relación dirigida entre dos variables con un conectivo EPiC.
 * Las relaciones son las aristas del grafo que determinan la propagación de evidencia.
 */
export function crearRelacion(
  state: EditorState,
  id: string,
  from_variable: string,
  to_variable: string,
  connective: MotorConnective,
  color: string = "#000000",
  thickness: number = 2,
  direction: "unidirectional" | "bidirectional" = "unidirectional",
): EditorState {
  if (state.snapshot.logic.relations.some((r) => r.id === id)) return state;

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: {
        ...state.snapshot.logic,
        relations: [
          ...state.snapshot.logic.relations,
          { id, from_variable, to_variable, connective },
        ],
      },
      visual: {
        ...state.snapshot.visual,
        relations: {
          ...state.snapshot.visual.relations,
          [id]: { color, thickness, direction },
        },
      },
    },
  };
}

/**
 * Elimina una relación lógica y su representación visual del grafo.
 * Desconecta la propagación de evidencia entre las variables involucradas.
 */
export function eliminarRelacion(state: EditorState, id: string): EditorState {
  const relations = state.snapshot.logic.relations.filter((r) => r.id !== id);
  const visualRelations = { ...state.snapshot.visual.relations };
  delete visualRelations[id];

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, relations },
      visual: { ...state.snapshot.visual, relations: visualRelations },
    },
  };
}

/**
 * Asigna una variable a un contexto (conjunto), estableciendo su membresía.
 * Permite que el conectivo del contexto opere sobre la variable.
 */
export function asignarVariableAContexto(
  state: EditorState,
  variable_id: string,
  set_id: string,
): EditorState {
  const variables = state.snapshot.logic.variables.map((v) => {
    if (v.id === variable_id && !v.memberships.includes(set_id)) {
      return { ...v, memberships: [...v.memberships, set_id] };
    }
    return v;
  });

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, variables },
    },
  };
}

/**
 * Remueve una variable de un contexto sin eliminarla del inventario.
 * La variable deja de participar en la operación lógica del contexto.
 */
export function quitarVariableDeContexto(
  state: EditorState,
  variable_id: string,
  set_id: string,
): EditorState {
  const variables = state.snapshot.logic.variables.map((v) => {
    if (v.id === variable_id) {
      return { ...v, memberships: v.memberships.filter((m) => m !== set_id) };
    }
    return v;
  });

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, variables },
    },
  };
}

/**
 * Actualiza el valor de verdad Belnap (V, F, N, B) de una variable.
 * Este valor determina la evidencia inicial que la variable aporta al sistema EPiC.
 */
export function actualizarValorVerdad(
  state: EditorState,
  variable_id: string,
  truth_value: BelnapValue,
): EditorState {
  const variables = state.snapshot.logic.variables.map((v) =>
    v.id === variable_id ? { ...v, truth_value } : v,
  );

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, variables },
    },
  };
}

/**
 * Actualiza las propiedades de un contexto: conectivo, posición visual, radio y forma.
 * Modifica tanto la capa lógica (conectivo) como visual (geometría).
 */
export function actualizarContexto(
  state: EditorState,
  id: string,
  payload: { connective?: MotorConnective; x?: number; y?: number; radius?: number; shape?: string }
): EditorState {
  const sets = state.snapshot.logic.sets.map((s) =>
    s.id === id ? { ...s, connective: payload.connective ?? s.connective } : s
  );

  const visualSets = { ...state.snapshot.visual.sets };
  if (visualSets[id]) {
    visualSets[id] = {
      ...visualSets[id],
      x: payload.x ?? visualSets[id].x,
      y: payload.y ?? visualSets[id].y,
      radius: payload.radius ?? visualSets[id].radius,
      shape: payload.shape ?? visualSets[id].shape,
    };
  }

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, sets },
      visual: { ...state.snapshot.visual, sets: visualSets },
    },
  };
}

/**
 * Actualiza las propiedades de una relación: conectivo, color y grosor.
 * Modifica la semántica lógica y la apariencia visual de la arista.
 */
export function actualizarRelacion(
  state: EditorState,
  id: string,
  payload: { connective?: MotorConnective; color?: string; thickness?: number }
): EditorState {
  const relations = state.snapshot.logic.relations.map((r) =>
    r.id === id ? { ...r, connective: payload.connective ?? r.connective } : r
  );

  const visualRelations = { ...state.snapshot.visual.relations };
  if (visualRelations[id]) {
    visualRelations[id] = {
      ...visualRelations[id],
      color: payload.color ?? visualRelations[id].color,
      thickness: payload.thickness ?? visualRelations[id].thickness,
    };
  }

  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      logic: { ...state.snapshot.logic, relations },
      visual: { ...state.snapshot.visual, relations: visualRelations },
    },
  };
}

/**
 * Guarda el rastro de ejecución devuelto por el motor EPiC y cambia el modo del editor.
 * Permite visualizar paso a paso cómo se propagó la evidencia en el grafo.
 */
export function guardarResultadoEjecucion(
  state: EditorState,
  execution_trace: ExecutionTrace | undefined,
): EditorState {
  return {
    ...state,
    snapshot: {
      ...state.snapshot,
      meta: {
        ...state.snapshot.meta,
        editor_mode: execution_trace ? "ejecucion" : "edicion",
      },
      execution_trace,
    },
  };
}

/**
 * Carga un snapshot completo en el estado del editor.
 */
export function cargarSnapshot(
  state: EditorState,
  snapshot: any,
): EditorState {
  return {
    ...state,
    snapshot,
  };
}
