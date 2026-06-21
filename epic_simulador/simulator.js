// EPiC Playground Simulator & Visualizer Core Logic

// ==========================================
// 0. Imports del Editor Bridge
// 📌 [PROMPT_FEATURE_INTEGRACION_BACKEND.md]
// ==========================================
// SOLID - DIP: el runtime visual depende de la API estable del bridge y no
// construye EditorController ni MotorApiClient directamente.
import * as EditorBridge from "./editor-bridge.js";

// ==========================================
// 1. Preset Simulation Examples (JSON snapshots)
// ==========================================
const PRESETS = {
  simple: {
    meta: {
      version: "3.0",
      max_iterations: 10,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "p", truth_value: "V", memberships: ["set_A"] },
        { id: "q", truth_value: "N", memberships: ["set_B"] },
      ],
      sets: [
        {
          id: "set_A",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
        {
          id: "set_B",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
      ],
      relations: [
        {
          id: "rel1",
          from_variable: "p",
          to_variable: "q",
          connective: "PROPAGATION",
        },
      ],
    },
    visual: {
      sets: {
        set_A: { x: 150, y: 200, radius: 80, shape: "circle" },
        set_B: { x: 450, y: 200, radius: 80, shape: "circle" },
      },
      instances: {
        inst_p: { id: "inst_p", variable_id: "p", x: 150, y: 200 },
        inst_q: { id: "inst_q", variable_id: "q", x: 450, y: 200 },
      },
      relations: {
        rel1: { color: "#3B82F6", thickness: 2 },
      },
    },
    execution_trace: {
      total_iterations: 2,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "q",
          old_value: "N",
          new_value: "V",
          description:
            "La variable 'q' cambió de N a V vía PROPAGATION desde 'p'",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "El sistema se estabilizó en la iteración 2.",
          is_stabilized: true,
        },
      ],
    },
  },

  contrapositive: {
    meta: {
      version: "3.0",
      max_iterations: 10,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "p", truth_value: "N", memberships: ["set_A"] },
        { id: "q", truth_value: "F", memberships: ["set_B"] },
      ],
      sets: [
        {
          id: "set_A",
          connective: "CONTRAPOSITIONAL",
          subsets: [],
          result_alias: null,
        },
        {
          id: "set_B",
          connective: "CONTRAPOSITIONAL",
          subsets: [],
          result_alias: null,
        },
      ],
      relations: [
        {
          id: "rel1",
          from_variable: "p",
          to_variable: "q",
          connective: "CONTRAPOSITIONAL",
        },
      ],
    },
    visual: {
      sets: {
        set_A: { x: 150, y: 200, radius: 80, shape: "circle" },
        set_B: { x: 450, y: 200, radius: 80, shape: "circle" },
      },
      instances: {
        inst_p: { id: "inst_p", variable_id: "p", x: 150, y: 200 },
        inst_q: { id: "inst_q", variable_id: "q", x: 450, y: 200 },
      },
      relations: {
        rel1: { color: "#EC4899", thickness: 2 },
      },
    },
    execution_trace: {
      total_iterations: 2,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "p",
          old_value: "N",
          new_value: "F",
          description:
            "La variable 'p' cambió de N a F vía CONTRAPOSITIONAL (Modus Tollens) desde 'q'",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "El sistema se estabilizó en la iteración 2.",
          is_stabilized: true,
        },
      ],
    },
  },

  socratic_justification: {
    meta: {
      version: "3.0",
      max_iterations: 2,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "H(s)", truth_value: "V", memberships: ["set_H"] },
        { id: "M(s)", truth_value: "N", memberships: ["set_M"] },
      ],
      sets: [
        { id: "set_H", connective: "PROPAGATION", subsets: [] },
        { id: "set_M", connective: "PROPAGATION", subsets: [] },
      ],
      relations: [
        { id: "rel_socratic", from_variable: "H(s)", to_variable: "M(s)", connective: "PROPAGATION" },
      ],
    },
    visual: {
      sets: {
        set_H: { x: 300, y: 250, radius: 80, shape: "circle" },
        set_M: { x: 700, y: 250, radius: 80, shape: "circle" },
      },
      instances: {
        inst_H: { id: "inst_H", variable_id: "H(s)", x: 300, y: 250 },
        inst_M: { id: "inst_M", variable_id: "M(s)", x: 700, y: 250 },
      },
      relations: {
        rel_socratic: { color: "#10B981", thickness: 3 },
      },
    },
    execution_trace: {
      total_iterations: 2,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "M(s)",
          old_value: "N",
          new_value: "V",
          description: "La premisa H(s) propaga evidencia positiva hacia M(s).",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "Justificación consistente.",
          is_stabilized: true,
        },
      ],
    },
  },

  socratic_instability: {
    meta: {
      version: "3.0",
      max_iterations: 2,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "H(s)", truth_value: "V", memberships: ["set_H"] },
        { id: "M(s)", truth_value: "F", memberships: ["set_M"] },
      ],
      sets: [
        { id: "set_H", connective: "PROPAGATION", subsets: [] },
        { id: "set_M", connective: "PROPAGATION", subsets: [] },
      ],
      relations: [
        { id: "rel_socratic", from_variable: "H(s)", to_variable: "M(s)", connective: "PROPAGATION" },
      ],
    },
    visual: {
      sets: {
        set_H: { x: 300, y: 250, radius: 80, shape: "circle" },
        set_M: { x: 700, y: 250, radius: 80, shape: "circle" },
      },
      instances: {
        inst_H: { id: "inst_H", variable_id: "H(s)", x: 300, y: 250 },
        inst_M: { id: "inst_M", variable_id: "M(s)", x: 700, y: 250 },
      },
      relations: {
        rel_socratic: { color: "#10B981", thickness: 3 },
      },
    },
    execution_trace: {
      total_iterations: 2,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "H(s)",
          old_value: "V",
          new_value: "B",
          description: "Asumir evidencia negativa en M(s) propaga F hacia atrás (Modus Tollens), causando colisión con V y resultando en estado inconsistente (Ambos) en H(s).",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "Inestabilidad alcanzada.",
          is_stabilized: true,
        },
      ],
    },
  },

  contradiction: {
    meta: {
      version: "3.0",
      max_iterations: 10,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "p1", truth_value: "V", memberships: ["set_A"] },
        { id: "p2", truth_value: "F", memberships: ["set_B"] },
        { id: "q", truth_value: "N", memberships: ["set_C"] },
      ],
      sets: [
        {
          id: "set_A",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
        {
          id: "set_B",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
        {
          id: "set_C",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
      ],
      relations: [
        {
          id: "rel1",
          from_variable: "p1",
          to_variable: "q",
          connective: "PROPAGATION",
        },
        {
          id: "rel2",
          from_variable: "p2",
          to_variable: "q",
          connective: "PROPAGATION",
        },
      ],
    },
    visual: {
      sets: {
        set_A: { x: 150, y: 110, radius: 70, shape: "circle" },
        set_B: { x: 150, y: 290, radius: 70, shape: "circle" },
        set_C: { x: 450, y: 200, radius: 85, shape: "circle" },
      },
      instances: {
        inst_p1: { id: "inst_p1", variable_id: "p1", x: 150, y: 110 },
        inst_p2: { id: "inst_p2", variable_id: "p2", x: 150, y: 290 },
        inst_q: { id: "inst_q", variable_id: "q", x: 450, y: 200 },
      },
      relations: {
        rel1: { color: "#3B82F6", thickness: 2 },
        rel2: { color: "#EF4444", thickness: 2 },
      },
    },
    execution_trace: {
      total_iterations: 2,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "q",
          old_value: "N",
          new_value: "B",
          description:
            "La variable 'q' cambió de N a B (Contradicción/Ambos) al recibir evidencia V y F",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "El sistema se estabilizó en la iteración 2.",
          is_stabilized: true,
        },
      ],
    },
  },

  loop: {
    meta: {
      version: "3.0",
      max_iterations: 15,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "p", truth_value: "V", memberships: ["set_A"] },
        { id: "q", truth_value: "N", memberships: ["set_B"] },
        { id: "r", truth_value: "N", memberships: ["set_C"] },
      ],
      sets: [
        {
          id: "set_A",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
        {
          id: "set_B",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
        {
          id: "set_C",
          connective: "PROPAGATION",
          subsets: [],
          result_alias: null,
        },
      ],
      relations: [
        {
          id: "rel1",
          from_variable: "p",
          to_variable: "q",
          connective: "PROPAGATION",
        },
        {
          id: "rel2",
          from_variable: "q",
          to_variable: "r",
          connective: "PROPAGATION",
        },
        {
          id: "rel3",
          from_variable: "r",
          to_variable: "p",
          connective: "PROPAGATION",
        },
      ],
    },
    visual: {
      sets: {
        set_A: { x: 150, y: 150, radius: 70, shape: "circle" },
        set_B: { x: 450, y: 150, radius: 70, shape: "circle" },
        set_C: { x: 300, y: 340, radius: 70, shape: "circle" },
      },
      instances: {
        inst_p: { id: "inst_p", variable_id: "p", x: 150, y: 150 },
        inst_q: { id: "inst_q", variable_id: "q", x: 450, y: 150 },
        inst_r: { id: "inst_r", variable_id: "r", x: 300, y: 340 },
      },
      relations: {
        rel1: { color: "#3B82F6", thickness: 2 },
        rel2: { color: "#3B82F6", thickness: 2 },
        rel3: { color: "#3B82F6", thickness: 2 },
      },
    },
    execution_trace: {
      total_iterations: 4,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "q",
          old_value: "N",
          new_value: "V",
          description: "La variable 'q' se propaga a V desde 'p'",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "r",
          old_value: "N",
          new_value: "V",
          description: "La variable 'r' se propaga a V desde 'q'",
          is_stabilized: false,
        },
        {
          step: 3,
          variable_id: "p",
          old_value: "V",
          new_value: "V",
          description: "La variable 'p' recibe V desde 'r' (Refuerzo)",
          is_stabilized: false,
        },
        {
          step: 4,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "El sistema se estabilizó.",
          is_stabilized: true,
        },
      ],
    },
  },

  deduction: {
    meta: {
      version: "3.0",
      max_iterations: 1,
      belnap_domain: ["V", "F", "N", "B"],
      editor_mode: "ejecucion",
    },
    logic: {
      variables: [
        { id: "¬C(a) ∧ ¬A(a)", truth_value: "V", memberships: ["set_3"] },
        { id: "¬C(a)", truth_value: "N", memberships: ["set_4"] },
        { id: "¬A(a)", truth_value: "N", memberships: ["set_5"] },
        { id: "A(a)", truth_value: "F", memberships: ["set_6"] },
        { id: "B(a)", truth_value: "F", memberships: ["set_7"] },
        { id: "¬B(a)", truth_value: "N", memberships: ["set_8"] },
        { id: "¬C(a) ∧ ¬B(a)", truth_value: "V", memberships: ["set_9"] },
      ],
      sets: [
        { id: "set_3", connective: "PROPAGATION", subsets: [] },
        { id: "set_4", connective: "PROPAGATION", subsets: [] },
        { id: "set_5", connective: "PROPAGATION", subsets: [] },
        { id: "set_6", connective: "PROPAGATION", subsets: [] },
        { id: "set_7", connective: "PROPAGATION", subsets: [] },
        { id: "set_8", connective: "PROPAGATION", subsets: [] },
        { id: "set_9", connective: "PROPAGATION", subsets: [] },
      ],
      relations: [
        { id: "rel_3_4", from_variable: "¬C(a) ∧ ¬A(a)", to_variable: "¬C(a)", connective: "PROPAGATION" },
        { id: "rel_3_5", from_variable: "¬C(a) ∧ ¬A(a)", to_variable: "¬A(a)", connective: "PROPAGATION" },
        { id: "rel_6_5", from_variable: "A(a)", to_variable: "¬A(a)", connective: "CONTRAPOSITIONAL" },
        { id: "rel_7_6", from_variable: "B(a)", to_variable: "A(a)", connective: "PROPAGATION" },
        { id: "rel_7_8", from_variable: "B(a)", to_variable: "¬B(a)", connective: "CONTRAPOSITIONAL" },
        { id: "rel_9_4", from_variable: "¬C(a) ∧ ¬B(a)", to_variable: "¬C(a)", connective: "PROPAGATION" },
        { id: "rel_9_8", from_variable: "¬C(a) ∧ ¬B(a)", to_variable: "¬B(a)", connective: "PROPAGATION" },
        { id: "rel_5_8", from_variable: "¬A(a)", to_variable: "¬B(a)", connective: "PROPAGATION" },
      ],
    },
    visual: {
      sets: {
        set_3: { x: 200, y: 150, radius: 95, shape: "circle" },
        set_4: { x: 500, y: 150, radius: 65, shape: "circle" },
        set_9: { x: 800, y: 150, radius: 95, shape: "circle" },
        set_5: { x: 200, y: 400, radius: 65, shape: "circle" },
        set_6: { x: 400, y: 400, radius: 65, shape: "circle" },
        set_7: { x: 600, y: 400, radius: 65, shape: "circle" },
        set_8: { x: 800, y: 400, radius: 65, shape: "circle" },
      },
      instances: {
        inst_v3: { id: "inst_v3", variable_id: "¬C(a) ∧ ¬A(a)", x: 200, y: 150 },
        inst_v4: { id: "inst_v4", variable_id: "¬C(a)", x: 500, y: 150 },
        inst_v9: { id: "inst_v9", variable_id: "¬C(a) ∧ ¬B(a)", x: 800, y: 150 },
        inst_v5: { id: "inst_v5", variable_id: "¬A(a)", x: 200, y: 400 },
        inst_v6: { id: "inst_v6", variable_id: "A(a)", x: 400, y: 400 },
        inst_v7: { id: "inst_v7", variable_id: "B(a)", x: 600, y: 400 },
        inst_v8: { id: "inst_v8", variable_id: "¬B(a)", x: 800, y: 400 },
      },
      relations: {
        rel_3_4: { color: "#10B981", thickness: 2 },
        rel_3_5: { color: "#10B981", thickness: 2 },
        rel_6_5: { color: "#10B981", thickness: 2 },
        rel_7_6: { color: "#10B981", thickness: 2 },
        rel_7_8: { color: "#10B981", thickness: 2 },
        rel_9_4: { color: "#10B981", thickness: 2 },
        rel_9_8: { color: "#10B981", thickness: 2 },
        rel_5_8: { color: "#10B981", thickness: 2, curved: true, curveOffset: 120 },
      },
    },
    execution_trace: {
      total_iterations: 2,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "¬C(a)",
          old_value: "N",
          new_value: "V",
          description: "La variable '¬C(a)' se propaga a V",
          is_stabilized: false,
        },
        {
          step: 1,
          variable_id: "¬A(a)",
          old_value: "N",
          new_value: "V",
          description: "La variable '¬A(a)' se propaga a V",
          is_stabilized: false,
        },
        {
          step: 1,
          variable_id: "¬B(a)",
          old_value: "N",
          new_value: "V",
          description: "La variable '¬B(a)' se propaga a V",
          is_stabilized: false,
        },
        {
          step: 2,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description: "El sistema se estabilizó.",
          is_stabilized: true,
        },
      ],
    },
  },
};

// ==========================================
// 2. Global State Variables
// ==========================================
let simState = {
  snapshot: null,
  currentStep: 0,
  maxStep: 0,
  isPlaying: false,
  playInterval: null,
  animationTimeout: null,
  speed: 800,
  activeTab: "box-view",
  variableHistory: {},
  boxPairs: [],
  relativeCoordinates: {},
};

// State for custom visual designer built in-browser
let editorGraph = {
  sets: {},
  instances: {},
  relations: {},
  logic: {
    variables: [],
    sets: [],
    relations: [],
  },
};



// ==========================================
// 3. Initialization
// ==========================================
async function applyChangeAndExecute() {
  if (!window.EditorBridge || !window.EditorBridge.isInitialized()) return;
  try {
    const res = await window.EditorBridge.executeWithMotor();
    if (res && res.ok) {
      loadSnapshot(res.snapshot);
    } else {
      loadSnapshot(window.EditorBridge.getCurrentSnapshot());
    }
  } catch (e) {
    loadSnapshot(window.EditorBridge.getCurrentSnapshot());
  }
}
document.addEventListener("DOMContentLoaded", async () => {
  lucide.createIcons();
  // Inicializar el Editor Bridge
  console.log("[Simulator] Inicializando Editor Bridge...");
  const motorUrl = import.meta.env.VITE_MOTOR_URL ?? "http://localhost:8000";
  EditorBridge.initializeEditorBridge(motorUrl);

  // Registrar callback para actualizar la vista cuando cambie el estado del editor
  EditorBridge.onStateChange((snapshot) => {
    console.log(
      "[Simulator] Estado del editor actualizado, renderizando preview...",
    );
    const oldSets = editorGraph.sets;
    const oldInstances = editorGraph.instances;

    editorGraph.logic = JSON.parse(JSON.stringify(snapshot.logic));
    editorGraph.sets = JSON.parse(JSON.stringify(snapshot.visual.sets));
    editorGraph.instances = JSON.parse(JSON.stringify(snapshot.visual.instances));
    editorGraph.relations = JSON.parse(JSON.stringify(snapshot.visual.relations));
    
    // Preserve dragged positions
    Object.keys(editorGraph.sets).forEach(setId => {
      if (oldSets[setId] && oldSets[setId].editor_x !== undefined) {
        editorGraph.sets[setId].editor_x = oldSets[setId].editor_x;
        editorGraph.sets[setId].editor_y = oldSets[setId].editor_y;
      }
    });
    Object.keys(editorGraph.instances).forEach(instId => {
      if (oldInstances[instId] && oldInstances[instId].editor_x !== undefined) {
        editorGraph.instances[instId].editor_x = oldInstances[instId].editor_x;
        editorGraph.instances[instId].editor_y = oldInstances[instId].editor_y;
      }
    });

    
    
    
    // Auto-save to localStorage
    localStorage.setItem("epicEditorSnapshot", JSON.stringify(snapshot));
  });

  // Registrar callback para manejar errores
  EditorBridge.onError((errors) => {
    console.error("[Simulator] Errores del editor:", errors);
    console.error('Editor error:', errors);
  });

  setupEventListeners();
  
  
  const savedSnapshot = localStorage.getItem("epicEditorSnapshot");
  if (savedSnapshot) {
    try {
      const parsed = JSON.parse(savedSnapshot);
      loadSnapshot(parsed);
      console.log("[Simulator] Snapshot recuperado de localStorage");
    } catch (e) {
      console.error("[Simulator] Error al parsear snapshot guardado:", e);
      loadSnapshot(PRESETS.simple);
    }
  } else {
    loadSnapshot(PRESETS.simple);
  }

  
// Expose objects for popup editor
window.EditorBridge = EditorBridge;
window.editorGraph = editorGraph;
window.loadSnapshot = loadSnapshot;

  console.log("[Simulator] Inicialización completa");
});

// ==========================================
// 4. File and JSON Upload handlers
// 📌 [PROMPT_FEATURE_UI_Y_RENDERIZADO_ESTATICO.md]
// ==========================================
/**
 * Configura todos los event listeners del simulador EPiC.
 * Maneja drag & drop, controles de reproducción, zoom/pan y tabs de visualización.
 */
function setupEventListeners() {

  document.getElementById("btnOpenEditorWindow")?.addEventListener("click", () => {
    window.open('editor.html', 'EPiCEditor', 'width=1200,height=800');
  });
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const btnPaste = document.getElementById("btnPaste");
  const jsonTextArea = document.getElementById("jsonTextArea");

  const btnDownloadJson = document.getElementById("btnDownloadJson");
  if (btnDownloadJson) {
    btnDownloadJson.addEventListener("click", () => {
      if (!simState.snapshot) return;
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(simState.snapshot, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "epic_simulator_snapshot.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }



  const btnCanvasAdd = document.getElementById("btnCanvasAdd");
  if (btnCanvasAdd) {
    btnCanvasAdd.addEventListener("click", async () => {
      const type = prompt("¿Qué deseas añadir? (Ingresa 'C' para Conjunto o 'V' para Variable)");
      if (!type) return;
      if (type.toUpperCase() === 'C') {
        const id = prompt("Ingresa el ID del Conjunto (ej: set_A):");
        if (id && window.EditorBridge && window.EditorBridge.isInitialized()) {
          window.EditorBridge.createSet(id, "AND", 400, 300, 65);
          await applyChangeAndExecute();
        }
      } else if (type.toUpperCase() === 'V') {
        const id = prompt("Ingresa el ID de la Variable (ej: p):");
        if (id && window.EditorBridge && window.EditorBridge.isInitialized()) {
          let val = prompt("Ingresa el valor de verdad (V, F, N, B):", "N");
          if (!val) val = "N";
          val = val.toUpperCase();
          if (!["V", "F", "N", "B"].includes(val)) val = "N";
          window.EditorBridge.createVariable(id, val);
          window.EditorBridge.createVariableInstance(`inst_${id}_1`, id, 400, 300);
          
          if (simState.snapshot && simState.snapshot.visual && simState.snapshot.visual.sets) {
            const sets = Object.keys(simState.snapshot.visual.sets);
            if (sets.length > 0) {
              const setChoice = prompt(`¿Deseas asignar la variable a un conjunto existente?\nConjuntos disponibles: ${sets.join(", ")}\n\n(Escribe el ID del conjunto, o deja vacío para no asignarla)`);
              if (setChoice && sets.includes(setChoice)) {
                window.EditorBridge.assignVariableToSet(id, setChoice);
              } else if (setChoice) {
                alert(`El conjunto "${setChoice}" no existe. La variable se creó sin conjunto asignado.`);
              }
            }
          }
          
          await applyChangeAndExecute();
        }
      } else {
        alert("Opción no válida.");
      }
    });
  }

  const btnCanvasAddRelation = document.getElementById("btnCanvasAddRelation");
  if (btnCanvasAddRelation) {
    btnCanvasAddRelation.addEventListener("click", async () => {
      const vars = simState.snapshot?.logic?.variables?.map(v => v.id) || [];
      if (vars.length < 2) {
        alert("Necesitas al menos 2 variables creadas para hacer una relación.");
        return;
      }
      const varsStr = vars.join(", ");
      
      const id = prompt("Ingresa un ID único para la operación/relación (ej: rel_1):");
      if (!id) return;
      
      const fromVar = prompt(`Ingresa el ID de la variable de origen (from)\nDisponibles: ${varsStr}`);
      if (!fromVar || !vars.includes(fromVar)) {
        if (fromVar) alert(`La variable "${fromVar}" no existe.`);
        return;
      }
      
      const toVar = prompt(`Ingresa el ID de la variable destino (to)\nDisponibles: ${varsStr}`);
      if (!toVar || !vars.includes(toVar)) {
        if (toVar) alert(`La variable "${toVar}" no existe.`);
        return;
      }
      
      const connective = prompt("Ingresa la operación lógica (ej: IMPLIES, AND, OR, XOR):", "IMPLIES");
      if (!connective) return;

      if (window.EditorBridge && window.EditorBridge.isInitialized()) {
        window.EditorBridge.createRelation(id, fromVar, toVar, connective.toUpperCase());
        await applyChangeAndExecute();
      }
    });
  }

  const btnCanvasRemove = document.getElementById("btnCanvasRemove");
  if (btnCanvasRemove) {
    btnCanvasRemove.addEventListener("click", async () => {
      const type = prompt("¿Qué deseas eliminar? (Ingresa 'C' para Conjunto o 'V' para Variable)");
      if (!type) return;
      if (type.toUpperCase() === 'C') {
        const id = prompt("Ingresa el ID del Conjunto a eliminar:");
        if (id && window.EditorBridge && window.EditorBridge.isInitialized()) {
          window.EditorBridge.deleteSet(id);
          await applyChangeAndExecute();
        }
      } else if (type.toUpperCase() === 'V') {
        const id = prompt("Ingresa el ID de la Variable a eliminar:");
        if (id && window.EditorBridge && window.EditorBridge.isInitialized()) {
          window.EditorBridge.deleteVariable(id);
          await applyChangeAndExecute();
        }
      } else {
        alert("Opción no válida.");
      }
    });
  }

  dropZone.addEventListener("click", () => fileInput.click());
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () =>
    dropZone.classList.remove("dragover"),
  );
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  btnPaste.addEventListener("click", async () => {
    try {
      const parsed = JSON.parse(jsonTextArea.value);
      loadSnapshot(parsed);
      await applyChangeAndExecute();
    } catch (err) {
      alert("JSON inválido: " + err.message);
    }
  });

  const presetsModal = document.getElementById("presetsModal");
  const btnOpenPresets = document.getElementById("btnOpenPresets");
  const btnClosePresets = document.getElementById("btnClosePresets");

  if (btnOpenPresets && presetsModal) {
    btnOpenPresets.addEventListener("click", () => {
      presetsModal.style.display = "flex";
    });
  }

  if (btnClosePresets && presetsModal) {
    btnClosePresets.addEventListener("click", () => {
      presetsModal.style.display = "none";
    });
  }

  // Close modal when clicking outside
  if (presetsModal) {
    presetsModal.addEventListener("click", (e) => {
      if (e.target === presetsModal) {
        presetsModal.style.display = "none";
      }
    });
  }

  document.querySelectorAll(".btn-preset").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const presetName = btn.getAttribute("data-preset");
      if (PRESETS[presetName]) {
        loadSnapshot(PRESETS[presetName]);
        if (presetsModal) {
          presetsModal.style.display = "none";
        }
        await applyChangeAndExecute();
      }
    });
  });

  document.getElementById("btnPlay").addEventListener("click", togglePlay);
  document.getElementById("btnNext").addEventListener("click", stepForward);
  document.getElementById("btnPrev").addEventListener("click", stepBackward);
  document
    .getElementById("btnReset")
    .addEventListener("click", resetSimulation);

  const speedSlider = document.getElementById("speedSlider");
  const speedValue = document.getElementById("speedValue");
  speedSlider.addEventListener("input", (e) => {
    simState.speed = parseInt(e.target.value);
    speedValue.textContent = `${simState.speed}ms`;
    if (simState.isPlaying) {
      pause();
      play();
    }
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
      simState.activeTab = tabId;

      renderActiveTab();
      if (tabId === "global-view") {
        setTimeout(fitGlobalCanvas, 50);
      }
    });
  });

  const canvasContainer = document.getElementById("globalCanvasContainer");
}

/**
 * Procesa un archivo JSON cargado y lo convierte en snapshot EPiC.
 * Lee el archivo, parsea el JSON y carga el snapshot en el simulador.
 */
function handleFile(file) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      loadSnapshot(parsed);
      document.getElementById("jsonTextArea").value = JSON.stringify(
        parsed,
        null,
        2,
      );
      await applyChangeAndExecute();
    } catch (err) {
      alert("Error al parsear el archivo: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 5. Dynamic Ball Visibility Algorithm (History-Aware)
// 📌 [PROMPT_FEATURE_ANIMACION_PASO_A_PASO.md]
// ==========================================
// A ball is visible at step 's' if its value is not "N" (neutral/none)
// AND it has not propagated its value to any target with a newer update.
/**
 * Determina si una variable (bola) debe ser visible en un paso específico.
 * Una bola es visible si tiene valor no-N y no ha propagado a un objetivo más reciente.
 * Implementa la lógica de flujo directo (Modus Ponens) y contrapositivo (Modus Tollens).
 */
function isBallVisibleAtStep(varId, step) {
  const valHistory = simState.variableHistory[varId];
  if (!valHistory) return false;
  const val = valHistory[step];
  if (val === "N") return false;

  // Show all non-N balls at the final stabilized step
  const totalIterations = simState.snapshot.execution_trace?.total_iterations || 0;
  if (step >= totalIterations) {
    return true;
  }

  const logic = simState.snapshot.logic;
  const actions = simState.snapshot.execution_trace.actions;

  // Helper to find the last step <= 'step' where a variable was updated
  const getLastUpdateStep = (vId) => {
    let last = -1;
    const initialVal = simState.variableHistory[vId]?.[0];
    if (initialVal && initialVal !== "N") {
      last = 0; // Starts active at initial step
    }

    actions.forEach((act) => {
      if (act.step <= step && act.variable_id === vId) {
        last = act.step;
      }
    });
    return last;
  };

  const myLastUpdate = getLastUpdateStep(varId);

  // 1. Direct Flow Check: If we propagated to a target and the target has a newer update,
  // then the ball has left this circle and moved forward.
  const directRelations = logic.relations.filter(
    (r) => r.from_variable === varId && r.connective !== "CONTRAPOSITIONAL",
  );
  for (const rel of directRelations) {
    const targetVal = simState.variableHistory[rel.to_variable]?.[step];
    if (targetVal && targetVal !== "N") {
      const targetLastUpdate = getLastUpdateStep(rel.to_variable);
      if (myLastUpdate < targetLastUpdate) {
        return false;
      }
    }
  }

  // 2. Contrapositive Flow Check: Modus Tollens.
  // The flow travels backward (target to source).
  // If we are the target and the source has been updated more recently, the ball retroceded.
  const contraRelations = logic.relations.filter(
    (r) => r.to_variable === varId && r.connective === "CONTRAPOSITIONAL",
  );
  for (const rel of contraRelations) {
    const sourceVal = simState.variableHistory[rel.from_variable]?.[step];
    if (sourceVal && sourceVal !== "N") {
      const sourceLastUpdate = getLastUpdateStep(rel.from_variable);
      if (myLastUpdate < sourceLastUpdate) {
        return false;
      }
    }
  }

  return true;
}

// ==========================================
// 6. Core Parser & Setup State
// ==========================================
/**
 * Carga un snapshot EPiC completo en el simulador.
 * Normaliza el formato, construye historial de variables, calcula coordenadas relativas
 * y prepara las vistas de visualización (box view y global view).
 */
function loadSnapshot(snapshot) {
  if (!snapshot.meta) {
    snapshot.meta = {
      schema_version: "1.0",
      editor_mode: "ejecucion",
      belnap_domain: ["V", "F", "N", "B"],
      max_iterations: 100,
    };
  } else {
    if (!snapshot.meta.belnap_domain) snapshot.meta.belnap_domain = ["V", "F", "N", "B"];
    if (!snapshot.meta.max_iterations) snapshot.meta.max_iterations = 100;
  }

  if (!snapshot.logic)
    snapshot.logic = { variables: [], sets: [], relations: [] };
  if (!snapshot.visual)
    snapshot.visual = { instances: {}, sets: {}, relations: {} };

  let variablesList = [];
  if (Array.isArray(snapshot.logic.variables)) {
    variablesList = snapshot.logic.variables;
  } else if (
    snapshot.logic.variables &&
    typeof snapshot.logic.variables === "object"
  ) {
    variablesList = Object.values(snapshot.logic.variables);
  }

  variablesList.forEach((v) => {
    if (v.truth_value === undefined && v.value !== undefined) {
      v.truth_value = v.value;
    }
  });
  snapshot.logic.variables = variablesList;

  let relationsList = [];
  if (Array.isArray(snapshot.logic.relations)) {
    relationsList = snapshot.logic.relations;
  } else if (
    snapshot.logic.relations &&
    typeof snapshot.logic.relations === "object"
  ) {
    relationsList = Object.values(snapshot.logic.relations);
  }

  relationsList.forEach((r) => {
    if (r.from_variable === undefined && r.source !== undefined) {
      r.from_variable = r.source;
    }
    if (r.to_variable === undefined && r.target !== undefined) {
      r.to_variable = r.target;
    }
  });
  snapshot.logic.relations = relationsList;

  let setsList = [];
  if (Array.isArray(snapshot.logic.sets)) {
    setsList = snapshot.logic.sets;
  } else if (snapshot.logic.sets && typeof snapshot.logic.sets === "object") {
    setsList = Object.values(snapshot.logic.sets);
  }

  setsList.forEach((s) => {
    if (s.subsets === undefined) s.subsets = [];
    if (s.connective === undefined) s.connective = "PROPAGATION";
  });
  snapshot.logic.sets = setsList;

  if (!snapshot.execution_trace) {
    snapshot.execution_trace = {
      total_iterations: 1,
      stabilized: true,
      actions: [
        {
          step: 1,
          variable_id: "*",
          old_value: "*",
          new_value: "*",
          description:
            "Sistema inicial (Sin acciones de propagación en la traza).",
          is_stabilized: true,
        },
      ],
    };
  } else {
    let actions = snapshot.execution_trace.actions || [];
    actions.forEach((act) => {
      if (act.variable_id === undefined && act.target_id !== undefined) {
        act.variable_id = act.target_id;
      }
      if (act.new_value === undefined && act.result_value !== undefined) {
        act.new_value = act.result_value;
      }
      if (act.is_stabilized === undefined) {
        act.is_stabilized =
          act.action_type === "stabilization" || act.variable_id === "*";
      }
    });
    snapshot.execution_trace.actions = actions;
    if (
      snapshot.execution_trace.total_iterations === undefined &&
      snapshot.execution_trace.iterations !== undefined
    ) {
      snapshot.execution_trace.total_iterations =
        snapshot.execution_trace.iterations;
    }
  }

  simState.snapshot = snapshot;
  simState.currentStep = 0;
  pause();

  buildVariableHistory();
  calculateRelativeCoordinates();
  extractBoxPairs();

  // DIAGNOSTIC — ver F12
  console.group("🔍 loadSnapshot DIAGNOSTIC");
  console.log("logic.variables:", simState.snapshot.logic.variables);
  console.log("logic.relations:", simState.snapshot.logic.relations);
  console.log("visual.instances:", simState.snapshot.visual.instances);
  console.log("visual.sets:", simState.snapshot.visual.sets);
  console.log("relativeCoordinates:", simState.relativeCoordinates);
  console.log("boxPairs:", simState.boxPairs);
  console.log(
    "execution_trace actions:",
    simState.snapshot.execution_trace?.actions,
  );
  console.groupEnd();

  if (EditorBridge && EditorBridge.isInitialized && EditorBridge.isInitialized()) {
    EditorBridge.loadSnapshot(simState.snapshot);
  }

  const jsonViewer = document.getElementById("jsonViewer");
  if (jsonViewer) {
    jsonViewer.textContent = JSON.stringify(simState.snapshot, null, 2);
  }

  const jsonViewerInput = document.getElementById("jsonViewerInput");
  if (jsonViewerInput) {
    const inputSnapshot = {
      logic: simState.snapshot.logic,
      visual: simState.snapshot.visual
    };
    jsonViewerInput.textContent = JSON.stringify(inputSnapshot, null, 2);
  }

  updateUI();

  setTimeout(fitGlobalCanvas, 50);
}

/**
 * Construye el historial completo de valores de cada variable a través de todos los pasos.
 * Crea un array temporal donde history[varId][step] = valor en ese paso.
 */
function buildVariableHistory() {
  const vars = simState.snapshot.logic.variables;
  const actions = simState.snapshot.execution_trace.actions;

  const history = {};
  vars.forEach((v) => {
    history[v.id] = [v.truth_value || "N"];
  });

  let maxStep = 0;
  actions.forEach((a) => {
    if (a.step > maxStep) maxStep = a.step;
  });

  for (let s = 1; s <= maxStep; s++) {
    vars.forEach((v) => {
      const prevVal = history[v.id][s - 1];
      history[v.id][s] = prevVal;
    });

    const stepActions = actions.filter((a) => a.step === s);
    stepActions.forEach((act) => {
      if (act.variable_id && act.variable_id !== "*") {
        if (history[act.variable_id]) {
          history[act.variable_id][s] = act.new_value;
        }
      }
    });
  }

  simState.variableHistory = history;
  simState.maxStep = maxStep;
}

/**
 * Calcula las coordenadas relativas de cada instancia visual respecto a su conjunto padre.
 * Determina membresía por declaración explícita o proximidad geométrica.
 */
function calculateRelativeCoordinates() {
  const visual = simState.snapshot.visual;
  const logic = simState.snapshot.logic;
  simState.relativeCoordinates = {};

  Object.entries(visual.instances).forEach(([instId, inst]) => {
    const varLog = logic.variables.find((v) => v.id === inst.variable_id);
    if (!varLog) return;

    let parentSetId = null;

    if (varLog.memberships && varLog.memberships.length > 0) {
      parentSetId = varLog.memberships.find((setId) => visual.sets[setId]);
    }

    if (!parentSetId) {
      const sets = Object.entries(visual.sets);
      for (const [setId, setVal] of sets) {
        const dx = inst.x - setVal.x;
        const dy = inst.y - setVal.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= setVal.radius) {
          parentSetId = setId;
          break;
        }
      }
    }

    if (parentSetId) {
      const parentSet = visual.sets[parentSetId];
      let dx = inst.x - parentSet.x;
      let dy = inst.y - parentSet.y;
      
      const dist = Math.sqrt(dx * dx + dy * dy);
      const safeRadius = Math.max(10, parentSet.radius - 20); // 20px padding
      
      if (dist > safeRadius) {
        // The ball is outside the set! Clamp it inside.
        if (dist === 0) {
          dx = 0;
          dy = 0;
        } else {
          const scale = safeRadius / dist;
          dx = dx * scale;
          dy = dy * scale;
        }
        
        // Update the instance's absolute coordinates permanently
        inst.x = parentSet.x + dx;
        inst.y = parentSet.y + dy;
      }

      simState.relativeCoordinates[instId] = {
        setId: parentSetId,
        dx: dx,
        dy: dy,
      };
    } else {
      simState.relativeCoordinates[instId] = {
        setId: null,
        dx: 0,
        dy: 0,
      };
    }
  });
}

// 📌 [PROMPT_FEATURE_VISTA_CAJITAS.md]
/**
 * Extrae pares de conjuntos conectados por relaciones para la vista Box.
 * Identifica transiciones entre conjuntos basándose en las relaciones lógicas.
 */
function extractBoxPairs() {
  const logic = simState.snapshot.logic;
  const visual = simState.snapshot.visual;
  const setList = Object.keys(visual.sets);

  if (setList.length === 0) {
    simState.boxPairs = [];
    return;
  }

  const setTransitions = [];
  const addedPairs = new Set();

  logic.relations.forEach((rel) => {
    const fromVar = logic.variables.find((v) => String(v.id) === String(rel.from_variable));
    const toVar = logic.variables.find((v) => String(v.id) === String(rel.to_variable));
    if (!fromVar || !toVar) return;

    const fromInst = Object.values(visual.instances).find(
      (inst) => String(inst.variable_id) === String(fromVar.id),
    );
    const toInst = Object.values(visual.instances).find(
      (inst) => String(inst.variable_id) === String(toVar.id),
    );
    if (!fromInst || !toInst) return;

    const fromSetId = simState.relativeCoordinates[fromInst.id]?.setId;
    const toSetId = simState.relativeCoordinates[toInst.id]?.setId;

    if (fromSetId && toSetId && String(fromSetId) !== String(toSetId)) {
      const pairKey = `${fromSetId}->${toSetId}`;
      if (!addedPairs.has(pairKey)) {
        addedPairs.add(pairKey);
        setTransitions.push({
          from: fromSetId,
          to: toSetId,
          relationId: rel.id,
        });
      }
    }
  });

  let pairs = [];
  if (setTransitions.length > 0) {
    setTransitions.forEach((trans) => {
      pairs.push([trans.from, trans.to]);
    });
  }

  if (pairs.length === 0 && setList.length > 1) {
    const sortedSets = setList
      .map((id) => ({ id, x: visual.sets[id].x }))
      .sort((a, b) => a.x - b.x)
      .map((s) => s.id);
    for (let i = 0; i < sortedSets.length - 1; i++) {
      pairs.push([sortedSets[i], sortedSets[i + 1]]);
    }
  }

  if (pairs.length === 0 && setList.length === 1) {
    pairs.push([setList[0], setList[0]]);
  }

  simState.boxPairs = pairs;
}

// ==========================================
// 7. UI Updates
// ==========================================
/**
 * Actualiza todos los elementos de la interfaz con el estado actual del simulador.
 * Sincroniza badges, contadores de pasos y renderiza la vista activa.
 */
function updateUI() {
  const trace = simState.snapshot.execution_trace;
  const badge = document.getElementById("stabilizedBadge");
  const iterationsEl = document.getElementById("iterationCount");
  const totalStepsEl = document.getElementById("totalSteps");
  const currentStepEl = document.getElementById("currentStep");

  if (trace.stabilized) {
    badge.textContent = "Estabilizado";
    badge.className = "badge badge-success";
  } else {
    badge.textContent = "Divergente";
    badge.className = "badge badge-danger";
  }

  iterationsEl.textContent = trace.total_iterations;

  const totalSteps = simState.maxStep;
  totalStepsEl.textContent = totalSteps;
  currentStepEl.textContent = simState.currentStep;

  buildTraceLogHTML();
  renderActiveTab();
}

/**
 * Construye el HTML del log de trazas de ejecución.
 * Muestra cada acción del execution_trace con su paso, descripción y valor resultante.
 */
function buildTraceLogHTML() {
  const traceList = document.getElementById("traceList");
  traceList.innerHTML = "";
  const actions = simState.snapshot.execution_trace.actions;

  if (actions.length === 0) {
    traceList.innerHTML = `<div class="trace-placeholder">Sin acciones registradas.</div>`;
    return;
  }

  actions.forEach((act, idx) => {
    const item = document.createElement("div");
    item.className = `trace-item ${simState.currentStep === idx + 1 ? "active" : ""}`;

    let valIndicator = "";
    if (act.new_value && act.new_value !== "*") {
      valIndicator = `<span class="val-badge val-${act.new_value.toLowerCase()}"></span>`;
    }

    item.innerHTML = `
      <span class="trace-step-badge">P${act.step}</span>
      <div class="trace-details">
        <p class="trace-desc">${act.description}</p>
        <div class="trace-meta">
          ${valIndicator}
          <span>${act.variable_id !== "*" ? `Variable: ${act.variable_id}` : "Estabilización"}</span>
        </div>
      </div>
    `;

    item.addEventListener("click", () => {
      jumpToStep(idx + 1);
    });

    traceList.appendChild(item);
  });

  const activeItem = traceList.querySelector(".trace-item.active");
  if (activeItem) {
    activeItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

/**
 * Mapea un valor Belnap (V, F, N, B) a su color visual correspondiente.
 * V=verde, F=rojo, N=gris, B=púrpura.
 */
function getColorForValue(val) {
  switch (val?.toUpperCase()) {
    case "V":
      return "#10B981";
    case "F":
      return "#EF4444";
    case "N":
      return "#6B7280";
    case "B":
      return "#8B5CF6";
    default:
      return "#6B7280";
  }
}

/**
 * Evalúa una operación lógica Belnap entre dos valores.
 * Implementa las matrices de verdad para AND, OR y PROPAGATION (k-join).
 */
function evaluateBelnapMatrix(op, val1, val2) {
  const v1 = val1?.toUpperCase() || "N";
  const v2 = val2?.toUpperCase() || "N";

  if (op === "AND" || op === "CONJUNCTION") {
    if (v1 === "N") {
      if (v2 === "N") return "N";
      if (v2 === "F") return "F";
      if (v2 === "V") return "N";
      if (v2 === "B") return "F";
    } else if (v1 === "F") return "F";
    else if (v1 === "V") {
      if (v2 === "N") return "N";
      if (v2 === "F") return "F";
      if (v2 === "V") return "V";
      if (v2 === "B") return "B";
    } else if (v1 === "B") {
      if (v2 === "N") return "F";
      if (v2 === "F") return "F";
      if (v2 === "V") return "B";
      if (v2 === "B") return "B";
    }
  } else if (op === "OR" || op === "DISJUNCTION") {
    if (v1 === "N") {
      if (v2 === "N") return "N";
      if (v2 === "F") return "N";
      if (v2 === "V") return "V";
      if (v2 === "B") return "V";
    } else if (v1 === "F") {
      if (v2 === "N") return "N";
      if (v2 === "F") return "F";
      if (v2 === "V") return "V";
      if (v2 === "B") return "B";
    } else if (v1 === "V") return "V";
    else if (v1 === "B") {
      if (v2 === "N") return "V";
      if (v2 === "F") return "B";
      if (v2 === "V") return "V";
      if (v2 === "B") return "B";
    }
  } else if (op === "PROPAGATION" || op === "KJOIN") {
    if (v1 === v2) return v1;
    if (v1 === "N") return v2;
    if (v2 === "N") return v1;
    if (v1 === "B" || v2 === "B") return "B";
    if ((v1 === "V" && v2 === "F") || (v1 === "F" && v2 === "V")) return "B";
    return "B";
  }
  return "N";
}

/**
 * Determina el conectivo efectivo de una relación.
 * Busca primero en la relación explícita, luego en el conjunto destino.
 */
function getRelationEffectiveOp(rel, logic) {
  try {
    let explicitOp = rel.connective;

    if (!logic || !logic.variables || !logic.sets)
      return explicitOp || "PROPAGATION";

    let varsArray = logic.variables;
    if (!Array.isArray(varsArray)) {
      if (typeof varsArray === "object") varsArray = Object.values(varsArray);
      else return explicitOp || "PROPAGATION";
    }

    const targetVar = varsArray.find((v) => v.id === rel.to_variable);
    if (
      !targetVar ||
      !targetVar.memberships ||
      !Array.isArray(targetVar.memberships)
    )
      return explicitOp || "PROPAGATION";

    let setsArray = logic.sets;
    if (!Array.isArray(setsArray)) {
      if (typeof setsArray === "object") setsArray = Object.values(setsArray);
      else return explicitOp || "PROPAGATION";
    }

    for (const setId of targetVar.memberships) {
      const set = setsArray.find((s) => s.id === setId);
      if (set && set.connective) {
        return set.connective.toUpperCase();
      }
    }
    return explicitOp ? explicitOp.toUpperCase() : "PROPAGATION";
  } catch (e) {
    console.error("getRelationEffectiveOp error", e);
  }
  return "PROPAGATION";
}

// ==========================================
// 8. SVG Rendering Engine
// ==========================================
function renderActiveTab() {
  if (simState.activeTab === "box-view") {
    renderBoxView();
  } else if (simState.activeTab === "global-view") {
    renderGlobalView();
  } else if (simState.activeTab === "editor-view") {
    
  }
}

// --- BOX VIEW RENDER ---
function renderBoxView() {
  const container = document.getElementById("boxesGrid");
  container.innerHTML = "";

  if (simState.boxPairs.length === 0) {
    container.innerHTML = `
      <div class="no-data-placeholder">
        <i data-lucide="box" class="large-icon"></i>
        <h3>No hay conjuntos para emparejar</h3>
      </div>`;
    lucide.createIcons();
    return;
  }

  const visual = simState.snapshot.visual;
  const logic = simState.snapshot.logic;

  simState.boxPairs.forEach((pair, boxIdx) => {
    const setIdLeft = pair[0];
    const setIdRight = pair[1];

    const setLeft = visual.sets[setIdLeft];
    const setRight = visual.sets[setIdRight];
    if (!setLeft || !setRight) return;

    const card = document.createElement("div");
    card.className = "box-card card";
    card.innerHTML = `
      <div class="box-card-header">
        <span class="box-title">Cajita ${boxIdx + 1}: ${setIdLeft === setIdRight ? setIdLeft : `${setIdLeft} &rarr; ${setIdRight}`}</span>
        <span class="box-tag">Par Consecutivo</span>
      </div>
      <div class="box-svg-container" id="box-svg-${boxIdx}">
      </div>
    `;

    container.appendChild(card);

    const svgContainer = card.querySelector(".box-svg-container");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 420 200");
    svgContainer.appendChild(svg);

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);

    // Create dynamic markers for each relation with its specific color
    logic.relations.forEach((rel) => {
      const relVisual = visual.relations[rel.id] || {
        color: "#3B82F6",
        thickness: 2,
      };
      let markerColor = relVisual.color || "#3B82F6";

      const effectiveOp = getRelationEffectiveOp(rel, logic);
      if (effectiveOp) {
        const fromHistory = simState.variableHistory[rel.from_variable];
        const toHistory = simState.variableHistory[rel.to_variable];
        const valFrom = fromHistory ? fromHistory[simState.currentStep] : "N";
        const valTo = toHistory ? toHistory[simState.currentStep] : "N";
        markerColor = getColorForValue(
          evaluateBelnapMatrix(effectiveOp, valFrom, valTo),
        );
      }

      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "marker",
      );
      marker.setAttribute("id", `arrow-box-${boxIdx}-${rel.id}`);
      marker.setAttribute("viewBox", "0 0 10 10");
      marker.setAttribute("refX", "6");
      marker.setAttribute("refY", "5");
      marker.setAttribute("markerWidth", "6");
      marker.setAttribute("markerHeight", "6");
      marker.setAttribute("orient", "auto-start-reverse");

      const markerPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      markerPath.setAttribute("d", "M 0 1 L 10 5 L 0 9 z");
      markerPath.setAttribute("fill", markerColor);

      marker.appendChild(markerPath);
      defs.appendChild(marker);
    });

    const leftCenterX = 110;
    const rightCenterX = 310;
    const centerY = 100;

    const leftRadius = Math.min(setLeft.radius, 70);
    const rightRadius = Math.min(setRight.radius, 70);

    // Draw sets
    const gSetL = drawSetSVG(
      setIdLeft,
      setLeft,
      leftCenterX,
      centerY,
      leftRadius,
      `box${boxIdx}`
    );
    svg.appendChild(gSetL);

    if (setIdLeft !== setIdRight) {
      const gSetR = drawSetSVG(
        setIdRight,
        setRight,
        rightCenterX,
        centerY,
        rightRadius,
        `box${boxIdx}`
      );
      svg.appendChild(gSetR);
    }

    const ballCoords = {};

    // Draw variables with Visibility logic
    const drawVariablesForSet = (setId, cx) => {
      Object.entries(visual.instances).forEach(([instId, inst]) => {
        const relData = simState.relativeCoordinates[instId];
        console.log(
          `[drawVar] inst=${instId} relData.setId=${relData?.setId} expected=${setId} match=${String(relData?.setId) === String(setId)}`,
        );
        if (relData && String(relData.setId) === String(setId)) {
          const scale =
            cx === leftCenterX
              ? leftRadius / setLeft.radius
              : rightRadius / setRight.radius;
          const bx = cx + relData.dx * scale;
          const by = centerY + relData.dy * scale;

          const varLog = logic.variables.find((v) => v.id === inst.variable_id);
          if (!varLog) return;

          const valHistory = simState.variableHistory[varLog.id];
          const curVal = valHistory ? valHistory[simState.currentStep] : "N";

          // Calculate visual ball visibility for step
          const isVisible = isBallVisibleAtStep(
            varLog.id,
            simState.currentStep,
          );

          const gBall = drawBallSVG(
            inst.variable_id,
            instId,
            bx,
            by,
            curVal,
            isVisible,
            `box${boxIdx}`
          );
          svg.appendChild(gBall);

          ballCoords[varLog.id] = { x: bx, y: by };
        }
      });
    };

    drawVariablesForSet(setIdLeft, leftCenterX);
    if (String(setIdLeft) !== String(setIdRight)) {
      drawVariablesForSet(setIdRight, rightCenterX);
    }

    // Draw implication arrows
    logic.relations.forEach((rel) => {
      const fromCoord = ballCoords[rel.from_variable];
      const toCoord = ballCoords[rel.to_variable];

      if (fromCoord && toCoord) {
        const relVisual = visual.relations[rel.id] || {
          color: "#3B82F6",
          thickness: 2,
        };

        const dx = toCoord.x - fromCoord.x;
        const dy = toCoord.y - fromCoord.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const radiusBall = 15;

        const startX = fromCoord.x + (dx / len) * radiusBall;
        const startY = fromCoord.y + (dy / len) * radiusBall;
        const endX = toCoord.x - (dx / len) * (radiusBall + 6);
        const endY = toCoord.y - (dy / len) * (radiusBall + 6);

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("id", `box-path-${boxIdx}-${rel.id}`);

        let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        if ((Math.abs(dx) > 10 && Math.abs(dy) > 10) || relVisual.curved) {
          const cOffset = relVisual.curveOffset || 15;
          const midX = (startX + endX) / 2 + (dy / len) * cOffset;
          const ctrlY = (startY + endY) / 2 - (dx / len) * cOffset;
          pathD = `M ${startX} ${startY} Q ${midX} ${ctrlY} ${endX} ${endY}`;
        }

        path.setAttribute("d", pathD);
        let strokeColor = relVisual.color || "#3B82F6";
        const effectiveOp = getRelationEffectiveOp(rel, logic);
        if (effectiveOp) {
          const fromHistory = simState.variableHistory[rel.from_variable];
          const toHistory = simState.variableHistory[rel.to_variable];
          const valFrom = fromHistory ? fromHistory[simState.currentStep] : "N";
          const valTo = toHistory ? toHistory[simState.currentStep] : "N";
          strokeColor = getColorForValue(
            evaluateBelnapMatrix(effectiveOp, valFrom, valTo),
          );
        }
        path.setAttribute(
          "class",
          `svg-relation-path ${relVisual.is_contrapositive ? "contrapositive" : ""}`,
        );
        path.setAttribute("stroke", strokeColor);
        path.setAttribute("stroke-width", relVisual.thickness || 2);
        path.setAttribute("marker-end", `url(#arrow-box-${boxIdx}-${rel.id})`);

        svg.appendChild(path);
      }
    });
  });
}

// --- GLOBAL CANVAS RENDER ---
let isDraggingGlobal = false;
let draggedGlobalElement = null;
let dragGlobalType = null;
let dragGlobalId = null;
let dragGlobalOffsetX = 0;
let dragGlobalOffsetY = 0;

function setupGlobalDragging(svg) {
  if (svg.dataset.dragSetup === "true") return;
  svg.dataset.dragSetup = "true";

  svg.addEventListener("dblclick", async (e) => {
    const target = e.target.closest(".g-set-container, .g-ball-container");
    if (!target) return;
    
    e.stopPropagation();
    e.preventDefault();

    if (target.classList.contains("g-set-container")) {
      const setId = target.getAttribute("data-set-id");
      if (confirm(`¿Seguro que deseas eliminar el conjunto "${setId}"?`)) {
        if (window.EditorBridge && window.EditorBridge.isInitialized()) {
          window.EditorBridge.deleteSet(setId);
          try {
            const res = await window.EditorBridge.executeWithMotor();
            loadSnapshot(res && res.ok ? res.snapshot : window.EditorBridge.getCurrentSnapshot());
          } catch (err) {
            loadSnapshot(window.EditorBridge.getCurrentSnapshot());
          }
        }
      }
    } else {
      const varId = target.getAttribute("data-variable-id");
      if (confirm(`¿Seguro que deseas eliminar la variable "${varId}"?`)) {
        if (window.EditorBridge && window.EditorBridge.isInitialized()) {
          window.EditorBridge.deleteVariable(varId);
          try {
            const res = await window.EditorBridge.executeWithMotor();
            loadSnapshot(res && res.ok ? res.snapshot : window.EditorBridge.getCurrentSnapshot());
          } catch (err) {
            loadSnapshot(window.EditorBridge.getCurrentSnapshot());
          }
        }
      }
    }
  });

  svg.addEventListener("mousedown", (e) => {
    const target = e.target.closest(".g-set-container, .g-ball-container");
    if (!target) return;
    
    isDraggingGlobal = true;
    draggedGlobalElement = target;
    
    const CTM = svg.getScreenCTM();
    if (target.classList.contains("g-set-container")) {
      dragGlobalType = "set";
      dragGlobalId = target.getAttribute("data-set-id");
      const setVal = simState.snapshot.visual.sets[dragGlobalId];
      dragGlobalOffsetX = (e.clientX - CTM.e) / CTM.a - setVal.x;
      dragGlobalOffsetY = (e.clientY - CTM.f) / CTM.d - setVal.y;
    } else {
      dragGlobalType = "ball";
      dragGlobalId = target.getAttribute("data-instance-id");
      const instVal = simState.snapshot.visual.instances[dragGlobalId];
      dragGlobalOffsetX = (e.clientX - CTM.e) / CTM.a - instVal.x;
      dragGlobalOffsetY = (e.clientY - CTM.f) / CTM.d - instVal.y;
    }
    e.stopPropagation();
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDraggingGlobal || !draggedGlobalElement) return;
    
    const CTM = svg.getScreenCTM();
    const mouseX = (e.clientX - CTM.e) / CTM.a;
    const mouseY = (e.clientY - CTM.f) / CTM.d;

    const newX = mouseX - dragGlobalOffsetX;
    const newY = mouseY - dragGlobalOffsetY;

    if (dragGlobalType === "set") {
      const setVal = simState.snapshot.visual.sets[dragGlobalId];
      setVal.x = newX;
      setVal.y = newY;
    } else {
      const instVal = simState.snapshot.visual.instances[dragGlobalId];
      let finalNewX = newX;
      let finalNewY = newY;
      
      const relData = simState.relativeCoordinates[dragGlobalId];
      if (relData && relData.setId) {
        const parentSet = simState.snapshot.visual.sets[relData.setId];
        let dx = newX - parentSet.x;
        let dy = newY - parentSet.y;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        const safeRadius = Math.max(10, parentSet.radius - 20);
        
        if (dist > safeRadius) {
          if (dist > 0) {
            const scale = safeRadius / dist;
            dx = dx * scale;
            dy = dy * scale;
          }
          finalNewX = parentSet.x + dx;
          finalNewY = parentSet.y + dy;
        }
        
        relData.dx = dx;
        relData.dy = dy;
      }
      
      instVal.x = finalNewX;
      instVal.y = finalNewY;
    }
    
    updateGlobalViewPositions();
  });

  window.addEventListener("mouseup", (e) => {
    if (isDraggingGlobal) {
      isDraggingGlobal = false;
      draggedGlobalElement = null;
    }
  });
}

function renderGlobalView() {
  const container = document.getElementById("globalCanvasContainer");
  container.innerHTML = "";

  const visual = simState.snapshot.visual;
  const logic = simState.snapshot.logic;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("id", "globalSvg");
  container.appendChild(svg);

  setupGlobalDragging(svg);

  const gTransform = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g",
  );
  gTransform.setAttribute("id", "globalTransformGroup");
  svg.appendChild(gTransform);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  gTransform.appendChild(defs);

  // Create dynamic markers for each relation with its specific color
  logic.relations.forEach((rel) => {
    const relVisual = visual.relations[rel.id] || {
      color: "#3B82F6",
      thickness: 2,
    };
    let markerColor = relVisual.color || "#3B82F6";

    const effectiveOp = getRelationEffectiveOp(rel, logic);
    if (effectiveOp) {
      const fromHistory = simState.variableHistory[rel.from_variable];
      const toHistory = simState.variableHistory[rel.to_variable];
      const valFrom = fromHistory ? fromHistory[simState.currentStep] : "N";
      const valTo = toHistory ? toHistory[simState.currentStep] : "N";
      markerColor = getColorForValue(
        evaluateBelnapMatrix(effectiveOp, valFrom, valTo),
      );
    }

    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker",
    );
    marker.setAttribute("id", `arrow-global-${rel.id}`);
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "6");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");

    const markerPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    markerPath.setAttribute("d", "M 0 1 L 10 5 L 0 9 z");
    markerPath.setAttribute("fill", markerColor);

    marker.appendChild(markerPath);
    defs.appendChild(marker);
  });

  Object.entries(visual.sets).forEach(([setId, setVal]) => {
    const gSet = drawSetSVG(setId, setVal, setVal.x, setVal.y, setVal.radius);
    gTransform.appendChild(gSet);
  });

  const ballCoords = {};

  Object.entries(visual.instances).forEach(([instId, inst]) => {
    const varLog = logic.variables.find((v) => v.id === inst.variable_id);
    if (!varLog) return;

    const valHistory = simState.variableHistory[varLog.id];
    const curVal = valHistory ? valHistory[simState.currentStep] : "N";

    const isVisible = isBallVisibleAtStep(varLog.id, simState.currentStep);

    const gBall = drawBallSVG(
      inst.variable_id,
      instId,
      inst.x,
      inst.y,
      curVal,
      isVisible,
    );
    gTransform.appendChild(gBall);

    ballCoords[varLog.id] = { x: inst.x, y: inst.y };
  });

  logic.relations.forEach((rel) => {
    const fromCoord = ballCoords[rel.from_variable];
    const toCoord = ballCoords[rel.to_variable];

    if (fromCoord && toCoord) {
      const relVisual = visual.relations[rel.id] || {
        color: "#3B82F6",
        thickness: 2,
      };

      const dx = toCoord.x - fromCoord.x;
      const dy = toCoord.y - fromCoord.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const radiusBall = 15;

      const startX = fromCoord.x + (dx / len) * radiusBall;
      const startY = fromCoord.y + (dy / len) * radiusBall;
      const endX = toCoord.x - (dx / len) * (radiusBall + 6);
      const endY = toCoord.y - (dy / len) * (radiusBall + 6);

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("id", `global-path-${rel.id}`);

      let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
      if ((Math.abs(dx) > 10 && Math.abs(dy) > 10) || relVisual.curved) {
        const cOffset = relVisual.curveOffset || 15;
        const midX = (startX + endX) / 2 + (dy / len) * cOffset;
        const midY = (startY + endY) / 2 - (dx / len) * cOffset;
        pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
      }

      path.setAttribute("d", pathD);
      let strokeColor = relVisual.color || "#3B82F6";
      const effectiveOp = getRelationEffectiveOp(rel, logic);
      if (effectiveOp) {
        const fromHistory = simState.variableHistory[rel.from_variable];
        const toHistory = simState.variableHistory[rel.to_variable];
        const valFrom = fromHistory ? fromHistory[simState.currentStep] : "N";
        const valTo = toHistory ? toHistory[simState.currentStep] : "N";
        strokeColor = getColorForValue(
          evaluateBelnapMatrix(effectiveOp, valFrom, valTo),
        );
      }
      path.setAttribute(
        "class",
        `svg-relation-path ${relVisual.is_contrapositive ? "contrapositive" : ""}`,
      );
      path.setAttribute("stroke", strokeColor);
      path.setAttribute("stroke-width", relVisual.thickness || 2);
      path.setAttribute("marker-end", `url(#arrow-global-${rel.id})`);

      gTransform.appendChild(path);
    }
  });

  fitGlobalCanvas();
}

function updateGlobalViewPositions() {
  const visual = simState.snapshot.visual;
  const logic = simState.snapshot.logic;
  const container = document.getElementById("globalCanvasContainer");
  if (!container) return;

  // 1. Update Sets SVG positions
  Object.entries(visual.sets).forEach(([setId, setVal]) => {
    const circle = container.querySelector(`#global-set-circle-${setId}`);
    if (circle) {
      circle.setAttribute("cx", setVal.x);
      circle.setAttribute("cy", setVal.y);
    }
    const label = container.querySelector(`#global-set-label-${setId}`);
    if (label) {
      label.setAttribute("x", setVal.x);
      label.setAttribute("y", setVal.y - setVal.radius + 14);
    }
    const conn = container.querySelector(`#global-set-conn-${setId}`);
    if (conn) {
      conn.setAttribute("x", setVal.x);
      conn.setAttribute("y", setVal.y - setVal.radius + 25);
    }
  });

  // 2. Update Balls SVG positions
  Object.entries(visual.instances).forEach(([instId, inst]) => {
    const relData = simState.relativeCoordinates[instId];
    if (relData && relData.setId) {
      const parentSet = visual.sets[relData.setId];
      if (parentSet) {
        inst.x = parentSet.x + relData.dx;
        inst.y = parentSet.y + relData.dy;
      }
    }

    const circle = container.querySelector(`#global-ball-circle-${instId}`);
    if (circle) {
      circle.setAttribute("cx", inst.x);
      circle.setAttribute("cy", inst.y);
    }
    const label = container.querySelector(`#global-ball-label-${instId}`);
    if (label) {
      label.setAttribute("x", inst.x);
      label.setAttribute("y", inst.y + 4);
    }
  });

  // 3. Update Path/Arrow SVG positions
  const ballCoords2 = {};
  Object.entries(visual.instances).forEach(([instId, inst]) => {
    const varLog = logic.variables.find((v) => v.id === inst.variable_id);
    if (varLog) {
      ballCoords2[varLog.id] = { x: inst.x, y: inst.y };
    }
  });

  logic.relations.forEach((rel) => {
    const fromCoord = ballCoords2[rel.from_variable];
    const toCoord = ballCoords2[rel.to_variable];

    if (fromCoord && toCoord) {
      const relVisual = visual.relations[rel.id] || {
        color: "#3B82F6",
        thickness: 2,
      };

      const dx = toCoord.x - fromCoord.x;
      const dy = toCoord.y - fromCoord.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const radiusBall = 15;

      const startX = fromCoord.x + (dx / len) * radiusBall;
      const startY = fromCoord.y + (dy / len) * radiusBall;
      const endX = toCoord.x - (dx / len) * (radiusBall + 6);
      const endY = toCoord.y - (dy / len) * (radiusBall + 6);

      const path = container.querySelector(`#global-path-${rel.id}`);
      if (path) {
        let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        if ((Math.abs(dx) > 10 && Math.abs(dy) > 10) || relVisual.curved) {
          const cOffset = relVisual.curveOffset || 15;
          const midX = (startX + endX) / 2 + (dy / len) * cOffset;
          const midY = (startY + endY) / 2 - (dx / len) * cOffset;
          pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        }
        path.setAttribute("d", pathD);
      }
    }
  });
}

function drawSetSVG(setId, setVal, cx, cy, radius, prefix = "global") {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "g-set-container");
  g.setAttribute("data-set-id", setId);
  g.setAttribute("id", `${prefix}-set-group-${setId}`);

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("id", `${prefix}-set-circle-${setId}`);
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", radius);
  circle.setAttribute("class", "svg-set");
  circle.setAttribute("stroke", "#38bdf8"); // Light blue outline
  circle.setAttribute("stroke-width", "2");
  g.appendChild(circle);

  const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textId.setAttribute("id", `${prefix}-set-label-${setId}`);
  textId.setAttribute("x", cx);
  textId.setAttribute("y", cy - radius + 14);
  textId.setAttribute("class", "svg-set-label");
  textId.textContent = setVal.result_alias || setId;
  g.appendChild(textId);

  if (setVal.connective) {
    const textConn = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    textConn.setAttribute("id", `${prefix}-set-conn-${setId}`);
    textConn.setAttribute("x", cx);
    textConn.setAttribute("y", cy - radius + 25);
    textConn.setAttribute("class", "svg-set-connective");
    textConn.textContent = `[${setVal.connective}]`;
    g.appendChild(textConn);
  }

  return g;
}

function drawBallSVG(varId, instId, x, y, value, isVisible = true, prefix = "global") {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "g-ball-container");
  g.setAttribute("data-instance-id", instId);
  g.setAttribute("data-variable-id", varId);
  g.setAttribute("id", `${prefix}-ball-group-${instId}`);
  g.setAttribute(
    "style",
    `opacity: ${isVisible ? 1 : 0.2}; transition: opacity 0.35s ease-in-out;`,
  );

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("id", `${prefix}-ball-circle-${instId}`);
  circle.setAttribute("data-var-id", varId);
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 15);
  circle.setAttribute("class", `svg-instance val-${(value || "N").toLowerCase()}`);
  g.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("id", `${prefix}-ball-label-${instId}`);
  text.setAttribute("x", x);
  text.setAttribute("y", y + 4);
  text.setAttribute("class", "svg-instance-label");
  text.textContent = `${varId}:${value || "N"}`;
  g.appendChild(text);

  return g;
}

/**
 * Ajusta el canvas global para que todo el contenido sea visible usando viewBox.
 * Calcula el bounding box y ajusta el SVG dinámicamente.
 */
function fitGlobalCanvas() {
  const svg = document.getElementById("globalSvg");
  if (!svg) return;

  const bbox = svg.getBBox();
  if (bbox.width === 0 || bbox.height === 0) return;

  const margin = 50;
  const viewBoxStr = `${bbox.x - margin} ${bbox.y - margin} ${bbox.width + margin * 2} ${bbox.height + margin * 2}`;
  
  svg.setAttribute("viewBox", viewBoxStr);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
}

// ==========================================
// 9. Simulation Actions & Step Animations (Fail-safe Timeout Flow)
// ==========================================
/**
 * Avanza un paso en la simulación EPiC.
 * Ejecuta animaciones de propagación y actualiza el estado tras completarlas.
 * Implementa timeout fail-safe para evitar bloqueos en reproducción rápida.
 */
function stepForward() {
  const actions = simState.snapshot.execution_trace.actions;
  if (simState.currentStep >= simState.maxStep) {
    pause();
    return;
  }

  // Clear any existing animation timeout to force-complete previous step if clicking rapidly or playing fast
  if (simState.animationTimeout) {
    clearTimeout(simState.animationTimeout);
    simState.animationTimeout = null;
    simState.currentStep++;
    updateUI();
    if (simState.currentStep >= simState.maxStep) {
      pause();
      return;
    }
  }

  const nextStepNum = simState.currentStep + 1;
  const stepActions = actions.filter((a) => a.step === nextStepNum);

  if (stepActions.length === 0) {
    simState.currentStep = nextStepNum;
    updateUI();
    return;
  }

  const animDuration = Math.min(750, Math.max(50, simState.speed - 50));

  // 1. Run parallel animations on top of the DOM at step s-1
  stepActions.forEach((action) => {
    if (action.is_stabilized || action.variable_id === "*") {
      pulseStabilization(animDuration);
    } else {
      triggerSingleActionAnimation(action, animDuration);
    }
  });

  // 2. Set fail-safe timeout to update state and redraw statically after animation completes
  simState.animationTimeout = setTimeout(() => {
    simState.animationTimeout = null;
    simState.currentStep = nextStepNum;
    updateUI();
  }, animDuration);
}

/**
 * Anima un pulso de estabilización en todas las variables.
 * Indica visualmente que el sistema EPiC alcanzó un punto fijo.
 */
function pulseStabilization(animDuration = 600) {
  document.querySelectorAll(".svg-instance").forEach((el) => {
    el.animate(
      [
        { transform: "scale(1)", filter: "drop-shadow(0 0 0px transparent)" },
        {
          transform: "scale(1.15)",
          filter: "drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))",
        },
        { transform: "scale(1)", filter: "none" },
      ],
      { duration: animDuration, easing: "ease-out" },
    );
  });
}

/**
 * Dispara la animación de una acción individual de propagación.
 * Anima partículas viajando por las relaciones desde fuente a destino.
 * Implementa Modus Ponens visual (flujo directo) y Modus Tollens (flujo inverso).
 */
function triggerSingleActionAnimation(action, animDuration = 750) {
  const logic = simState.snapshot.logic;
  const targetVarId = action.variable_id;
  const newVal = action.new_value;

  const activeRelations = logic.relations.filter(
    (r) => r.to_variable === targetVarId,
  );

  if (simState.activeTab === "box-view") {
    simState.boxPairs.forEach((pair, boxIdx) => {
      activeRelations.forEach((rel) => {
        // Only trigger animation if the source ball is active in current step (s-1)
        const sourceVal =
          simState.variableHistory[rel.from_variable]?.[simState.currentStep];
        if (sourceVal && sourceVal !== "N") {
          const pathEl = document.getElementById(
            `box-path-${boxIdx}-${rel.id}`,
          );
          if (pathEl) {
            // Fade-out source ball inside set as particle departs
            animateElementOpacity(
              `box-svg-${boxIdx}`,
              rel.from_variable,
              1,
              0,
              0,
            );

            // Animate particle along path
            animateParticleOnPath(pathEl, newVal, animDuration, () => {
              // Update target ball text/color and fade it in on arrival
              updateBallValAndShow(`box-svg-${boxIdx}`, targetVarId, newVal);
              animateElementOpacity(
                `box-svg-${boxIdx}`,
                targetVarId,
                0,
                1,
                300,
              );
            });
          }
        }
      });
    });
  } else {
    // Global Canvas View
    activeRelations.forEach((rel) => {
      const sourceVal =
        simState.variableHistory[rel.from_variable]?.[simState.currentStep];
      if (sourceVal && sourceVal !== "N") {
        const pathEl = document.getElementById(`global-path-${rel.id}`);
        if (pathEl) {
          // Fade-out source
          animateElementOpacityGlobal(rel.from_variable, 1, 0, 0);

          // Animate particle
          animateParticleOnPath(pathEl, newVal, animDuration, () => {
            // Update target and fade-in
            updateBallValAndShowGlobal(targetVarId, newVal);
            animateElementOpacityGlobal(targetVarId, 0, 1, 300);
          });
        }
      }
    });
  }
}

/**
 * Anima la opacidad de una variable en la vista Box.
 * Usado para fade-in/fade-out durante propagación.
 */
function animateElementOpacity(
  boxIdx,
  variableId,
  fromOpacity,
  toOpacity,
  duration,
) {
  const boxSvg = document.getElementById(`box-svg-${boxIdx}`);
  if (!boxSvg) return;
  const ballGroups = boxSvg.querySelectorAll(
    `[data-variable-id="${variableId}"]`,
  );
  ballGroups.forEach((ballGroup) => {
    const finalToOpacity = toOpacity === 0 ? 0.2 : toOpacity;
    const finalFromOpacity = fromOpacity === 0 ? 0.2 : fromOpacity;
    if (duration === 0) {
      ballGroup.style.opacity = finalToOpacity;
    } else {
      ballGroup.style.display = "";
      ballGroup.animate([{ opacity: finalFromOpacity }, { opacity: finalToOpacity }], {
        duration: duration,
        fill: "forwards",
        easing: "ease-in-out",
      });

      setTimeout(() => {
        ballGroup.style.opacity = finalToOpacity;
      }, duration);
    }
  });
}

/**
 * Anima la opacidad de una variable en la vista Global.
 * Versión global de animateElementOpacity.
 */
function animateElementOpacityGlobal(
  variableId,
  fromOpacity,
  toOpacity,
  duration,
) {
  const globalContainer = document.getElementById("globalCanvasContainer");
  if (!globalContainer) return;
  const ballGroups = globalContainer.querySelectorAll(
    `[data-variable-id="${variableId}"]`,
  );
  ballGroups.forEach((ballGroup) => {
    const finalToOpacity = toOpacity === 0 ? 0.2 : toOpacity;
    const finalFromOpacity = fromOpacity === 0 ? 0.2 : fromOpacity;
    if (duration === 0) {
      ballGroup.style.opacity = finalToOpacity;
    } else {
      ballGroup.style.display = "";
      ballGroup.animate([{ opacity: finalFromOpacity }, { opacity: finalToOpacity }], {
        duration: duration,
        fill: "forwards",
        easing: "ease-in-out",
      });

      setTimeout(() => {
        ballGroup.style.opacity = finalToOpacity;
      }, duration);
    }
  });
}

/**
 * Actualiza el valor y apariencia de una variable en la vista Box.
 * Cambia color y etiqueta según el nuevo valor Belnap.
 */
function updateBallValAndShow(boxIdx, variableId, value) {
  const boxSvg = document.getElementById(`box-svg-${boxIdx}`);
  if (!boxSvg) return;
  const ballGroup = boxSvg.querySelector(`[data-variable-id="${variableId}"]`);
  if (ballGroup) {
    const circle = ballGroup.querySelector("circle");
    const text = ballGroup.querySelector("text");
    if (circle)
      circle.className.baseVal = `svg-instance val-${value.toLowerCase()}`;
    if (text) text.textContent = `${variableId}:${value}`;
  }
}

/**
 * Actualiza el valor y apariencia de una variable en la vista Global.
 * Versión global de updateBallValAndShow.
 */
function updateBallValAndShowGlobal(variableId, value) {
  const globalContainer = document.getElementById("globalCanvasContainer");
  if (!globalContainer) return;
  const ballGroup = globalContainer.querySelector(
    `[data-variable-id="${variableId}"]`,
  );
  if (ballGroup) {
    const circle = ballGroup.querySelector("circle");
    const text = ballGroup.querySelector("text");
    if (circle)
      circle.className.baseVal = `svg-instance val-${value.toLowerCase()}`;
    if (text) text.textContent = `${variableId}:${value}`;
  }
}

/**
 * Anima una partícula de evidencia viajando por un path SVG.
 * La dirección depende del valor: V avanza, F retrocede (Modus Tollens).
 * Visualiza la propagación de evidencia en el grafo EPiC.
 */
function animateParticleOnPath(pathEl, value, duration, onComplete) {
  const svg = pathEl.ownerSVGElement;
  if (!svg) return;

  const totalLength = pathEl.getTotalLength();
  const particle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  particle.setAttribute("r", 6);

  const color =
    value === "V" ? "#10B981" : value === "F" ? "#EF4444" : "#8B5CF6";
  particle.setAttribute("fill", color);
  particle.setAttribute("filter", `drop-shadow(0 0 8px ${color})`);
  svg.appendChild(particle);

  const isNegative = value === "F";
  const startLength = isNegative ? totalLength : 0;
  const endLength = isNegative ? 0 : totalLength;

  let start = null;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);

    const currentLength = startLength + (endLength - startLength) * progress;
    const point = pathEl.getPointAtLength(currentLength);

    particle.setAttribute("cx", point.x);
    particle.setAttribute("cy", point.y);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      svg.removeChild(particle);
      if (onComplete) onComplete();
    }
  }

  requestAnimationFrame(animate);
}

function pulseTargetBall(boxIdx, variableId) {
  const boxSvgContainer = document.getElementById(`box-svg-${boxIdx}`);
  if (!boxSvgContainer) return;

  const balls = boxSvgContainer.querySelectorAll(
    `[data-variable-id="${variableId}"] circle`,
  );
  // User requested ball to be static on arrival
  /*
  balls.forEach(ball => {
    ball.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.4)" },
      { transform: "scale(1)" }
    ], { duration: 300, easing: "ease-out" });
  });
  */
}

// Pulse visual instances of a variable in the Global Canvas
function pulseTargetBallGlobal(variableId) {
  const gCanvas = document.getElementById("globalCanvasContainer");
  const balls = gCanvas.querySelectorAll(
    `[data-variable-id="${variableId}"] circle`,
  );
  // User requested ball to be static on arrival
  /*
  balls.forEach(ball => {
    ball.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.4)" },
      { transform: "scale(1)" }
    ], { duration: 300, easing: "ease-out" });
  });
  */
}

/**
 * Retrocede un paso en la simulación.
 * Cancela animaciones en curso y actualiza la UI.
 */
function stepBackward() {
  if (simState.animationTimeout) {
    clearTimeout(simState.animationTimeout);
    simState.animationTimeout = null;
  }
  if (simState.currentStep <= 0) return;

  simState.currentStep--;
  updateUI();
}

/**
 * Reinicia la simulación al paso 0.
 * Pausa la reproducción y limpia animaciones pendientes.
 */
function resetSimulation() {
  if (simState.animationTimeout) {
    clearTimeout(simState.animationTimeout);
    simState.animationTimeout = null;
  }
  simState.currentStep = 0;
  pause();
  updateUI();
}

function togglePlay() {
  if (simState.isPlaying) {
    pause();
  } else {
    play();
  }
}

function play() {
  simState.isPlaying = true;
  document.getElementById("playIcon").setAttribute("data-lucide", "pause");
  document.getElementById("playText").textContent = "Pausar";
  lucide.createIcons();

  simState.playInterval = setInterval(() => {
    if (simState.currentStep >= simState.maxStep) {
      pause();
    } else {
      stepForward();
    }
  }, simState.speed);
}

function pause() {
  simState.isPlaying = false;
  if (simState.playInterval) {
    clearInterval(simState.playInterval);
    simState.playInterval = null;
  }

  document.getElementById("playIcon").setAttribute("data-lucide", "play");
  document.getElementById("playText").textContent = "Reproducir";
  lucide.createIcons();
}




function jumpToStep(stepIdx) {
  pause();
  if (simState.animationTimeout) {
    clearTimeout(simState.animationTimeout);
    simState.animationTimeout = null;
  }
  simState.currentStep = stepIdx;
  updateUI();
}

