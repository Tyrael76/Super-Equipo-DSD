from typing import Set, List, Dict
import pandas as pd # Utilizado para una visualización tabular clara

class EvidentialValue:
    N = "N" # Sin evidencia [cite: 266]
    T = "T" # Positiva [cite: 267]
    F = "F" # Negativa [cite: 268]
    B = "B" # Coexistencia [cite: 268]
    VALUES = [N, T, F, B]

class Variable:
    def __init__(self, name: str, initial_value: str = "N"):
        self.name = name
        self.admissible = set(EvidentialValue.VALUES)
        self.effective = initial_value

    def restrict(self, allowed: Set[str]) -> bool:
        before = set(self.admissible)
        self.admissible &= allowed
        if self.admissible != before:
            # Min selection: Priorizamos N < (T, F) < B [cite: 338, 353]
            if self.admissible:  # Si hay valores admisibles
                priority = {EvidentialValue.N: 0, EvidentialValue.T: 1, 
                            EvidentialValue.F: 1, EvidentialValue.B: 2}
                self.effective = min(self.admissible, key=lambda x: priority[x])
            else:
                # Si no hay valores admisibles, mantener el actual (inconsistencia)
                pass
            return True
        return False

class ImplicationMatrix:
    def __init__(self, p: Variable, q: Variable, z: Variable):
        self.p = p
        self.q = q
        self.z = z
        # Matriz base de Implicación Evidencial (Proposición 5) [cite: 383]
        self.matrix = {
            "N": {"N": "N", "T": "T", "F": "N", "B": "T"},
            "T": {"N": "N", "T": "T", "F": "F", "B": "B"},
            "F": {"N": "T", "T": "T", "F": "T", "B": "T"},
            "B": {"N": "T", "T": "T", "F": "B", "B": "B"}
        }

    def display(self, reason: str):
        print(f"\n--- Actualización: {reason} ---")
        df = pd.DataFrame(index=EvidentialValue.VALUES, columns=EvidentialValue.VALUES)
        
        for row in EvidentialValue.VALUES:
            for col in EvidentialValue.VALUES:
                # Una celda es "-" si la fila (P), columna (Q) o resultado (Z) 
                # ya no es admisible [cite: 730, 1556]
                if (row not in self.p.admissible or 
                    col not in self.q.admissible or 
                    self.matrix[row][col] not in self.z.admissible):
                    df.loc[row, col] = "-"
                else:
                    df.loc[row, col] = self.matrix[row][col]
        
        print(f"P ({self.p.name}) \\ Q ({self.q.name}) | Z: {self.z.effective}")
        print(df)
        print(f"Estado Actual: P={self.p.effective}, Q={self.q.effective}")

    def sync(self) -> bool:
        changed = False
        
        # Calcular los posibles valores de Z según la matriz de implicación
        # Basándose en TODOS los valores admissibles de P y Q
        possible_z_values = set()
        for p_val in self.p.admissible:
            for q_val in self.q.admissible:
                z_val = self.matrix[p_val][q_val]
                possible_z_values.add(z_val)
        
        # Restringir Z a los valores posibles calculados
        if possible_z_values:
            if self.z.restrict(possible_z_values):
                changed = True
        
        # Si Z es T, eliminamos entradas N y F de la matriz [cite: 435]
        if self.z.effective in {"T", "B"}:
            if self.p.effective == "T":
                # UI+: P=T fuerza Q a {T, B} [cite: 441]
                if self.q.restrict({"T", "B"}):
                    self.display(f"UI+ (Forward): {self.p.name}=T restringe a {self.q.name}")
                    changed = True
            if self.q.effective == "F":
                # UI-: Q=F fuerza P a {F, B} [cite: 451]
                if self.p.restrict({"F", "B"}):
                    self.display(f"UI- (Backward): {self.q.name}=F restringe a {self.p.name}")
                    changed = True
        return changed


class EPICEngine:
    """Motor EPIC que gestiona múltiples implicaciones [cite: 729]."""
    def __init__(self):
        self.variables: Dict[str, Variable] = {}
        self.constraints: List[ImplicationMatrix] = []

    def add_variable(self, name: str) -> Variable:
        """Agrega una variable al motor."""
        v = Variable(name)
        self.variables[name] = v
        return v

    def add_implication(self, p_name: str, q_name: str, z_name: str):
        """Agrega una restricción de implicación entre tres variables."""
        p = self.variables[p_name]
        q = self.variables[q_name]
        z = self.variables[z_name]
        constraint = ImplicationMatrix(p, q, z)
        self.constraints.append(constraint)

    def stabilize(self):
        """Ejecuta el ciclo de estabilización hasta punto fijo [cite: 729, 756]."""
        step = 0
        while True:
            step += 1
            any_change = False
            print(f"\nPaso {step}:")
            
            for constraint in self.constraints:
                if constraint.sync():
                    any_change = True
            
            if not any_change:
                print("\nEstado estabilizado alcanzado.")
                break

# --- Demostración del Proceso (Solo si se ejecuta directamente) ---
if __name__ == "__main__":
    # Setup de variables
    p = Variable("Human(Socrates)")
    q = Variable("Mortal(Socrates)")
    z = Variable("Implication_Z")
    
    engine = ImplicationMatrix(p, q, z)
    
    # 1. Estado inicial (Silencio operacional) [cite: 406, 464]
    engine.display("Estado inicial (Todo admisible)")
    
    # 2. Premisa: La implicación es verdadera (Z = T) [cite: 924]
    z.restrict({"T", "B"})
    engine.display("Premisa 1: Z tiene evidencia positiva")
    
    # 3. Premisa: Socrates es humano (P = T) [cite: 932]
    p.restrict({"T"})
    engine.display("Premisa 2: P tiene evidencia positiva")
    
    # 4. Propagación final
    engine.sync()
