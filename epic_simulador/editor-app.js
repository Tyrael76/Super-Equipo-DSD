// EPiC Editor App Logic (Popup Window)

const EditorBridge = window.opener.EditorBridge;
let editorGraph = window.opener.editorGraph;
const loadSnapshot = window.opener.loadSnapshot;

// Listen for updates from main window
window.addEventListener('storage', (e) => {
    if (e.key === 'epicEditorSnapshot') {
        editorGraph = window.opener.editorGraph;
        syncEditorDropdowns();
        renderEditorPreview();
    }
});

const editorDragState = {
  draggedBallId: null,
  draggedSetId: null,
  dragStartOffset: { x: 0, y: 0 },
  pan: { x: 0, y: 0 },
  zoom: 1,
  isPanning: false,
  panStart: { x: 0, y: 0 },
  isDrawingRelation: false,
  sourceVariableId: null,
  tempTargetX: 0,
  tempTargetY: 0
};

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

function drawSetSVG(setId, setVal, cx, cy, radius) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "g-set-container");
  g.setAttribute("data-set-id", setId);
  g.setAttribute("id", `set-group-${setId}`);

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("id", `set-circle-${setId}`);
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", radius);
  circle.setAttribute("class", "svg-set");
  g.appendChild(circle);

  const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textId.setAttribute("id", `set-label-${setId}`);
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
    textConn.setAttribute("id", `set-conn-${setId}`);
    textConn.setAttribute("x", cx);
    textConn.setAttribute("y", cy - radius + 25);
    textConn.setAttribute("class", "svg-set-connective");
    textConn.textContent = `[${setVal.connective}]`;
    g.appendChild(textConn);
  }

  return g;
}

function drawBallSVG(varId, instId, x, y, value, isVisible = true) {
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "g-ball-container");
  g.setAttribute("data-instance-id", instId);
  g.setAttribute("data-variable-id", varId);
  g.setAttribute("id", `ball-group-${instId}`);
  g.setAttribute(
    "style",
    `opacity: ${isVisible ? 1 : 0}; transition: opacity 0.35s ease-in-out;`,
  );

  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  circle.setAttribute("id", `ball-circle-${instId}`);
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 15);
  circle.setAttribute("class", `svg-instance val-${value.toLowerCase()}`);
  g.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("id", `ball-label-${instId}`);
  text.setAttribute("x", x);
  text.setAttribute("y", y + 4);
  text.setAttribute("class", "svg-instance-label");
  text.textContent = `${varId}:${value}`;
  g.appendChild(text);

  return g;
}

function setupEditorEventListeners() {
  document
    .getElementById("btnEditAddSet")
    .addEventListener("click", editorAddSet);
  document
    .getElementById("btnEditAddVar")
    .addEventListener("click", editorAddVariable);
  document
    .getElementById("btnEditAddRel")
    .addEventListener("click", editorAddRelation);
  document
    .getElementById("btnResetEditor")
    .addEventListener("click", resetEditorGraph);
  document
    .getElementById("btnCalculateAPI")
    .addEventListener("click", calculateWithAPI);
  document
    .getElementById("btnEditParseFormula")
    .addEventListener("click", () => {
      const formula = document.getElementById("editFormulaInput").value.trim();
      if (!formula) return;

      const vars = EditorBridge.extractFormulaVariables(formula);
      if (vars.length === 0) return;

      const container = document.getElementById("formulaVarValuesContainer");
      const fieldsDiv = document.getElementById("formulaVarFields");
      fieldsDiv.innerHTML = "";

      vars.forEach(vName => {
        const field = document.createElement("div");
        field.style.display = "flex";
        field.style.flexDirection = "column";
        field.innerHTML = `
          <label style="font-size: 0.8rem; margin-bottom: 2px;">${vName}</label>
          <select class="formula-var-select" data-var="${vName}" style="padding: 2px 4px; font-size: 0.85rem;">
            <option value="N">N</option>
            <option value="V">V</option>
            <option value="F">F</option>
            <option value="B">B</option>
          </select>
        `;
        fieldsDiv.appendChild(field);
      });

      container.style.display = "block";
    });

  document
    .getElementById("btnConfirmParseFormula")
    .addEventListener("click", () => {
      const formula = document.getElementById("editFormulaInput").value.trim();
      if (!formula) return;

      const initialValues = {};
      document.querySelectorAll(".formula-var-select").forEach(select => {
        initialValues[select.getAttribute("data-var")] = select.value;
      });

      // Limpiar el lienzo antes de generar el nuevo diagrama
      EditorBridge.resetEditor();

      EditorBridge.parseFormula(formula, initialValues);
      
      const state = EditorBridge.getEditorState();
      editorGraph.logic = JSON.parse(JSON.stringify(state.snapshot.logic));
      editorGraph.sets = JSON.parse(JSON.stringify(state.snapshot.visual.sets));
      editorGraph.instances = JSON.parse(JSON.stringify(state.snapshot.visual.instances));
      editorGraph.relations = JSON.parse(JSON.stringify(state.snapshot.visual.relations));
      
      syncEditorDropdowns();
      renderEditorPreview();

      document.getElementById("formulaVarValuesContainer").style.display = "none";
    });

  document.querySelectorAll(".keyword-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = document.getElementById("editFormulaInput");
      const keyword = btn.getAttribute("data-keyword");
      const startPos = input.selectionStart || input.value.length;
      const endPos = input.selectionEnd || input.value.length;
      input.value = input.value.substring(0, startPos) + keyword + input.value.substring(endPos);
      input.focus();
      input.setSelectionRange(startPos + keyword.length, startPos + keyword.length);
    });
  });

  document.getElementById("btnExportEditor")?.addEventListener("click", () => {
    if (!EditorBridge.isInitialized()) return;
    const state = EditorBridge.getEditorState();
    const snapshotStr = JSON.stringify(state.snapshot, null, 2);
    const blob = new Blob([snapshotStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "epic-snapshot.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  const zoomFactor = 1.2;

  document.getElementById("btnEditorZoomIn")?.addEventListener("click", () => {
    editorDragState.zoom = Math.min((editorDragState.zoom || 1) * zoomFactor, 5);
    const g = document.getElementById("editorCanvasGroup");
    if (g) {
      g.setAttribute(
        "transform",
        `translate(${editorDragState.pan.x}, ${editorDragState.pan.y}) scale(${editorDragState.zoom})`
      );
    }
  });

  document.getElementById("btnEditorZoomOut")?.addEventListener("click", () => {
    editorDragState.zoom = Math.max((editorDragState.zoom || 1) / zoomFactor, 0.2);
    const g = document.getElementById("editorCanvasGroup");
    if (g) {
      g.setAttribute(
        "transform",
        `translate(${editorDragState.pan.x}, ${editorDragState.pan.y}) scale(${editorDragState.zoom})`
      );
    }
  });

  document.getElementById("btnEditorZoomReset")?.addEventListener("click", () => {
    editorDragState.zoom = 1;
    editorDragState.pan = { x: 0, y: 0 };
    const g = document.getElementById("editorCanvasGroup");
    if (g) {
      g.setAttribute(
        "transform",
        `translate(${editorDragState.pan.x}, ${editorDragState.pan.y}) scale(${editorDragState.zoom})`
      );
    }
  });

  document
    .getElementById("manageEntityType")
    .addEventListener("change", syncManageDropdown);
  document
    .getElementById("manageEntityId")
    .addEventListener("change", () => {
      renderManageEditFields();
      renderEditorPreview();
    });
  document
    .getElementById("btnManageDelete")
    .addEventListener("click", handleManageDelete);

  syncEditorDropdowns();
}

function syncManageDropdown() {
  const type = document.getElementById("manageEntityType").value;
  const idDropdown = document.getElementById("manageEntityId");
  idDropdown.innerHTML = '<option value="">Elemento...</option>';

  if (type === "set") {
    Object.keys(editorGraph.sets).forEach((id) => {
      idDropdown.innerHTML += `<option value="${id}">${id}</option>`;
    });
  } else if (type === "variable") {
    editorGraph.logic.variables.forEach((v) => {
      idDropdown.innerHTML += `<option value="${v.id}">${v.id}</option>`;
    });
  } else if (type === "relation") {
    editorGraph.logic.relations.forEach((r) => {
      idDropdown.innerHTML += `<option value="${r.id}">${r.id} (${r.from_variable}->${r.to_variable})</option>`;
    });
  }

  renderManageEditFields();
}

function renderManageEditFields() {
  const type = document.getElementById("manageEntityType").value;
  const id = document.getElementById("manageEntityId").value;
  const fieldsContainer = document.getElementById("manageEditFields");

  if (!id || !type) {
    fieldsContainer.style.display = "none";
    fieldsContainer.innerHTML = "";
    return;
  }

  fieldsContainer.style.display = "flex";
  fieldsContainer.innerHTML = "";

  if (type === "set") {
    const setLog = editorGraph.logic.sets.find((s) => s.id === id);
    const conn = setLog ? setLog.connective : "PROPAGATION";
    const setVis = editorGraph.sets[id] || { radius: 65 };
    fieldsContainer.innerHTML = `
      <select id="editManageSetConn" title="Conectivo lógico">
        <option value="PROPAGATION" ${conn === "PROPAGATION" ? "selected" : ""}>PROPAGATION</option>
        <option value="CONTRAPOSITIONAL" ${conn === "CONTRAPOSITIONAL" ? "selected" : ""}>CONTRAPOSITIONAL</option>
        <option value="AND" ${conn === "AND" ? "selected" : ""}>AND</option>
        <option value="OR" ${conn === "OR" ? "selected" : ""}>OR</option>
        <option value="IMPLIES" ${conn === "IMPLIES" ? "selected" : ""}>IMPLIES</option>
        <option value="BICONDITIONAL" ${conn === "BICONDITIONAL" ? "selected" : ""}>BICONDITIONAL</option>
      </select>
      <div style="display: flex; align-items: center; gap: 0.5rem; width: 100%;">
        <span style="font-size: 0.875rem;">Radio:</span>
        <input type="range" id="editManageSetRadius" min="40" max="250" value="${setVis.radius}" style="flex-grow: 1;">
      </div>
      <button class="btn btn-primary" onclick="handleManageUpdate()">Guardar</button>
    `;
    
    // Live update for radius
    setTimeout(() => {
      const radiusInput = document.getElementById("editManageSetRadius");
      if (radiusInput) {
        radiusInput.addEventListener("input", (e) => {
          if (editorGraph.sets[id]) {
            editorGraph.sets[id].radius = parseInt(e.target.value, 10);
            updateEditorViewPositions(); // Live update SVG without saving
          }
        });
      }
    }, 0);
  } else if (type === "variable") {
    const vLog = editorGraph.logic.variables.find((v) => v.id === id);
    const val = vLog ? vLog.truth_value : "N";
    fieldsContainer.innerHTML = `
      <select id="editManageVarVal">
        <option value="N" ${val === "N" ? "selected" : ""}>N</option>
        <option value="V" ${val === "V" ? "selected" : ""}>V</option>
        <option value="F" ${val === "F" ? "selected" : ""}>F</option>
        <option value="B" ${val === "B" ? "selected" : ""}>B</option>
      </select>
      <button class="btn btn-primary" onclick="handleManageUpdate()">Guardar</button>
    `;
  } else if (type === "relation") {
    const rLog = editorGraph.logic.relations.find((r) => r.id === id);
    const conn = rLog ? rLog.connective : "PROPAGATION";
    fieldsContainer.innerHTML = `
      <select id="editManageRelConn">
        <option value="PROPAGATION" ${conn === "PROPAGATION" ? "selected" : ""}>PROPAGATION</option>
        <option value="CONTRAPOSITIONAL" ${conn === "CONTRAPOSITIONAL" ? "selected" : ""}>CONTRAPOSITIONAL</option>
        <option value="IMPLIES" ${conn === "IMPLIES" ? "selected" : ""}>IMPLIES</option>
      </select>
      <button class="btn btn-primary" onclick="handleManageUpdate()">Guardar</button>
    `;
  }
}

function handleManageDelete() {
  const type = document.getElementById("manageEntityType").value;
  const id = document.getElementById("manageEntityId").value;
  if (!id || !type) return;

  if (type === "set") {
    const res = EditorBridge.deleteSet(id);
    if (res.ok) {
      delete editorGraph.sets[id];
      editorGraph.logic.sets = editorGraph.logic.sets.filter(
        (s) => s.id !== id,
      );

      editorGraph.logic.variables = editorGraph.logic.variables.filter((v) => {
        if (v.memberships.includes(id)) {
          if (v.memberships.length === 1) {
            // Remove relations involving this orphaned variable
            editorGraph.logic.relations = editorGraph.logic.relations.filter(
              (r) => r.from_variable !== v.id && r.to_variable !== v.id,
            );
            // Remove instance visual
            const instId = `inst_${v.id}`;
            delete editorGraph.instances[instId];
            return false; // exclude from variables array
          } else {
            v.memberships = v.memberships.filter((m) => m !== id);
            return true;
          }
        }
        return true;
      });
    }
  } else if (type === "variable") {
    const res = EditorBridge.deleteVariable(id);
    if (res.ok) {
      editorGraph.logic.variables = editorGraph.logic.variables.filter(
        (v) => v.id !== id,
      );
      editorGraph.logic.relations = editorGraph.logic.relations.filter(
        (r) => r.from_variable !== id && r.to_variable !== id,
      );
      const instId = `inst_${id}`;
      delete editorGraph.instances[instId];
    }
  } else if (type === "relation") {
    const res = EditorBridge.deleteRelation(id);
    if (res.ok) {
      editorGraph.logic.relations = editorGraph.logic.relations.filter(
        (r) => r.id !== id,
      );
      delete editorGraph.relations[id];
    }
  }

  syncManageDropdown();
  syncEditorDropdowns();
  renderEditorPreview();
  console.log("[Simulator] Elemento eliminado:", id);
}

function resetEditorGraph() {
  console.log("[Simulator] Reiniciando editor...");

  // Reiniciar el bridge (esto crea un nuevo EditorController)
  EditorBridge.resetEditor();

  // Limpiar el editorGraph local (mantener compatibilidad con código existente)
  editorGraph = {
    sets: {},
    instances: {},
    relations: {},
    logic: {
      variables: [],
      sets: [],
      relations: [],
    },
  };

  syncEditorDropdowns();
  renderEditorPreview();
  document.getElementById("apiErrorLog").style.display = "none";

  console.log("[Simulator] Editor reiniciado");
}

function editorAddSet() {
  const nameInput = document.getElementById("editSetName");
  const id = nameInput.value.trim().replace(/\s+/g, "_");
  const connective = document.getElementById("editSetConnective").value;
  const color = document.getElementById("editSetColor").value;

  if (!id) {
    alert("Por favor ingresa un nombre para el conjunto");
    return;
  }

  // Calcular posición automática
  const state = EditorBridge.getEditorState();
  const count = state
    ? state.snapshot.logic.sets.length
    : Object.keys(editorGraph.sets).length;
  const x = 120 + count * 220;
  const y = 150;
  const radius = 65;

  // Usar el bridge para crear el conjunto
  const result = EditorBridge.createSet(id, connective, x, y, radius, color);

  if (!result.ok) {
    alert(
      result.errors ? result.errors[0].message : "Error al crear el conjunto",
    );
    return;
  }

  // Actualizar editorGraph local para compatibilidad
  editorGraph.logic.sets.push({
    id,
    connective,
    subsets: [],
    result_alias: null,
  });

  editorGraph.sets[id] = {
    x,
    y,
    radius,
    shape: "circle",
    connective,
    color,
  };

  nameInput.value = "";
  syncEditorDropdowns();
  renderEditorPreview();

  console.log("[Simulator] Conjunto creado:", id);
}

function editorAddVariable() {
  const nameInput = document.getElementById("editVarName");
  const id = nameInput.value.trim().replace(/\s+/g, "_");
  const setId = document.getElementById("editVarSet").value;
  const val = document.getElementById("editVarVal").value;

  if (!id) {
    alert("Por favor ingresa un nombre para la variable");
    return;
  }
  if (!setId) {
    alert("Por favor selecciona un conjunto contenedor");
    return;
  }

  // Crear la variable lógica usando el bridge
  const varResult = EditorBridge.createVariable(id, val);

  if (!varResult.ok) {
    alert(
      varResult.errors
        ? varResult.errors[0].message
        : "Error al crear la variable",
    );
    return;
  }

  // Asignar la variable al conjunto en el controller (fix memberships)
  EditorBridge.assignVariableToSet(id, setId);

  // Calcular posición visual dentro del conjunto
  const parentSet = editorGraph.sets[setId];
  if (!parentSet) {
    alert("Conjunto no encontrado");
    return;
  }

  const varsInSet = editorGraph.logic.variables.filter((v) =>
    v.memberships.includes(setId),
  ).length;

  let dx = 0,
    dy = 0;
  if (varsInSet === 0) {
    dx = 0;
    dy = 0;
  } else if (varsInSet === 1) {
    dx = -20;
    dy = 15;
  } else if (varsInSet === 2) {
    dx = 20;
    dy = 15;
  } else if (varsInSet === 3) {
    dx = 0;
    dy = -25;
  } else {
    dx = (Math.random() - 0.5) * 40;
    dy = (Math.random() - 0.5) * 40;
  }

  const instId = `inst_${id}`;
  const x = parentSet.x + dx;
  const y = parentSet.y + dy;

  // Crear la instancia visual usando el bridge
  const instResult = EditorBridge.createVariableInstance(instId, id, x, y);

  if (!instResult.ok) {
    alert(
      instResult.errors
        ? instResult.errors[0].message
        : "Error al crear la instancia visual",
    );
    return;
  }

  // Actualizar editorGraph local para compatibilidad
  editorGraph.logic.variables.push({
    id,
    truth_value: val,
    memberships: [setId],
  });

  editorGraph.instances[instId] = {
    id: instId,
    variable_id: id,
    x,
    y,
  };

  nameInput.value = "";
  syncEditorDropdowns();
  renderEditorPreview();

  console.log("[Simulator] Variable creada:", id);
}

function editorAddRelation() {
  const fromVar = document.getElementById("editRelFrom").value;
  const toVar = document.getElementById("editRelTo").value;
  const connective = document.getElementById("editRelConnective").value;
  const color = document.getElementById("editRelColor").value;
  const direction = document.getElementById("editRelDirection").value;

  if (!fromVar || !toVar) {
    alert("Por favor selecciona origen y destino");
    return;
  }
  if (fromVar === toVar) {
    alert("No se puede conectar una variable consigo misma");
    return;
  }

  const id = `rel_${fromVar}_to_${toVar}`;

  // Crear la relación usando el bridge
  const result = EditorBridge.createRelation(
    id,
    fromVar,
    toVar,
    connective,
    color,
    direction,
  );

  if (!result.ok) {
    alert(
      result.errors ? result.errors[0].message : "Error al crear la relación",
    );
    return;
  }

  // Actualizar editorGraph local para compatibilidad
  editorGraph.logic.relations.push({
    id,
    from_variable: fromVar,
    to_variable: toVar,
    connective,
  });

  editorGraph.relations[id] = {
    color: color,
    thickness: 2,
    direction: direction,
  };

  renderEditorPreview();

  console.log("[Simulator] Relación creada:", id);
}

function syncEditorDropdowns() {
  const varSetDropdown = document.getElementById("editVarSet");
  const relFromDropdown = document.getElementById("editRelFrom");
  const relToDropdown = document.getElementById("editRelTo");

  varSetDropdown.innerHTML = '<option value="">Selecciona Conjunto...</option>';
  relFromDropdown.innerHTML = '<option value="">Origen...</option>';
  relToDropdown.innerHTML = '<option value="">Destino...</option>';

  Object.keys(editorGraph.sets).forEach((setId) => {
    varSetDropdown.innerHTML += `<option value="${setId}">${setId}</option>`;
  });

  editorGraph.logic.variables.forEach((v) => {
    relFromDropdown.innerHTML += `<option value="${v.id}">${v.id}</option>`;
    relToDropdown.innerHTML += `<option value="${v.id}">${v.id}</option>`;
  });

  syncManageDropdown();
}

function renderEditorPreview() {
  const container = document.getElementById("editorPreviewContainer");
  container.innerHTML = "";

  const sets = Object.entries(editorGraph.sets);
  const vars = editorGraph.logic.variables;
  const rels = editorGraph.logic.relations;

  if (sets.length === 0) {
    container.innerHTML = `<div class="trace-placeholder">Lienzo vacío. Añade un conjunto para iniciar.</div>`;
    return;
  }

  const selectedType = document.getElementById("manageEntityType")?.value;
  const selectedId = document.getElementById("manageEntityId")?.value;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 650 300");
  svg.style.width = "100%";
  svg.style.height = "100%";
  container.appendChild(svg);

  const mainGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  mainGroup.setAttribute("id", "editorCanvasGroup");
  mainGroup.setAttribute(
    "transform",
    `translate(${editorDragState.pan.x}, ${editorDragState.pan.y}) scale(${editorDragState.zoom})`
  );
  svg.appendChild(mainGroup);

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  svg.appendChild(defs); // defs can be appended to svg directly

  // Create dynamic markers for each relation with its specific color
  rels.forEach((rel) => {
    const visualRel = editorGraph.relations[rel.id] || {
      color: "#3B82F6",
      thickness: 2,
    };
    let markerColor =
      visualRel.color ||
      (rel.connective === "CONTRAPOSITIONAL" ? "#EC4899" : "#3B82F6");

    const effectiveOp = getRelationEffectiveOp(rel, editorGraph.logic);
    if (effectiveOp) {
      const fromVar = vars.find((v) => v.id === rel.from_variable);
      const toVar = vars.find((v) => v.id === rel.to_variable);
      const valFrom = fromVar ? fromVar.truth_value : "N";
      const valTo = toVar ? toVar.truth_value : "N";
      markerColor = getColorForValue(
        evaluateBelnapMatrix(effectiveOp, valFrom, valTo),
      );
    }

    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker",
    );
    marker.setAttribute("id", `arrow-editor-${rel.id}`);
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

  sets.forEach(([setId, val]) => {
    const currentX = val.editor_x !== undefined ? val.editor_x : val.x;
    const currentY = val.editor_y !== undefined ? val.editor_y : val.y;
    const gSet = drawSetSVG(setId, val, currentX, currentY, val.radius);
    
    if (selectedType === "set" && selectedId === setId) {
      // Logic removed, handled by updateEditorHighlights
    }
    
    mainGroup.appendChild(gSet);
  });

  const ballCoords = {};

  vars.forEach((v) => {
    const inst = Object.values(editorGraph.instances).find(
      (i) => i.variable_id === v.id,
    );
    if (!inst) return;

    let currentX = inst.editor_x !== undefined ? inst.editor_x : inst.x;
    let currentY = inst.editor_y !== undefined ? inst.editor_y : inst.y;

    // Clamp ball to its parent set
    if (v.memberships && v.memberships.length > 0) {
      const parentSetId = v.memberships[0];
      const parentSet = editorGraph.sets[parentSetId];
      if (parentSet) {
        const pX = parentSet.editor_x !== undefined ? parentSet.editor_x : parentSet.x;
        const pY = parentSet.editor_y !== undefined ? parentSet.editor_y : parentSet.y;
        
        let dx = currentX - pX;
        let dy = currentY - pY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const safeRadius = Math.max(10, parentSet.radius - 20);
        
        if (dist > safeRadius) {
          if (dist === 0) {
            dx = 0;
            dy = 0;
          } else {
            const scale = safeRadius / dist;
            dx = dx * scale;
            dy = dy * scale;
          }
          currentX = pX + dx;
          currentY = pY + dy;
          inst.editor_x = currentX;
          inst.editor_y = currentY;
        }
      }
    }

    const gBall = drawBallSVG(v.id, inst.id, currentX, currentY, v.truth_value);
    
    if (selectedType === "variable" && selectedId === v.id) {
      // Logic removed, handled by updateEditorHighlights
    }
    
    mainGroup.appendChild(gBall);
    ballCoords[v.id] = { x: currentX, y: currentY };
  });

  rels.forEach((rel) => {
    const fromCoord = ballCoords[rel.from_variable];
    const toCoord = ballCoords[rel.to_variable];

    if (fromCoord && toCoord) {

      const visualRel = editorGraph.relations[rel.id] || {
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
      path.setAttribute("id", `editor-path-${rel.id}`);

      let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
      if (Math.abs(dy) > 10 && Math.abs(dx) > 10) {
        const midX = (startX + endX) / 2 + (dy / len) * 15;
        const midY = (startY + endY) / 2 - (dx / len) * 15;
        pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
      }

      path.setAttribute("d", pathD);
      let strokeColor =
        visualRel.color ||
        (rel.connective === "CONTRAPOSITIONAL" ? "#EC4899" : "#3B82F6");
      const effectiveOp = getRelationEffectiveOp(rel, editorGraph.logic);
      if (effectiveOp) {
        const fromVar = vars.find((v) => v.id === rel.from_variable);
        const toVar = vars.find((v) => v.id === rel.to_variable);
        const valFrom = fromVar ? fromVar.truth_value : "N";
        const valTo = toVar ? toVar.truth_value : "N";
        strokeColor = getColorForValue(
          evaluateBelnapMatrix(effectiveOp, valFrom, valTo),
        );
      }
      path.setAttribute(
        "class",
        `svg-relation-path ${rel.connective === "CONTRAPOSITIONAL" ? "contrapositive" : ""}`,
      );
      path.setAttribute("stroke", strokeColor);
      path.setAttribute("stroke-width", visualRel.thickness || 2);
      path.setAttribute("marker-end", `url(#arrow-editor-${rel.id})`);
      if (visualRel.direction === "bidirectional") {
        path.setAttribute("marker-start", `url(#arrow-editor-${rel.id})`);
      }

      if (selectedType === "relation" && selectedId === rel.id) {
        // Logic removed, handled by updateEditorHighlights
      }

      path.setAttribute("data-relation-id", rel.id);

      // Create an invisible thick path for easier clicking
      const hitPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      hitPath.setAttribute("d", pathD);
      hitPath.setAttribute("class", "svg-relation-hitarea");
      hitPath.setAttribute("stroke", "transparent");
      hitPath.setAttribute("stroke-width", 15);
      hitPath.setAttribute("fill", "none");
      hitPath.setAttribute("data-relation-id", rel.id);
      hitPath.style.cursor = "pointer";

      mainGroup.appendChild(path);
      mainGroup.appendChild(hitPath);

      // Label for connective
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("id", `editor-path-label-${rel.id}`);
      text.setAttribute("x", (startX + endX) / 2);
      text.setAttribute("y", (startY + endY) / 2 - 10);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", strokeColor);
      text.setAttribute("font-size", "12px");
      text.setAttribute("font-family", "Arial");
      text.textContent = rel.connective;
      mainGroup.appendChild(text);
    }
  });

  updateEditorHighlights();
}

async function calculateWithAPI() {
  const errorLog = document.getElementById("apiErrorLog");
  errorLog.style.display = "none";
  errorLog.innerHTML = "";

  console.log(
    "[Simulator] Iniciando cálculo con Motor API usando EditorBridge...",
  );

  // Verificar que el bridge esté inicializado
  if (!EditorBridge.isInitialized()) {
    errorLog.style.display = "block";
    errorLog.innerHTML = `<strong>Error:</strong> El Editor Bridge no está inicializado.<br><small>Recarga la página e intenta de nuevo.</small>`;
    return;
  }

  const state = EditorBridge.getEditorState();

  if (!state || state.snapshot.logic.variables.length === 0) {
    alert("Añade al menos una variable antes de calcular");
    return;
  }

  console.log("[Simulator] Estado del editor:", state);

  // Validar el snapshot antes de enviar
  console.log("[Simulator] Validando snapshot...");
  const validation = EditorBridge.validateSnapshot();

  if (!validation.valid) {
    console.error("[Simulator] Validación fallida:", validation.errors);
    errorLog.style.display = "block";
    errorLog.innerHTML = `<strong>Errores de Validación:</strong><ul>`;
    validation.errors.forEach((err) => {
      errorLog.innerHTML += `<li><strong>${err.field}:</strong> ${err.message}</li>`;
    });
    errorLog.innerHTML += `</ul>`;
    return;
  }

  console.log("[Simulator] Snapshot válido, ejecutando con motor...");

  try {
    // Ejecutar usando el bridge (incluye validación y comunicación con el motor)
    const result = await EditorBridge.executeWithMotor();

    if (!result.ok) {
      console.error("[Simulator] Error en ejecución:", result.errors);
      errorLog.style.display = "block";
      errorLog.innerHTML = `<strong>Error al ejecutar:</strong><ul>`;
      result.errors.forEach((err) => {
        errorLog.innerHTML += `<li><strong>${err.field}:</strong> ${err.message}</li>`;
      });
      errorLog.innerHTML += `</ul>`;
      return;
    }

    console.log("[Simulator] Ejecución exitosa:", result);

    // Obtener el snapshot actualizado con la traza de ejecución
    const finalSnapshot = result.snapshot;

    if (!finalSnapshot || !finalSnapshot.execution_trace) {
      throw new Error("El motor no devolvió una traza de ejecución válida");
    }

    console.log("[Simulator] Cargando snapshot con traza de ejecución...");

    // Cargar el snapshot en el simulador para visualizar la animación
    loadSnapshot(finalSnapshot);

    // Cambiar a la vista de cajitas para ver la animación
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      if (btn.getAttribute("data-tab") === "box-view") {
        btn.click();
      }
    });

    // Esperar un momento para que el DOM se actualice y luego iniciar la reproducción automática
    setTimeout(() => {
      play();
    }, 300);

    alert(
      "¡Éxito! Propagación calculada por el motor. Reproduciendo animación.",
    );
    console.log("[Simulator] Cálculo completado exitosamente");
  } catch (err) {
    console.error("[Simulator] Excepción durante cálculo:", err);
    errorLog.style.display = "block";
    errorLog.innerHTML = `<strong>Error de conexión al Motor:</strong> ${err.message}<br><br><small>Verifica que el servidor FastAPI esté encendido en http://localhost:8000</small>`;
  }
}

function displayEditorErrors(errors) {
  const errorLog = document.getElementById("apiErrorLog");
  if (!errorLog) return;

  errorLog.style.display = "block";
  errorLog.innerHTML = `<strong>Errores del Editor:</strong><ul>`;
  errors.forEach((err) => {
    errorLog.innerHTML += `<li><strong>${err.field}:</strong> ${err.message} (${err.severity})</li>`;
  });
  errorLog.innerHTML += `</ul>`;
}

function updateEditorHighlights() {
  const container = document.getElementById("editorPreviewContainer");
  if (!container) return;

  const selectedType = document.getElementById("manageEntityType")?.value;
  const selectedId = document.getElementById("manageEntityId")?.value;

  // Render original states by calling renderEditorPreview...
  // WAIT, doing renderEditorPreview here destroys the elements during a mousedown!
  // Instead, let's just reset all highlights and apply the new one.
  
  // 1. Remove all highlights
  container.querySelectorAll('.g-set-container circle').forEach(c => {
    c.removeAttribute('stroke-dasharray');
    c.removeAttribute('stroke');
    c.removeAttribute('stroke-width');
  });

  container.querySelectorAll('.g-ball-container circle').forEach(c => {
    const originalStroke = c.getAttribute('data-original-stroke');
    if (originalStroke) {
      c.setAttribute('stroke', originalStroke);
      c.setAttribute('stroke-width', c.getAttribute('data-original-stroke-width') || '1');
    }
  });

  container.querySelectorAll('.svg-relation-path').forEach(p => {
    const originalStroke = p.getAttribute('data-original-stroke');
    if (originalStroke) {
      p.setAttribute('stroke', originalStroke);
      p.setAttribute('stroke-width', p.getAttribute('data-original-stroke-width') || '2');
    }
  });

  // 2. Apply new highlight
  if (selectedType === "set" && selectedId) {
    const gSet = container.querySelector(`#set-group-${selectedId}`);
    if (gSet) {
      const c = gSet.querySelector('circle');
      if (c) {
        c.setAttribute('stroke', '#ffeb3b');
        c.setAttribute('stroke-width', '4');
        c.setAttribute('stroke-dasharray', '5,5');
      }
    }
  } else if (selectedType === "variable" && selectedId) {
    // Find instance(s) for this variable
    const balls = container.querySelectorAll('.g-ball-container');
    balls.forEach(b => {
      const instId = b.getAttribute('data-instance-id');
      if (instId && editorGraph.instances[instId] && editorGraph.instances[instId].variable_id === selectedId) {
        const c = b.querySelector('circle');
        if (c) {
          if (!c.hasAttribute('data-original-stroke')) {
            c.setAttribute('data-original-stroke', c.getAttribute('stroke') || 'none');
            c.setAttribute('data-original-stroke-width', c.getAttribute('stroke-width') || '1');
          }
          c.setAttribute('stroke', '#ffeb3b');
          c.setAttribute('stroke-width', '4');
        }
      }
    });
  } else if (selectedType === "relation" && selectedId) {
    const path = container.querySelector(`#editor-path-${selectedId}`);
    if (path) {
      if (!path.hasAttribute('data-original-stroke')) {
        path.setAttribute('data-original-stroke', path.getAttribute('stroke') || '#3B82F6');
        path.setAttribute('data-original-stroke-width', path.getAttribute('stroke-width') || '2');
      }
      path.setAttribute('stroke', '#ffeb3b');
      path.setAttribute('stroke-width', '6');
    }
  }
}

function selectEditorElement(type, id) {
  const typeSelect = document.getElementById("manageEntityType");
  if (!typeSelect) return;
  
  typeSelect.value = type;
  // Trigger change to populate entity IDs
  typeSelect.dispatchEvent(new Event("change"));
  
  const idSelect = document.getElementById("manageEntityId");
  if (idSelect) {
    idSelect.value = id;
  }
  
  if (typeof renderManageEditFields === "function") {
    renderManageEditFields();
  }
  
  updateEditorHighlights();
}

function initEditorDragEvents() {
  const container = document.getElementById("editorPreviewContainer");
  if (!container) return;

  container.addEventListener("mousedown", (e) => {
    const relHitArea = e.target.closest(".svg-relation-hitarea");
    const setNode = e.target.closest(".g-set-container");
    const ballNode = e.target.closest(".g-ball-container");

    let setIdToDrag = null;
    let ballIdToDrag = null;

    if (setNode) {
      setIdToDrag = setNode.getAttribute("data-set-id");
    } else if (ballNode) {
      const instId = ballNode.getAttribute("data-instance-id");
      if (instId && editorGraph.instances[instId]) {
        // If the ball belongs to a set, drag the set instead
        const varId = editorGraph.instances[instId].variable_id;
        const vLogic = editorGraph.logic.variables.find((v) => v.id === varId);
        if (vLogic && vLogic.memberships && vLogic.memberships.length > 0) {
          setIdToDrag = vLogic.memberships[0]; // drag the parent set
        } else {
          ballIdToDrag = instId; // standalone ball
        }
      }
    }

    const svgRect = container.getBoundingClientRect();
    const ptX = (e.clientX - svgRect.left - editorDragState.pan.x) / editorDragState.zoom;
    const ptY = (e.clientY - svgRect.top - editorDragState.pan.y) / editorDragState.zoom;

    if (relHitArea) {
      const relId = relHitArea.getAttribute("data-relation-id");
      if (relId) {
        selectEditorElement("relation", relId);
        return; // Don't drag relations
      }

    }

    if (e.shiftKey && ballNode) {
      const instId = ballNode.getAttribute("data-instance-id");
      if (instId && editorGraph.instances[instId]) {
        const varId = editorGraph.instances[instId].variable_id;
        editorDragState.isDrawingRelation = true;
        editorDragState.sourceVariableId = varId;
        editorDragState.tempTargetX = ptX;
        editorDragState.tempTargetY = ptY;
        selectEditorElement("variable", varId);
        return;
      }
    }

    if (setIdToDrag) {
      selectEditorElement("set", setIdToDrag);
    } else if (ballIdToDrag && editorGraph.instances[ballIdToDrag]) {
      const varId = editorGraph.instances[ballIdToDrag].variable_id;
      selectEditorElement("variable", varId);
    }

    if (setIdToDrag && editorGraph.sets[setIdToDrag]) {
      editorDragState.draggedSetId = setIdToDrag;
      const setVal = editorGraph.sets[setIdToDrag];
      const currentX =
        setVal.editor_x !== undefined ? setVal.editor_x : setVal.x;
      const currentY =
        setVal.editor_y !== undefined ? setVal.editor_y : setVal.y;
      editorDragState.dragStartOffset = {
        x: currentX - ptX,
        y: currentY - ptY,
      };
    } else if (ballIdToDrag) {
      editorDragState.draggedBallId = ballIdToDrag;
      const inst = editorGraph.instances[ballIdToDrag];
      const currentX = inst.editor_x !== undefined ? inst.editor_x : inst.x;
      const currentY = inst.editor_y !== undefined ? inst.editor_y : inst.y;
      editorDragState.dragStartOffset = {
        x: currentX - ptX,
        y: currentY - ptY,
      };
    } else {
      editorDragState.isPanning = true;
      editorDragState.panStart = {
        x: e.clientX - editorDragState.pan.x,
        y: e.clientY - editorDragState.pan.y,
      };
    }
  });

  window.addEventListener("mousemove", (e) => {
    const svgRect = document
      .getElementById("editorPreviewContainer")
      .getBoundingClientRect();
    const ptX = (e.clientX - svgRect.left - editorDragState.pan.x) / editorDragState.zoom;
    const ptY = (e.clientY - svgRect.top - editorDragState.pan.y) / editorDragState.zoom;

    if (editorDragState.isDrawingRelation) {
      editorDragState.tempTargetX = ptX;
      editorDragState.tempTargetY = ptY;
      updateEditorViewPositions();
      return;
    }

    if (editorDragState.draggedSetId) {
      const setId = editorDragState.draggedSetId;
      const setVal = editorGraph.sets[setId];

      const newX = ptX + editorDragState.dragStartOffset.x;
      const newY = ptY + editorDragState.dragStartOffset.y;

      const prevX = setVal.editor_x !== undefined ? setVal.editor_x : setVal.x;
      const prevY = setVal.editor_y !== undefined ? setVal.editor_y : setVal.y;

      const dx = newX - prevX;
      const dy = newY - prevY;

      setVal.editor_x = newX;
      setVal.editor_y = newY;

      // Update coordinates of all balls belonging to this set
      editorGraph.logic.variables.forEach((v) => {
        if (v.memberships && v.memberships.includes(setId)) {
          const inst = Object.values(editorGraph.instances).find(
            (i) => i.variable_id === v.id,
          );
          if (inst) {
            inst.editor_x =
              (inst.editor_x !== undefined ? inst.editor_x : inst.x) + dx;
            inst.editor_y =
              (inst.editor_y !== undefined ? inst.editor_y : inst.y) + dy;
          }
        }
      });

      updateEditorViewPositions();
    } else if (editorDragState.draggedBallId) {
      const instId = editorDragState.draggedBallId;
      const inst = editorGraph.instances[instId];

      const newX = ptX + editorDragState.dragStartOffset.x;
      const newY = ptY + editorDragState.dragStartOffset.y;

      inst.editor_x = newX;
      inst.editor_y = newY;

      updateEditorViewPositions();
    } else if (editorDragState.isPanning) {
      editorDragState.pan.x = e.clientX - editorDragState.panStart.x;
      editorDragState.pan.y = e.clientY - editorDragState.panStart.y;
      
      const g = document.getElementById("editorCanvasGroup");
      if (g) {
        g.setAttribute("transform", `translate(${editorDragState.pan.x}, ${editorDragState.pan.y}) scale(${editorDragState.zoom})`);
      }
    }
  });

  window.addEventListener("mouseup", (e) => {
    if (editorDragState.isDrawingRelation) {
      const ballNode = e.target.closest(".g-ball-container");
      if (ballNode) {
        const instId = ballNode.getAttribute("data-instance-id");
        if (instId && editorGraph.instances[instId]) {
          const targetVarId = editorGraph.instances[instId].variable_id;
          if (targetVarId !== editorDragState.sourceVariableId) {
            // Create relation
            const relId = `rel_${Date.now()}`;
            const res = EditorBridge.createRelation(relId, editorDragState.sourceVariableId, targetVarId, "PROPAGATION", "#3B82F6", "unidirectional");
            if (res.ok) {
              selectEditorElement("relation", relId);
            }
          }
        }
      }
      editorDragState.isDrawingRelation = false;
      editorDragState.sourceVariableId = null;
      
      const tempLine = document.getElementById("editor-temp-relation");
      if (tempLine) tempLine.remove();
    }

    try {
      if (editorDragState.draggedSetId) {
        const setId = editorDragState.draggedSetId;
        const setVal = editorGraph.sets[setId];
        if (setVal && setVal.editor_x !== undefined) {
          if (typeof EditorBridge.updateSet === 'function') {
            EditorBridge.updateSet(setId, { x: setVal.editor_x, y: setVal.editor_y });
          }
          
          // Update all variables inside this set
          editorGraph.logic.variables.forEach((v) => {
            if (v.memberships && v.memberships.includes(setId)) {
              const inst = Object.values(editorGraph.instances).find(
                (i) => i.variable_id === v.id,
              );
              if (inst && inst.editor_x !== undefined) {
                if (typeof EditorBridge.updateInstanciaVisual === 'function') {
                  EditorBridge.updateInstanciaVisual(inst.id, { x: inst.editor_x, y: inst.editor_y });
                }
              }
            }
          });
        }
      } else if (editorDragState.draggedBallId) {
        const instId = editorDragState.draggedBallId;
        const inst = editorGraph.instances[instId];
        if (inst && inst.editor_x !== undefined) {
          if (typeof EditorBridge.updateInstanciaVisual === 'function') {
            EditorBridge.updateInstanciaVisual(instId, { x: inst.editor_x, y: inst.editor_y });
          }
        }
      }
    } catch (e) {
      console.error("Error saving drag position:", e);
    } finally {
      editorDragState.draggedBallId = null;
      editorDragState.draggedSetId = null;
      editorDragState.isPanning = false;
    }
  });

  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      editorDragState.zoom *= zoomFactor;
    } else {
      editorDragState.zoom /= zoomFactor;
    }
    editorDragState.zoom = Math.min(Math.max(editorDragState.zoom, 0.2), 5);
    
    const g = document.getElementById("editorCanvasGroup");
    if (g) {
      g.setAttribute(
        "transform",
        `translate(${editorDragState.pan.x}, ${editorDragState.pan.y}) scale(${editorDragState.zoom})`
      );
    }
  });
}

function updateEditorViewPositions() {
  const container = document.getElementById("editorPreviewContainer");
  if (!container) return;

  // 1. Update Sets SVG positions
  Object.entries(editorGraph.sets).forEach(([setId, setVal]) => {
    const currentX = setVal.editor_x !== undefined ? setVal.editor_x : setVal.x;
    const currentY = setVal.editor_y !== undefined ? setVal.editor_y : setVal.y;

    const circle = container.querySelector(`#set-circle-${setId}`);
    if (circle) {
      circle.setAttribute("cx", currentX);
      circle.setAttribute("cy", currentY);
      circle.setAttribute("r", setVal.radius);
    }
    const label = container.querySelector(`#set-label-${setId}`);
    if (label) {
      label.setAttribute("x", currentX);
      label.setAttribute("y", currentY - setVal.radius + 14);
    }
    const conn = container.querySelector(`#set-conn-${setId}`);
    if (conn) {
      conn.setAttribute("x", currentX);
      conn.setAttribute("y", currentY - setVal.radius + 25);
    }
  });

  const ballCoords = {};

  // Update Balls SVG positions
  Object.entries(editorGraph.instances).forEach(([instId, inst]) => {
    const currentX = inst.editor_x !== undefined ? inst.editor_x : inst.x;
    const currentY = inst.editor_y !== undefined ? inst.editor_y : inst.y;

    const circle = container.querySelector(`#ball-circle-${instId}`);
    if (circle) {
      circle.setAttribute("cx", currentX);
      circle.setAttribute("cy", currentY);
    }
    const label = container.querySelector(`#ball-label-${instId}`);
    if (label) {
      label.setAttribute("x", currentX);
      label.setAttribute("y", currentY + 4);
    }
    ballCoords[inst.variable_id] = { x: currentX, y: currentY };
  });

  // Update Path/Arrow SVG positions
  editorGraph.logic.relations.forEach((rel) => {
    const fromCoord = ballCoords[rel.from_variable];
    const toCoord = ballCoords[rel.to_variable];

    if (fromCoord && toCoord) {
      const dx = toCoord.x - fromCoord.x;
      const dy = toCoord.y - fromCoord.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return;
      const radiusBall = 15;

      const startX = fromCoord.x + (dx / len) * radiusBall;
      const startY = fromCoord.y + (dy / len) * radiusBall;
      const endX = toCoord.x - (dx / len) * (radiusBall + 6);
      const endY = toCoord.y - (dy / len) * (radiusBall + 6);

      const path = container.querySelector(`#editor-path-${rel.id}`);
      const hitPath = container.querySelector(`.svg-relation-hitarea[data-relation-id="${rel.id}"]`);
      if (path) {
        let pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
        if (Math.abs(dx) > 10 && Math.abs(dy) > 10) {
          const midX = (startX + endX) / 2 + (dy / len) * 15;
          const midY = (startY + endY) / 2 - (dx / len) * 15;
          pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        }
        path.setAttribute("d", pathD);
        if (hitPath) hitPath.setAttribute("d", pathD);
      }

      const label = container.querySelector(`#editor-path-label-${rel.id}`);
      if (label) {
        label.setAttribute("x", (startX + endX) / 2);
        label.setAttribute("y", (startY + endY) / 2 - 10);
      }
    }
  });

  // 4. Temporary drawing relation line
  let tempLine = container.querySelector("#editor-temp-relation");
  if (editorDragState.isDrawingRelation && editorDragState.sourceVariableId) {
    const fromCoord = ballCoords[editorDragState.sourceVariableId];
    if (fromCoord) {
      if (!tempLine) {
        tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
        tempLine.setAttribute("id", "editor-temp-relation");
        tempLine.setAttribute("stroke", "#9CA3AF"); // Gray line
        tempLine.setAttribute("stroke-width", "3");
        tempLine.setAttribute("stroke-dasharray", "5,5");
        const g = document.getElementById("editorCanvasGroup");
        if (g) g.appendChild(tempLine);
      }
      tempLine.setAttribute("x1", fromCoord.x);
      tempLine.setAttribute("y1", fromCoord.y);
      tempLine.setAttribute("x2", editorDragState.tempTargetX);
      tempLine.setAttribute("y2", editorDragState.tempTargetY);
    }
  } else if (tempLine) {
    tempLine.remove();
  }
}




document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
  
  // Need to bind global functions used in HTML
  window.handleManageUpdate = function () {
    const type = document.getElementById("manageEntityType").value;
    const id = document.getElementById("manageEntityId").value;
    if (!id || !type) return;

    if (type === "set") {
      const conn = document.getElementById("editManageSetConn").value;
      const radiusInput = document.getElementById("editManageSetRadius");
      const radius = radiusInput ? parseInt(radiusInput.value, 10) : undefined;
      
      const payload = { connective: conn };
      if (radius !== undefined) payload.radius = radius;
      
      const res = EditorBridge.updateSet(id, payload);
      if (res.ok) {
        const setLog = editorGraph.logic.sets.find((s) => s.id === id);
        if (setLog) setLog.connective = conn;
        if (radius !== undefined && editorGraph.sets[id]) {
          editorGraph.sets[id].radius = radius;
        }
      }
    } else if (type === "variable") {
      const val = document.getElementById("editManageVarVal").value;
      const res = EditorBridge.updateVariable(id, { truth_value: val });
      if (res.ok) {
        const vLog = editorGraph.logic.variables.find((v) => v.id === id);
        if (vLog) vLog.truth_value = val;
      }
    } else if (type === "relation") {
      const conn = document.getElementById("editManageRelConn").value;
      const res = EditorBridge.updateRelation(id, { connective: conn });
      if (res.ok) {
        const rLog = editorGraph.logic.relations.find((r) => r.id === id);
        if (rLog) rLog.connective = conn;
      }
    }

    renderEditorPreview();
    // Notify main window to sync
    window.opener.postMessage('syncMain', '*');
  };

  initEditorDragEvents();
  setupEditorEventListeners();
  syncEditorDropdowns();
  renderEditorPreview();
});
