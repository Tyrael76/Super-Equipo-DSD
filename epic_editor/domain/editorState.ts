/*
Creacion de todo el archivo editorState.ts utilizando Gemini, prompt utilizado:
Con el anterior contexto de la conversacion y tomando en cuenta los cambios utilizados por el profesor,
realiza el editorState.ts, El estado del editor ya no será un diccionario plano.
Será un envoltorio del PlaygroundSnapshot más los metadatos de la sesión (modo edición/ejecución).
*/

import type { PlaygroundSnapshot, MotorConnective } from "./editorTypes";

// SOLID - SRP: EditorState y su fabrica concentran unicamente la inicializacion
// coherente de la sesion; las transformaciones viven en editorActions.ts.
export interface EditorState {
  snapshot: PlaygroundSnapshot;
  available_connectives: MotorConnective[];
}

/**
 * Crea el estado inicial del editor EPiC con un snapshot vacío.
 * Inicializa la capa lógica (variables, conjuntos, relaciones) y visual (instancias, formas).
 */
export function createInitialState(): EditorState {
  return {
    snapshot: {
      meta: {
        schema_version: "3.0",
        editor_mode: "edicion",
        belnap_domain: ["V", "F", "N", "B"],
        max_iterations: 100,
      },
      logic: {
        variables: [],
        sets: [],
        relations: [],
      },
      visual: {
        instances: {},
        sets: {},
        relations: {},
      },
    },
    available_connectives: [
      "AND",
      "OR",
      "IMPLIES",
      "BICONDITIONAL",
      "PROPAGATION",
      "CONTRAPOSITIONAL",
      "KJOIN",
    ],
  };
}
