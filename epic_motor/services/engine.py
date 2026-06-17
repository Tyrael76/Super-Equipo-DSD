from models.snapshot import PlaygroundSnapshot, ExecutionTrace, ExecutionAction
from motorv2 import EPICEngine

FRONTEND_TO_ENGINE = {"V": "T", "F": "F", "N": "N", "B": "B"}
ENGINE_TO_FRONTEND = {"T": "V", "F": "F", "N": "N", "B": "B"}

def run_propagation(snapshot: PlaygroundSnapshot) -> PlaygroundSnapshot:
    """
    Recibe el Snapshot, calcula la propagación matricial sobre el nuevo EPICEngine
    y devuelve el mismo Snapshot mutado con el execution_trace sintético inyectado.
    """
    # 1. Instanciación del nuevo motor
    engine = EPICEngine()
    
    variables_in = snapshot.logic.variables
    relations_in = snapshot.logic.relations.values()
    
    engine_vars = {}
    estado_previo = {}
    
    # 2. Desempaquetado y Traducción de Variables
    for var_id, var_obj in variables_in.items():
        # Instanciar en el motor
        v = engine.add_variable(var_id)
        engine_vars[var_id] = v
        
        # Traducir valor V -> T
        val_frontend = var_obj.value
        val_engine = FRONTEND_TO_ENGINE.get(val_frontend, "N")
        estado_previo[var_id] = val_engine
        
        # Inyectar evidencia si no es Neutro
        if val_engine != "N":
            v.restrict({val_engine})
            
    # 3. Traducción de Relaciones e inyección de variables Z
    for rel in relations_in:
        source_id = rel.source
        target_id = rel.target
        
        # Validar que los nodos existan
        if source_id not in engine_vars or target_id not in engine_vars:
            continue
            
        # Generar variable sintética Z para la implicación
        z_name = f"Z_{rel.id}"
        v_z = engine.add_variable(z_name)
        v_z.restrict({"T"})  # Asumimos que la regla es verdadera/activa
        
        # Añadir al motor
        engine.add_implication(source_id, target_id, z_name)
        
    # 4. Ejecución del motor (Estabilización síncrona hasta punto fijo)
    engine.stabilize()
    
    # 5. Empaquetado: Comparación de estados y generación de traza sintética
    trace = ExecutionTrace()
    trace.stabilized = True
    trace.total_iterations = 1
    
    paso_actual = 1
    
    for var_id, engine_var in engine_vars.items():
        # Extraer estado resultante del motor
        val_engine_final = engine_var.effective
        val_frontend_final = ENGINE_TO_FRONTEND.get(val_engine_final, "N")
        
        # Si la variable mutó respecto a su estado inicial, generamos una acción
        if val_engine_final != estado_previo[var_id]:
            old_frontend = ENGINE_TO_FRONTEND.get(estado_previo[var_id], "N")
            
            accion = ExecutionAction(
                step=paso_actual,
                variable_id=var_id,
                old_value=old_frontend,
                new_value=val_frontend_final,
                description=f"La variable '{var_id}' cambió de {old_frontend} a {val_frontend_final} vía propagación lógica.",
                is_stabilized=False
            )
            trace.actions.append(accion)
            paso_actual += 1
            
        # Actualizamos el valor final en el modelo Pydantic in-place
        # Este es el valor que consumirá el Frontend
        if var_id in variables_in:
            variables_in[var_id].value = val_frontend_final

    # 6. Acción obligatoria de finalización/estabilización
    trace.actions.append(ExecutionAction(
        step=paso_actual,
        variable_id="*",
        old_value="*",
        new_value="*",
        description="El sistema se estabilizó tras la inferencia.",
        is_stabilized=True
    ))
    
    # 7. Retorno compatible
    snapshot.execution_trace = trace
    return snapshot