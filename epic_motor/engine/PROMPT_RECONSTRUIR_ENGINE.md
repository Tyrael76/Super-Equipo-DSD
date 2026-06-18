# Prompt para reconstruir epic_motor/engine

Usa este prompt para revisar la carpeta `engine`, que puede contener una implementacion anterior de propagacion.

```text
Actua como ingeniero Python senior especializado en migracion controlada de codigo legacy.

Reconstruye o depura exclusivamente epic_motor/engine. Antes de escribir codigo, inspecciona:

- epic_motor/engine/propagation.py
- epic_motor/services/engine.py
- epic_motor/models/snapshot.py
- epic_motor/models/schemas.py
- epic_motor/tests/test_motor.py

Objetivo:

Determinar si epic_motor/engine/propagation.py sigue siendo usado. Si no esta en el flujo activo, mantenlo como legacy documentado o migra su funcionalidad a services/engine.py sin duplicar logica.

Estado comprobado de esta rama: `main.py` y `api/routes.py` no importan esta carpeta; `api/app.py` si la usa como ruta legacy. `engine/propagation.py` tambien modifica colores, por lo que no cumple la ceguera visual del contrato activo.

Reglas:

1. No tener dos motores activos con reglas distintas.
2. Si routes.py usa services/engine.py, entonces engine/propagation.py no debe ser la fuente de verdad.
3. Si se conserva, debe delegar o ser marcado claramente como compatibilidad.
4. No revivir MotorInput viejo si el endpoint usa PlaygroundSnapshot.
5. No borrar archivos sin revisar imports.
6. El comentario LSP sobre tratar subconjuntos como raices no es LSP: no hay jerarquia de tipos sustituibles. Corrige esa etiqueta.
7. No copies funciones legacy al motor activo sin pruebas de caracterizacion.

Pasos:

1. Buscar imports de engine.propagation.
2. Comparar comportamiento con services.engine.run_propagation.
3. Decidir: eliminar uso, delegar o migrar.
4. Ajustar tests para cubrir solo el motor activo.
5. Documentar comando activo `python -m uvicorn main:app` y evitar recomendar `api.app:app`.

Fallos comunes:

- Corregir propagation.py mientras la API usa services/engine.py.
- Mantener dos algoritmos que dan trazas diferentes.
- Importar modelos viejos accidentalmente.
```

## Prompt de correccion rapida

```text
Haz una auditoria de uso de epic_motor/engine/propagation.py. Si no se usa, no lo trates como motor activo. Si se usa, unifica su comportamiento con services/engine.py.

Entrega un mapa de imports y una decision explicita: retirar, adaptar o conservar. No atribuyas SOLID a codigo legacy que mezcla calculo y color; registra esa deuda tecnica.
```
