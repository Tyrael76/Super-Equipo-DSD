from fastapi import APIRouter
from models.snapshot import PlaygroundSnapshot
from services.engine import run_propagation
from logic.connectives import REGISTRY

router = APIRouter()

# SOLID - SRP: los handlers traducen HTTP y delegan el calculo al servicio;
# no contienen matrices, iteraciones ni decisiones visuales.
@router.get("/health")
async def health():
    """Endpoint de salud del motor EPiC. Verifica que el servicio esté activo."""
    return {"status": "ok", "motor": "EPIC Playground v3.0"}

@router.get("/conectivos")
async def get_conectivos():
    """
    Retorna los conectivos lógicos disponibles en el motor EPiC.
    Usado por el editor para validar operadores antes de enviar snapshots.
    """
    # Return dictionary with connectives as keys as expected by the TS client
    return {name: {} for name in REGISTRY.keys()}

@router.post("/calcular", response_model=PlaygroundSnapshot)
async def calcular_propagacion(snapshot: PlaygroundSnapshot):
    """
    Endpoint principal del motor EPiC.
    Recibe snapshot completo, ejecuta propagación evidencial sobre el grafo lógico,
    y retorna el mismo snapshot con execution_trace anexado.
    Ignora la capa visual durante el cálculo.
    """
    # Pasamos el JSON tipado directo al motor
    resultado_mutado = run_propagation(snapshot)
    
    return resultado_mutado
