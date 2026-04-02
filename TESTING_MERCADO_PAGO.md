# 🧪 GUÍA DE TESTING - Mercado Pago Checkout

## 1️⃣ PREPARACIÓN INICIAL

### Paso 1: Verificar credenciales

```bash
# Abre .env y verifica:
cat .env | grep MP_

# Deberías ver:
# MP_ACCESS_TOKEN=APP_USR-1340547747440107-031915-...
# MP_PUBLIC_KEY=APP_USR-bd1fb445-1a29-41ca-9659-...
```

### Paso 2: Iniciar servidores

**Terminal 1 - Backend:**
```bash
cd c:\Users\parke\sportify-backend\proyecto-venta-productos
npm run start:dev
# Espera: "Server running on port 3000"
```

**Terminal 2 - Frontend:**
```bash
cd c:\Users\parke\sportify-frontend\proyecto-venta-productos-front-end
npm run start
# Espera: "Application Bundle: ... (0 minutes)"
```

---

## 2️⃣ PRUEBA DE VALIDACIÓN DE ENTORNO

### Verificar que validaciones están activas

En los logs del backend deberías ver:

```
✅ Variables de entorno validadas correctamente
ℹ️  MERCADO PAGO: Usando credenciales de SANDBOX (development)
✅ Configuración de Mercado Pago validada exitosamente
Server running on port 3000
```

### Si ves errores:

```
❌ Error en validación de variables de entorno:
  - MP_ACCESS_TOKEN: no está configurado
  - MP_PUBLIC_KEY: no está configurado
```

**Solución:** Edita `.env` y agrega las credenciales

---

## 3️⃣ FLUJO COMPLETO DE COMPRA

### Paso 1: Acceder a la aplicación

1. Abre: `http://localhost:4200`
2. Login como Cliente

### Paso 2: Agregar productos al carrito

1. Click en "Productos"
2. Selecciona varios productos
3. Agrega al carrito
4. Verifica que aparecen en el carrito

### Paso 3: Ir al carrito de compras

1. Click en "Tu Carrito"
2. Verifica items y total
3. Verifica que dice "Mercado Pago" como método de pago

### Paso 4: Finalizar compra

1. Click en "Finalizar Pedido"

**⏳ Esperado:**
- Loading spinner aparece
- Redirige a `https://www.mercadopago.com.ar/checkout/...` (o sandbox)

---

## 4️⃣ PRUEBA DE PAGO APROBADO

### En la página de Mercado Pago:

1. Email: `test_user_12345@testuser.com`
2. Nombre: Cualquiera
3. Tarjeta: `4111111111111111`
4. Fecha: `11/25`
5. CVV: `123`
6. Documento: Cualquiera (ej: `12345678`)
7. Click en "Pagar"

**⏳ Esperado:**
- Después de procesar, redirige a `/payment/success`
- Muestra: "¡Pago Exitoso!"
- Orden guardada como "Pagado"

### Verificar en Base de Datos:

```sql
SELECT id, estado, metodo_pago, mp_payment_id FROM orders 
WHERE estado = 'Pagado' 
ORDER BY id DESC LIMIT 1;
```

**Esperado:**
- estado: `Pagado`
- metodo_pago: `Mercado Pago`
- mp_payment_id: `1234567890...` (lleno)

---

## 5️⃣ PRUEBA DE PAGO RECHAZADO

### Repetir pasos 1-3, luego en Mercado Pago:

1. Email: `test_user_12345@testuser.com`
2. Tarjeta: `5555555555554444` (esta será rechazada)
3. Fecha: `11/25`
4. CVV: `123`
5. Click en "Pagar"

**⏳ Esperado:**
- Redirige a `/payment/failure`
- Muestra: "Pago Rechazado"
- Lista posibles razones
- Opción de "Intentar nuevamente"

### Verificar en Base de Datos:

```sql
SELECT id, estado FROM orders 
WHERE estado = 'Rechazado' 
ORDER BY id DESC LIMIT 1;
```

---

## 6️⃣ PRUEBA DE VALIDACIÓN DE DATOS

### Intenta crear una preferencia con datos inválidos:

```bash
# Test 1: Sin orderId
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{"items": [{"productId": 1, "title": "Test", "quantity": 1, "unit_price": 100}]}'

# Esperado: HTTP 400
# "orderId es requerido"
```

```bash
# Test 2: Quantity negativo
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "items": [{"productId": 1, "title": "Test", "quantity": -1, "unit_price": 100}]
  }'

# Esperado: HTTP 400
# "quantity debe ser un número positivo"
```

```bash
# Test 3: Precio muy alto
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "items": [{"productId": 1, "title": "Test", "quantity": 1, "unit_price": 9999999}]
  }'

# Esperado: HTTP 400
# "Precio muy alto"
```

```bash
# Test 4: Más de 25 items (limite de MP)
curl -X POST http://localhost:3000/api/payment/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "items": [
      {"productId": 1, "title": "Item1", "quantity": 1, "unit_price": 100},
      {"productId": 2, "title": "Item2", "quantity": 1, "unit_price": 100},
      ... (26 items) ...
    ]
  }'

# Esperado: HTTP 400
# "Mercado Pago solo permite máximo 25 items"
```

---

## 7️⃣ PRUEBA DE CREDENCIALES INVÁLIDAS

### Simular token expirado:

1. Edita `.env`
2. Cambia MP_ACCESS_TOKEN a un valor inválido:
   ```env
   MP_ACCESS_TOKEN=APP_USR-INVALID-TOKEN
   ```
3. Reinicia el backend
4. Intenta finalizar una compra

**Esperado:**
- HTTP 500
- "Credenciales de Mercado Pago inválidas"
- Log: "Error de autenticación con Mercado Pago"

---

## 8️⃣ CHECKLIST DE FUNCIONALIDAD

Marca cada prueba como completa:

### Backend
- [ ] Variables de entorno se validan al iniciar
- [ ] Error descriptivo si MP_ACCESS_TOKEN falta
- [ ] Error si credenciales tienen formato inválido
- [ ] Endpoint `/api/payment/create-preference` devuelve init_point
- [ ] Validaciones Zod funcionan correctamente
- [ ] Errores HTTP 400 para datos inválidos
- [ ] Errores HTTP 500 para problemas con MP

### Frontend
- [ ] Carrito muestra "Mercado Pago" como método de pago
- [ ] Click en "Finalizar Pedido" redirige a MP
- [ ] Página de éxito muestra correctamente
- [ ] Página de fallo muestra correctamente
- [ ] Página de pendiente muestra correctamente
- [ ] Orden se guarda correctamente en BD
- [ ] Email de confirmación se envía

### Integración (Full Flow)
- [ ] Pago exitoso → orden guardada como "Pagado"
- [ ] Pago rechazado → orden guardada como "Rechazado"
- [ ] Usuario puede ver órdenes pagadas
- [ ] Totales coinciden entre carrito y BD

---

## 9️⃣ DEBUGGING

### Habilitar logs detallados

En `shopping-cart.component.ts`, ya hay `console.log()` en:
- Creación de orden
- Creación de preferencia
- Errores

En Chrome DevTools (F12):
1. Abre "Console"
2. Busca logs de "Creando orden", "Creando preferencia"
3. Verifica respuestas

### Logs del Backend

En la terminal del backend verás:
```
[Webhook] Pago encontrado - ID: 1234567890, Estado: approved
[verifyPayment] Final - Estado: approved | orderId: 1
=== MP PREFERENCE BODY === {...}
=== MP ERROR === Error message...
```

### Network en Chrome DevTools

1. F12 → Network
2. Realiza un pago
3. Busca request a `/api/payment/create-preference`
4. Verifica:
   - Status: 201 (éxito)
   - Response: contiene `init_point`

---

## 🔟 PROBLEMAS COMUNES Y SOLUCIONES

### ❌ "Cannot GET /payment/success"
**Causa:** Ruta no registrada en frontend
**Solución:** Verifica `app.routes.ts` tenga todas las rutas de pago

### ❌ "init_point is undefined"
**Causa:** Mercado Pago no devolvió preferencia
**Solución:** Verifica que MP_ACCESS_TOKEN sea correcto y válido

### ❌ "Orden no encontrada"
**Causa:** ID de orden no coincide
**Solución:** Verifica que orderId se envía correctamente al backend

### ❌ "MP_ACCESS_TOKEN no está configurado"
**Causa:** Variable de entorno no leída
**Solución:** Reinicia el servidor con `.env` actualizado

### ❌ "Pago se procesa pero orden sigue en Pending"
**Causa:** Webhook no configurado
**Solución:** Configura URL pública en MP Dashboard o usa verify-payment manual

---

## 1️⃣1️⃣ VERIFICACIÓN FINAL

Ejecuta este comando para validar todo está correcto:

```bash
# Backend
http://localhost:3000/api/payment/create-preference \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "items": [{
      "productId": 1,
      "title": "Producto Test",
      "quantity": 1,
      "unit_price": 100
    }]
  }' | grep -o '"preference_id":"[^"]*"'

# Deberías ver:
# "preference_id":"ABC123..."
```

Si ves eso, ¡todo está listo! ✅

---

**Próximo paso:** Pruebas en producción con credenciales reales
