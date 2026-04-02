# 🔄 FLUJO DE ACTUALIZACIÓN DE ESTADO DE PAGOS - Mercado Pago

## 📋 Resumen

El sistema utiliza **dos métodos combinados** para garantizar que el estado de la orden se actualice cuando el cliente paga:

1. **Polling desde el Frontend** (Verificación activa)
2. **Webhook desde Mercado Pago** (Notificación automática)

---

## 1️⃣ MÉTODO 1: POLLING DESDE EL FRONTEND

### Flujo de Funcionamiento

```
Cliente hace clic en "Finalizar Pedido"
   ↓
1. Se crea orden en BD (estado: "pending")
2. Se guarda orderId en localStorage
3. Se crea preferencia de pago en MP
4. Se redirige a MP checkout
   ↓
Cliente paga en MP
   ↓
MP redirige a /payment/success
   ↓
Frontend carga PaymentSuccessComponent
   ↓
ngOnInit() → verifyPaymentStatus()
   ↓
Consulta a backend: /api/payment/verify-payment
   ↓
Backend consulta estado a Mercado Pago
   ↓
✅ Si aprobado → Actualiza orden a "Pagado"
❌ Si rechazado → Actualiza orden a "Rechazado"
⏳ Si pendiente → Reintenta cada 3 segundos (máx 3 intentos)
```

### Código Frontal

**Archivo:** `src/app/payment-success/payment-success.component.ts`

```typescript
verifyPaymentStatus(): void {
  // Verifica estado con backend
  this.paymentService.verifyPayment(this.orderId).subscribe({
    next: (response) => {
      if (response.paymentStatus === 'approved') {
        // ✅ Pago aprobado
        this.message = '¡Pago completado exitosamente!';
        // Orden ya está en "Pagado" (hecho por backend)
      } else if (response.paymentStatus === 'pending') {
        // ⏳ Reintenta en 3 segundos
        this.retryCount++;
        setTimeout(() => this.verifyPaymentStatus(), 3000);
      }
    }
  });
}
```

### Código Backend

**Archivo:** `src/payment/payment.controller.ts`

```typescript
async function verifyPayment(req: Request, res: Response): Promise<void> {
  // 1. Busca el pago en Mercado Pago
  const paymentInfo = await paymentApi.get({ id: paymentId });
  
  // 2. Obtiene el estado
  const paymentStatus = paymentInfo.status; // "approved", "rejected", "pending"
  
  // 3. Actualiza la orden en BD
  if (paymentStatus === 'approved') {
    order.estado = 'Pagado';
  } else if (paymentStatus === 'rejected') {
    order.estado = 'Rechazado';
  }
  
  // 4. Guarda cambios
  await em.flush();
  
  // 5. Devuelve respuesta
  res.json({
    paymentStatus,
    orderStatus: order.estado
  });
}
```

### Ventajas

✅ Funciona en localhost (sin necesidad de URL pública)
✅ Feedback inmediato al usuario
✅ No depende de webhook configurado
✅ Reintentos automáticos si hay demora

### Tiempo de Actualización

- ✅ Si pago aprobado: 0-5 segundos
- ⏳ Si pago pendiente: Reintenta cada 3 seg (hasta 9 seg)
- ❌ Si pago rechazado: Inmediato

---

## 2️⃣ MÉTODO 2: WEBHOOK DESDE MERCADO PAGO

### Flujo de Funcionamiento

```
Cliente paga en MP
   ↓
MP detecta cambio de estado del pago
   ↓
MP envía POST a /api/payment/webhook (en producción)
   ↓
Backend recibe notificación
   ↓
Backend consulta detalles del pago
   ↓
Backend actualiza orden en BD automáticamente
   ↓
✅ Orden actualizada en tiempo real (sin polling)
```

### Código Backend

**Archivo:** `src/payment/payment.controller.ts`

```typescript
async function handleWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { type, data } = req.body;
    
    // Solo procesamos cambios de pago
    if (type !== 'payment') return;
    
    // Obtiene detalles del pago
    const paymentInfo = await paymentApi.get({ id: data.id });
    const paymentStatus = paymentInfo.status;
    const orderId = paymentInfo.external_reference;
    
    // Busca la orden
    const order = await em.findOne(Order, { id: orderId });
    
    // Actualiza estado
    order.estado = 
      paymentStatus === 'approved' ? 'Pagado' :
      paymentStatus === 'rejected' ? 'Rechazado' :
      'Pago Pendiente';
    
    // Guarda en BD
    await em.flush();
    
    // Responde OK (importante: siempre 200)
    res.sendStatus(200);
  } catch (error) {
    // IMPORTANTE: Siempre responder 200 para evitar reintentos infinitos
    res.sendStatus(200);
  }
}
```

### Configuración en Producción

1. **URL Pública:**
   - Tu URL público debe ser `https://tu-dominio.com`
   - Webhook URL: `https://tu-dominio.com/api/payment/webhook`

2. **Configurar en Mercado Pago Dashboard:**
   - Ve a: Mi Cuenta → Integraciones → Webhooks
   - Clic en "Nueva notificación"
   - URL: `https://tu-dominio.com/api/payment/webhook`
   - Tópico: `payment`
   - Eventos: Selecciona relevantes

3. **Validar Webhook en MP:**
   - MP enviará notificaciones de prueba
   - Deberías ver logs como:
   ```
   [Webhook] Tipo: payment
   [Webhook] Status: approved
   [Webhook] ✅ Orden actualizada
   ```

### Ventajas

✅ Automatizado sin polling
✅ Más eficiente
✅ No consume recursos del cliente
✅ Funciona en background

### Limitaciones

❌ Requiere URL pública (no funciona en localhost)
❌ Dependencia de disponibilidad de MP
❌ Puede tener demoras (segundos a minutos)

---

## 🎯 DECISIÓN DE ARQUITECTURA

### En DESARROLLO (Localhost):
- ✅ **Solo Polling**: Ya que no tenemos URL pública
- Tiempo de confirmación: ~3-9 segundos

### En PRODUCCIÓN:
- ✅ **Ambos métodos**:
  - Polling como respaldo rápido
  - Webhook como método principal
- Tiempo de confirmación: ~1-5 segundos (webhook)

---

## 📊 ESTADOS DE LA ORDEN

```
"pending"           → Orden creada, esperando pago
    ↓
CLIENTE PAGA
    ↓
"Pagado"            → Pago aprobado por MP
    o
"Rechazado"         → Pago rechazado por MP
    o
"Pago Pendiente"    → Pago en procesamiento
```

---

## 🔍 DEBUGGING

### Ver logs de Polling (Frontend)

Abre DevTools (F12) → Console:

```
[PaymentSuccess] Verificando estado del pago para orden #1
[PaymentSuccess] ✅ Pago APROBADO
```

### Ver logs de Webhook (Backend)

En terminal del backend:

```
[Webhook] ============================================
[Webhook] Evento recibido de Mercado Pago
[Webhook] Tipo: payment
[Webhook] Status: approved
[Webhook] ✅ Pago APROBADO → Estado = "Pagado"
[Webhook] 📊 Transición de estado: pending → Pagado
[Webhook] ✅ Orden actualizada en base de datos
```

---

## 🛡️ SEGURIDAD

### Validaciones en place:

1. **Frontend:**
   - Verifica que orderId existe en localStorage
   - Reintentos limitados (máx 3)

2. **Backend:**
   - Valida que orden existe en BD
   - Obtiene estado directo de MP (source of truth)
   - Actualiza solo si estado cambió
   - Responde 200 incluso si error (para evitar reintentos infinitos)

### Token de acceso:
- ✅ Almacenado en `.env` (nunca expuesto al cliente)
- ✅ Solo el backend consulta a MP
- ✅ Frontend solo llama a endpoints locales

---

## 📈 FLUJO COMPLETO DE EJEMPLO

```
13:45:00 → Usuario hace clic "Finalizar Pedido"
13:45:01 → Orden creada: id=123, estado="pending"
13:45:02 → Preferencia de pago creada en MP
13:45:03 → Redirige a MP checkout
13:45:15 → Cliente ingresa datos de tarjeta
13:45:20 → Cliente hace clic en "Pagar"
13:45:21 → MP procesa pago → APROBADO
13:45:22 → MP envía webhook (backend recibe)
13:45:22 → [Backend] Actualiza orden a "Pagado"
13:45:23 → Frontend cargada en /payment/success
13:45:24 → Frontend verifica estado
13:45:24 → [Frontend] Recibe "Pagado"
13:45:24 → Muestra: "¡Pago completado exitosamente!"

Total: ~24 segundos del clic al éxito
```

---

## 🚀 PRÓXIMAS VERSIONES

Considerar para mejorar:

1. **WebSocket**: Notificaciones en tiempo real sin polling
2. **Batch Processing**: Procesar múltiples pagos juntos
3. **Retry Policy**: Reintentos exponenciales más sofisticados
4. **Audit Log**: Registrar todos los cambios de estado de pagos
5. **Reconciliation**: Script para reconciliar BD con MP diariamente

---

**Última actualización:** 2026-04-02
**Status:** ✅ PRODUCTION READY
