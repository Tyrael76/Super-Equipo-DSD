/*
Creacion de todo el archivo motorApiClient.ts utilizando Gemini, prompt utilizado:
Con el anterior contexto de la conversacion y tomando en cuenta los cambios utilizados por el profesor,
realiza el motorApiClient.ts, Solo cambiaremos los tipos que entran y salen. 
Enviaremos el PlaygroundSnapshot y recibiremos el PlaygroundSnapshot + execution_trace.
le mandamos el PlaygroundSnapshot completo y exigimos que nos devuelva exactamente el mismo PlaygroundSnapshot, pero con el bloque execution_trace anexado.
El Motor puede leer el JSON, ignorar la llave visual, procesar la llave logic, y adjuntar la respuesta. Nosotros recibimos eso y lo mandamos directo al estado global.
*/
import type {
  PlaygroundSnapshot,
  MotorConnective,
} from "../domain/editorTypes";

/**
 * Error personalizado para fallos de comunicación con el motor EPiC.
 * Incluye código de estado HTTP y detalles del error.
 */
export class MotorApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly detail: string,
    public readonly raw?: unknown,
  ) {
    super(`MotorApiError [${statusCode}]: ${detail}`);
    this.name = "MotorApiError";
  }
}

// SOLID - ISP: el Editor depende de un puerto pequeno con solo las operaciones
// que necesita del Motor, no de detalles de fetch ni de FastAPI.
export interface IMotorClient {
  health(): Promise<boolean>;
  getConectivos(): Promise<MotorConnective[]>;
  calcular(snapshot: PlaygroundSnapshot): Promise<PlaygroundSnapshot>;
}

// SOLID - DIP: esta clase implementa el puerto de salida y encapsula HTTP y la
// adaptacion de contratos; el controlador solo conoce IMotorClient.

/**
 * Cliente HTTP para comunicarse con el motor EPiC.
 * Traduce entre el formato del editor (arrays) y el formato del motor (diccionarios).
 */
export class MotorApiClient implements IMotorClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Verifica si el motor EPiC está disponible y respondiendo.
   * Retorna true si el endpoint /health responde con status "ok".
   */
  async health(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return false;
      const data = await res.json();
      return data?.status === "ok";
    } catch {
      return false;
    }
  }

  /**
   * Obtiene la lista de conectivos lógicos soportados por el motor EPiC.
   * Retorna los nombres de los operadores disponibles (AND, OR, IMPLIES, etc.).
   */
  async getConectivos(): Promise<MotorConnective[]> {
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/conectivos`);
    } catch (e) {
      throw new MotorApiError(0, "No se pudo conectar con el Motor.", e);
    }

    if (!res.ok) {
      const body = await this._tryParseBody(res);
      throw new MotorApiError(
        res.status,
        body?.detail ?? "Error al obtener conectivos.",
        body,
      );
    }

    const data = await res.json();
    return Object.keys(data);
  }

  /**
   * Envía un snapshot al motor EPiC para ejecutar el razonamiento evidencial.
   * Retorna el mismo snapshot con el rastro de propagación anexado.
   */
  async calcular(snapshot: PlaygroundSnapshot): Promise<PlaygroundSnapshot> {
    // Convertir arrays a diccionarios para el motor Python
    const motorSnapshot = this._convertToMotorFormat(snapshot);
    
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/calcular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(motorSnapshot),
      });
    } catch (e) {
      throw new MotorApiError(0, "No se pudo conectar con el Motor.", e);
    }

    const body = await this._tryParseBody(res);

    if (res.status === 422) {
      throw new MotorApiError(
        422,
        `El Motor rechazó el snapshot: ${JSON.stringify(body?.detail ?? body)}`,
        body,
      );
    }

    if (res.status === 500) {
      throw new MotorApiError(
        500,
        `Error interno del Motor: ${body?.detail ?? "sin detalle"}`,
        body,
      );
    }

    if (!res.ok) {
      throw new MotorApiError(
        res.status,
        `Respuesta inesperada del Motor.`,
        body,
      );
    }

    // Convertir la respuesta del motor (diccionarios) de vuelta a arrays
    return this._convertFromMotorFormat(body, snapshot);
  }

  /**
   * Convierte el formato del Editor (arrays) al formato del Motor (diccionarios).
   * El motor Python espera variables, sets y relations como objetos indexados por id.
   */
  private _convertToMotorFormat(snapshot: PlaygroundSnapshot): any {
    const motorLogic: any = {
      variables: {},
      sets: {},
      relations: {}
    };

    // Convertir arrays a diccionarios usando el id como clave
    snapshot.logic.variables.forEach(v => {
      motorLogic.variables[v.id] = {
        id: v.id,
        value: v.truth_value || "N"
      };
    });

    snapshot.logic.sets.forEach(s => {
      motorLogic.sets[s.id] = {
        id: s.id,
        elements: s.subsets || []
      };
    });

    snapshot.logic.relations.forEach(r => {
      motorLogic.relations[r.id] = {
        id: r.id,
        source: r.from_variable,
        target: r.to_variable,
        connective: r.connective || "PROPAGATION",
        is_contrapositive: false
      };
    });

    return {
      meta: {
        max_iterations: snapshot.meta.max_iterations || 100,
        version: "1.1"
      },
      logic: motorLogic,
      visual: snapshot.visual || {},
      execution_trace: snapshot.execution_trace || null
    };
  }

  /**
   * Convierte el formato del Motor (diccionarios) de vuelta al formato del Editor (arrays).
   * Reconstruye las estructuras de arrays y normaliza el execution_trace.
   */
  private _convertFromMotorFormat(motorSnapshot: any, originalSnapshot?: PlaygroundSnapshot): PlaygroundSnapshot {
    const logic: any = {
      variables: [],
      sets: [],
      relations: []
    };

    // Convertir diccionarios a arrays
    if (motorSnapshot.logic?.variables) {
      logic.variables = Object.values(motorSnapshot.logic.variables).map((v: any) => {
        const originalVar = originalSnapshot?.logic?.variables?.find(ov => ov.id === v.id);
        return {
          id: v.id,
          truth_value: v.value || "N",
          memberships: originalVar?.memberships || []
        };
      });
    }

    if (motorSnapshot.logic?.sets) {
      logic.sets = Object.values(motorSnapshot.logic.sets).map((s: any) => {
        const originalSet = originalSnapshot?.logic?.sets?.find(os => os.id === s.id);
        return {
          id: s.id,
          connective: originalSet?.connective || "PROPAGATION",
          subsets: s.elements || originalSet?.subsets || [],
          result_alias: originalSet?.result_alias || null
        };
      });
    }

    if (motorSnapshot.logic?.relations) {
      logic.relations = Object.values(motorSnapshot.logic.relations).map((r: any) => {
        const originalRelation = originalSnapshot?.logic?.relations?.find(or => or.id === r.id);
        return {
          id: r.id,
          from_variable: r.source || originalRelation?.from_variable,
          to_variable: r.target || originalRelation?.to_variable,
          connective: r.connective || originalRelation?.connective || "PROPAGATION"
        };
      });
    }

    return {
      meta: {
        schema_version: "1.0",
        editor_mode: "ejecucion",
        belnap_domain: ["V", "F", "N", "B"],
        max_iterations: motorSnapshot.meta?.max_iterations || 100
      },
      logic,
      visual: motorSnapshot.visual || {},
      execution_trace: motorSnapshot.execution_trace
        ? {
            ...motorSnapshot.execution_trace,
            actions: (motorSnapshot.execution_trace.actions || []).map((a: any) => ({
              step: a.step,
              // Normalizar: motor usa target_id/result_value, simulador usa variable_id/new_value
              variable_id: a.variable_id ?? a.target_id,
              new_value: a.new_value ?? a.result_value,
              // Normalizar: motor usa action_type:"stabilization", simulador usa is_stabilized
              is_stabilized: a.is_stabilized ?? (a.action_type === "stabilization" || a.target_id === "*"),
              description: a.description,
              action_type: a.action_type,
            })),
          }
        : undefined,
    };
  }

  /**
   * Intenta parsear el cuerpo de una respuesta HTTP como JSON.
   * Retorna null si el parseo falla, útil para manejar errores del motor.
   */
  private async _tryParseBody(res: Response): Promise<any> {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
}

// SOLID - LSP: el mock satisface el mismo contrato asincrono que MotorApiClient,
// por lo que puede sustituirlo en el controlador y en sus pruebas contractuales.

/**
 * Cliente mock del motor EPiC para pruebas sin conexión real.
 * Simula respuestas del motor con datos configurables.
 */
export class MockMotorClient implements IMotorClient {
  private readonly config: {
    healthOk?: boolean;
    conectivos?: MotorConnective[];
    calcularResponse?: PlaygroundSnapshot | MotorApiError;
  };

  constructor(
    config: {
      healthOk?: boolean;
      conectivos?: MotorConnective[];
      calcularResponse?: PlaygroundSnapshot | MotorApiError;
    } = {},
  ) {
    this.config = {
      healthOk: true,
      conectivos: [
        "AND",
        "OR",
        "IMPLIES",
        "BICONDITIONAL",
        "PROPAGATION",
        "CONTRAPOSITIONAL",
        "KJOIN",
      ],
      ...config,
    };
  }

  /**
   * Simula verificación de salud del motor.
   * Retorna el valor configurado en el constructor.
   */
  async health(): Promise<boolean> {
    return this.config.healthOk ?? true;
  }

  /**
   * Retorna lista mock de conectivos EPiC.
   * Útil para pruebas sin conexión al motor real.
   */
  async getConectivos(): Promise<MotorConnective[]> {
    return this.config.conectivos ?? [];
  }

  /**
   * Simula ejecución del motor EPiC.
   * Retorna snapshot con execution_trace mock o lanza error configurado.
   */
  async calcular(snapshot: PlaygroundSnapshot): Promise<PlaygroundSnapshot> {
    if (this.config.calcularResponse instanceof MotorApiError) {
      throw this.config.calcularResponse;
    }
    if (this.config.calcularResponse) {
      return this.config.calcularResponse;
    }

    return {
      ...snapshot,
      execution_trace: {
        iterations: 1,
        stabilized: true,
        actions: [
          {
            step: 1,
            action_type: "stabilization",
            target_id: "*",
            result_value: "*",
            description: "Mock: sistema estabilizado simulado.",
          },
        ],
        final_logic: snapshot.logic,
      },
    };
  }
}
