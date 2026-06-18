from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from logic.belnap import BV, bv_from_str

# SOLID - SRP: estos modelos validan y serializan el contrato activo. El calculo
# vive en services/engine.py y la adaptacion del contrato publico en el Editor.

# ─────────────────────────────────────────────
#  1. Capa Lógica (Lo único que lee el Motor)
# ─────────────────────────────────────────────

class LogicVariable(BaseModel):
    """Variable lógica con valor de verdad Belnap (V, F, N, B)."""
    id: str
    value: str = "N"  # V, F, N, B
    
    @field_validator("value", mode="before")
    @classmethod
    def normalizar_bv(cls, v: Any) -> str:
        """Normaliza el valor de entrada a un valor Belnap válido."""
        return bv_from_str(str(v)).value

    @property
    def bv(self) -> BV:
        """Retorna el valor como enum BV para operaciones lógicas."""
        return BV(self.value)

class LogicSet(BaseModel):
    """Conjunto/contexto que agrupa variables con un conectivo lógico."""
    id: str
    elements: List[str] = Field(default_factory=list)

class LogicRelation(BaseModel):
    """Relación dirigida entre variables que define propagación de evidencia."""
    id: str
    source: str
    target: str
    connective: str = "PROPAGATION"
    is_contrapositive: bool = False

class LogicGraph(BaseModel):
    """Grafo lógico completo: variables, conjuntos y relaciones del sistema EPiC."""
    variables: Dict[str, LogicVariable] = Field(default_factory=dict)
    sets: Dict[str, LogicSet] = Field(default_factory=dict)
    relations: Dict[str, LogicRelation] = Field(default_factory=dict)

# ─────────────────────────────────────────────
#  2. Capa de Ejecución (La historia para Gonzalo)
# ─────────────────────────────────────────────

class ExecutionAction(BaseModel):
    """Acción individual de propagación: cambio de valor en una variable."""
    step: int
    variable_id: str
    old_value: str
    new_value: str
    description: str
    is_stabilized: bool = False

class ExecutionTrace(BaseModel):
    """Rastro completo de ejecución: secuencia de acciones hasta estabilización."""
    actions: List[ExecutionAction] = Field(default_factory=list)
    stabilized: bool = False
    total_iterations: int = 0

# ─────────────────────────────────────────────
#  3. Metadatos y Capa Visual (Ceguera Espacial)
# ─────────────────────────────────────────────

class PlaygroundMeta(BaseModel):
    """Metadatos de configuración del motor EPiC."""
    max_iterations: int = Field(default=100, ge=1, le=500)
    version: str = "1.1"

class PlaygroundSnapshot(BaseModel):
    """
    Snapshot completo del playground EPiC.
    Contrato compartido entre Editor y Motor: lógica, visual, metadatos y rastro.
    """
    meta: PlaygroundMeta = Field(default_factory=PlaygroundMeta)
    logic: LogicGraph = Field(default_factory=LogicGraph)
    visual: Dict[str, Any] = Field(default_factory=dict) # ¡Ignoramos el contenido visual!
    execution_trace: Optional[ExecutionTrace] = None
