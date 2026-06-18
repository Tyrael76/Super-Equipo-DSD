# Prompt para reconstruir epic_motor/logic

Usa este prompt para reconstruir la carpeta `logic`, fuente matematica activa del Motor en esta rama.

```text
Actua como ingeniero Python senior especializado en logica de Belnap, tablas evidenciales y extensibilidad controlada.

Reconstruye exclusivamente epic_motor/logic. Antes de escribir codigo, inspecciona:

- epic_motor/logic/belnap.py
- epic_motor/logic/connectives.py
- epic_motor/services/engine.py
- epic_motor/motorv2.py
- epic_motor/models/schemas.py
- epic_motor/models/snapshot.py
- epic_motor/tests/test_motor.py

Objetivo: mantener una sola fuente de verdad para `BV`, operaciones del bilattice y registro de conectivos usados por `services/engine.py`.

Responsabilidades:

1. Definir y probar N, V, F y B.
2. Mantener AND, OR, NOT y k-join en funciones puras.
3. Encapsular cada matriz binaria en Connective.
4. Registrar conectivos en REGISTRY para que API y motor los descubran.
5. Documentar cuales conectivos son del PoC y cuales implementan tablas formales EPiC.
6. Mapear T del articulo a V del producto en una frontera unica.

Reglas:

1. No importar FastAPI, Pydantic, pandas ni codigo visual.
2. No crear otra implementacion paralela de Belnap.
3. No afirmar que implicacion material equivale por si sola a toda la restriccion operacional EPiC.
4. No implementar flujo o iteraciones dentro de Connective.

SOLID verificable: SRP en `belnap.py`; OCP mediante REGISTRY y Connective; LSP solo si se introduce un protocolo de conectivo y cada implementacion satisface el mismo contrato.

Pruebas:

- Tablas completas para cada operacion registrada.
- REGISTRY y GET /conectivos exponen las mismas claves.
- Conectivo desconocido falla de forma explicita.
- Tests activos y legacy pueden importar logic sin divergencia.

Fallos comunes:

- Cambiar una tabla para hacer pasar una animacion sin justificacion formal.
- Confundir union de informacion con orden de verdad.
- Tratar B como error o colapso.
```

## Prompt de correccion rapida

```text
Audita logic contra EPiC.pdf y test_motor.py. Entrega por cada tabla su fuente, casos frontera y prueba exhaustiva. Si una regla del articulo aun no esta implementada, marcala como pendiente en vez de aproximarla silenciosamente.
```
