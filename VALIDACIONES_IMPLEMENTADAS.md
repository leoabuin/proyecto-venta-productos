# Validaciones Implementadas para Mercado Pago

## 📋 Resumen

Se han implementado validaciones exhaustivas en el backend para garantizar que Mercado Pago Checkout funcione correctamente y de forma segura.

---

## 1️⃣ Archivo: `.env` (Backend)

**Ubicación:** `c:\Users\parke\sportify-backend\proyecto-venta-productos\.env`

**Datos agregados:**
```env
MP_ACCESS_TOKEN=APP_USR-1340547747440107-031915-d7dd39e6201875526ab5db0f5959154e-3276888618
MP_PUBLIC_KEY=APP_USR-bd1fb445-1a29-41ca-9659-fb98f4c7b9b0
```

**Descripción:**
- **MP_ACCESS_TOKEN**: Token para autenticar solicitudes al servidor de Mercado Pago
- **MP_PUBLIC_KEY**: Clave pública para integraciones (opcional en frontend)

---

## 2️⃣ Validación de Variables de Entorno: `env.validation.ts`

**Ubicación:** `src/shared/env.validation.ts`

### Qué valida:
✅ **Servidor:**
- PORT es un número válido
- NODE_ENV es development/production/test
- FRONTEND_URL y BACKEND_URL son URLs válidas

✅ **Base de Datos:**
- MYSQLHOST es requerido
- MYSQLPORT es un número válido
- MYSQLUSER es requerido
- MYSQLPASSWORD es requerido
- MYSQLDATABASE es requerido

✅ **Seguridad:**
- JWT_SECRET tiene mínimo 8 caracteres

✅ **Mercado Pago (CRÍTICO):**
- ✓ MP_ACCESS_TOKEN existe y es requerido
- ✓ MP_PUBLIC_KEY existe y es requerido
- ✓ Formato válido: ambos deben empezar con "APP_USR-"
- ✓ Alerta si usas credenciales de sandbox en producción

### Función principal:
```typescript
validateEnv(): Env
validateMercadoPago(env: Env): boolean
```

### Output al iniciar:
```
✅ Variables de entorno validadas correctamente
ℹ️  MERCADO PAGO: Usando credenciales de SANDBOX (development)
✅ Configuración de Mercado Pago validada exitosamente
```

---

## 3️⃣ Validación de Datos de Pago: `payment.validation.ts`

**Ubicación:** `src/shared/payment.validation.ts`

### Esquemas Zod:

#### A. PaymentItemSchema
Valida cada item de pago:
```typescript
{
  productId: number ≥ 1,
  id: string (opcional),
  title: string (1-256 caracteres),
  quantity: number ≥ 1,
  unit_price: number ≥ 0.01
}
```

#### B. CreatePaymentPreferenceSchema
Valida la preferencia de pago completa:
```typescript
{
  orderId: number ≥ 1,
  items: array (1-25 items - límite de MP)
}
```

#### C. VerifyPaymentSchema
Valida verificación de pago:
```typescript
{
  order_id: number (opcional),
  payment_id: string (opcional)
}
// Debe tener al menos uno
```

### Funciones de validación:
```typescript
validateCreatePaymentPreferenceInput(data)   // Valida preferencia
validatePaymentItem(item)                     // Valida item individual
validateVerifyPaymentInput(data)              // Valida verificación
validatePaymentAmounts(items)                 // Valida montos (0 < precio < 999999)
```

### Errores que detecta:
```
❌ "orderId debe ser un número positivo"
❌ "items debe tener al menos un item"
❌ "Máximo 25 items permitidos"
❌ "title es requerido"
❌ "quantity debe ser número positivo"
❌ "Precio muy alto"
```

---

## 4️⃣ Integración en app.ts

**Ubicación:** `src/app.ts`

Al iniciar el servidor, se ejecutan:

```typescript
try {
  const env = validateEnv()             // Valida variables
  validateMercadoPago(env)              // Valida MP específicamente
  console.log('✅ Configuración de Mercado Pago validada...')
} catch (error) {
  console.error('❌ Error fatal...')
  process.exit(1)  // Detiene servidor si hay error
}
```

---

## 5️⃣ Manejo de Errores en Payment Controller

**Ubicación:** `src/payment/payment.controller.ts`

### Validaciones en createPreference():

1. **Validación de entrada:**
   ```typescript
   validateCreatePaymentPreferenceInput(req.body)
   ```

2. **Validación de montos:**
   ```typescript
   validatePaymentAmounts(items)
   ```

3. **Validación de orden:**
   - Verifica que la orden exista en BD
   - Valida que tenga ID válido

4. **Errores de Mercado Pago:**
   - Detecta tokens inválidos
   - Detecta credenciales expiradas
   - Provee mensajes descriptivos

5. **Respuestas específicas:**
   ```json
   // Error 400 - Datos inválidos
   {
     "message": "Error en los datos de pago",
     "details": "..."
   }
   
   // Error 404 - Orden no encontrada
   {
     "message": "Orden con ID X no encontrada"
   }
   
   // Error 500 - Error de Mercado Pago
   {
     "message": "Credenciales de Mercado Pago inválidas",
     "details": "Verifica que el token de acceso sea correcto"
   }
   ```

---

## 6️⃣ Archivo ejemplo actualizado: `.env.example`

**Ubicación:** `c:\Users\parke\sportify-backend\proyecto-venta-productos\.env.example`

Ahora incluye:
- Comentarios sobre qué es cada variable
- Formato esperado para cada credencial
- URLs de referencia a Mercado Pago

---

## 🔍 Flujo Completo de Validación

```
1. INICIO DEL SERVIDOR
   ↓
2. validateEnv() 
   - Lee .env
   - Valida con Zod
   - Si error → Muestra detalles → EXIT 1
   ↓
3. validateMercadoPago()
   - Verifica formato APP_USR-
   - Valida sandbox/production
   - Si error → EXIT 1
   ↓
4. SERVIDOR INICIADO ✅
   ↓
5. USUARIO CREA PREFERENCIA DE PAGO
   ↓
6. validateCreatePaymentPreferenceInput()
   - Valida orderId
   - Valida items (1-25)
   - Si error → HTTP 400
   ↓
7. validatePaymentAmounts()
   - Verifica precios válidos
   - Si error → HTTP 400
   ↓
8. LLAMADA A MERCADO PAGO
   - Si credenciales inválidas → HTTP 500
   - Si éxito → HTTP 201 + init_point
```

---

## ✨ Beneficios de las Validaciones

| Beneficio | Descripción |
|-----------|-------------|
| 🔒 **Seguridad** | Previene datos malformados o ataques |
| 🛡️ **Confiabilidad** | Garantiza que MP reciba datos correctos |
| 📝 **Claridad** | Errores descriptivos para debugging |
| ⚡ **Performance** | Detecta problemas antes de llamar a MP |
| 🌍 **Escalabilidad** | Fácil de extender con nuevas validaciones |

---

## 🧪 Cómo Probar

### 1. Verificar validación de .env:
```bash
# Elimina MP_ACCESS_TOKEN de .env
npm run start  # Error: MP_ACCESS_TOKEN no configurado
```

### 2. Verificar validación de items:
```bash
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "items": [{
      "productId": 1,
      "title": "Test",
      "quantity": -1,  # Error: debe ser positivo
      "unit_price": 100
    }]
  }'
# Response: 400 - "quantity debe ser número positivo"
```

### 3. Verificar validación de montos:
```bash
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "items": [{
      "productId": 1,
      "title": "Test",
      "quantity": 1,
      "unit_price": 99999999  # Muy alto
    }]
  }'
# Response: 400 - "Precio muy alto"
```

---

## 📚 Documentación Adicional

- **MERCADO_PAGO_CONFIG.md**: Guía completa de configuración
- **.env**: Variables de entorno en uso
- **.env.example**: Plantilla de configuración

---

## ⚠️ Advertencias Importantes

1. **NUNCA** commitees el `.env` real a git
   - Solo commitea `.env.example`
   - Usa `.gitignore` (ya configurado)

2. **Credenciales de Sandbox vs Producción:**
   - Desarrollo: Las credenciales actuales son de SANDBOX
   - Producción: Cambiar a credenciales reales antes de desplegar

3. **Token Expirado:**
   - Si recibis error de autenticación, regenera credenciales en MP

4. **Webhook:**
   - Configura URL en dashboard de Mercado Pago
   - Solo aplica si tienes dominio público (no localhost)
