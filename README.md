# 🚀 Inicio Rápido - EPiC Playground Integrado

## Comandos Correctos para Iniciar el Sistema

### 1️⃣ Iniciar el Motor API


```
cd epic_motor
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```


✅ El motor debe estar corriendo en `http://localhost:8000`

---

### 2️⃣ Compilar el Editor TypeScript

**En una nueva terminal:**

```powershell
cd epic_simulador
npm install
npm run build:editor
```

Esto genera los archivos en `epic_simulador/dist/`

---

### 3️⃣ Iniciar el Simulador

```powershell
cd epic_simulador
npm run dev
```

✅ Abre tu navegador en `http://localhost:5173/`

---

## ⚠️ Errores Comunes

### Error: "ImportError: attempted relative import beyond top-level package"

**Causa:** Estás usando el comando incorrecto.

**Solución:** Usa `main:app` en lugar de `api.app:app`:
```powershell
python -m uvicorn main:app --reload --port 8000
```

### Error: "Cannot find module '../epic_editor/dist/...'"

**Causa:** No compilaste el código TypeScript.

**Solución:**
```powershell
cd epic_simulador
npm run build:editor
```

### Error: "No se pudo conectar con el Motor"

**Causa:** El motor no está corriendo.

**Solución:** Verifica que el motor esté corriendo en `http://localhost:8000/docs`

---

## 📋 Checklist de Inicio

- [ ] Motor corriendo en puerto 8000
- [ ] Editor TypeScript compilado (carpeta `dist/` existe)
- [ ] Simulador corriendo en puerto 5173
- [ ] Navegador abierto en `http://localhost:5173/`

---

## 🎯 Uso Rápido y Nuevas Funcionalidades

1. Ve a la pestaña **"Editor Interactivo"** o utiliza la **"Vista Global (Lienzo)"**.
2. **Edición en Lienzo:** Utiliza los botones flotantes en la parte inferior derecha del lienzo para:
   - **( + )** Crear Conjuntos o Variables. Al crear una variable, se te preguntará a qué conjunto asignarla interactivamente.
   - **( 🔗 )** Crear Operaciones Lógicas (Relaciones), seleccionando el origen, destino y la compuerta lógica (AND, OR, IMPLIES, XOR).
   - **( - )** Eliminar elementos interactivos. (También puedes dar **Doble Clic** a cualquier elemento para eliminarlo).
3. **Mover Elementos:** Puedes arrastrar libremente Variables y Conjuntos; las conexiones y flechas se actualizarán en tiempo real.
4. **Sincronización:** Cada cambio interactivo se comunica al instante con el Motor de Python, recalcula el Grafo Lógico, y regenera la traza de forma automática.
5. **Doble Panel JSON:** El panel lateral te mostrará claramente el **JSON Enviado (Petición)** desde el simulador y el **JSON Recibido (Respuesta)** con la simulación resuelta.
6. Click en **"⚡ Calcular con el Motor API"** o presiona "Reproducir" en la barra superior para ver la animación paso a paso.

---

## 💡 Ejemplos Rápidos y Deducción Natural

Para probar el motor de forma instantánea, haz clic en **"Explorar Ejemplos"** (en el panel izquierdo). 
Tendrás a disposición varios escenarios (presets) listos para usar:
- Implicación Simple
- Contrapositiva
- Contradicción
- Ciclo Retroalimentado
- **Deducción Natural (⭐ IMPORTANTE)**
- Silogismos Socráticos

> **NOTA DESTACADA:** El ejemplo de **Deducción Natural** incluido en los presets implementa exactamente el caso de estudio que el profesor solicitó a partir de su artículo de investigación. Al cargar este ejemplo, el simulador reproducirá paso a paso la inferencia basada en las reglas ∧E, ¬E, MT, ∧I utilizando la lógica tetralente de Belnap.

---

## 📚 Documentación Completa

Para más detalles, consulta:
- `epic_simulador/INTEGRATION_README.md` - Documentación completa de la integración
- `epic_simulador/README.md` - Documentación del simulador
- `epic_motor/READ_ME.txt` - Documentación del motor

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa este documento
2. Revisa la consola del navegador (F12)
3. Revisa los logs del motor en la terminal
4. Consulta `epic_simulador/INTEGRATION_README.md` sección "Solución de Problemas"