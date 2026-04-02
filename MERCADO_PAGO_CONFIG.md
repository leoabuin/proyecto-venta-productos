# Configuración de Mercado Pago

## Variables de Entorno Requeridas

Para que Mercado Pago Checkout funcione correctamente, necesitas agregar las siguientes variables en tu archivo `.env`:

```env
# Mercado Pago (obtener en https://www.mercadopago.com.ar/developers)
MP_ACCESS_TOKEN=APP_USR-1340547747440107-031915-d7dd39e6201875526ab5db0f5959154e-3276888618
MP_PUBLIC_KEY=APP_USR-bd1fb445-1a29-41ca-9659-fb98f4c7b9b0
MP_WEBHOOK_SECRET=tu_clave_secreta_webhook (opcional para webhook)

# URLs (usadas para redirect después del pago)
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3000
```

## Cómo Obtener las Credenciales

1. **Registrate en Mercado Pago:** https://www.mercadopago.com.ar/developers
2. **Por primera vez:**
   - Inicia sesión en tu cuenta de Mercado Pago
   - Ve a "Mi cuenta" → "Credenciales"
   - Bajo "Credenciales de prueba (Sandbox)" encontrarás:
     - **Access Token**: Para autenticar solicitudes desde el backend
     - **Public Key**: Para integración en el frontend

3. **Para Producción:**
   - Las credenciales de producción las encuentras en la misma sección
   - Asegúrate de cambiar `NODE_ENV=production` cuando despliegues

## Validaciones Implementadas

El sistema validará automáticamente:

✅ **Variables de Entorno:**
- Verifica que `MP_ACCESS_TOKEN` esté configurado
- Verifica que `MP_PUBLIC_KEY` esté configurado
- Valida el formato (deben empezar con `APP_USR-`)
- Valida que todas las variables requeridas estén presentes

✅ **Mercado Pago:**
- Valida credenciales al iniciar el servidor
- Proporciona errores descriptivos si hay problemas
- Alerta sobre uso de credenciales sandbox vs producción

✅ **Base de Datos:**
- Valida credenciales de MySQL
- Verifica JWT_SECRET configurado

## Flujo de Validación

Cuando inicia el servidor:

```
1. Cargar variables de .env
   ↓
2. Validar estructura de variables (Zod)
   ↓
3. Validar Mercado Pago específicamente
   ↓
4. Si todo está correcto → Servidor listo
   ↓
5. Si hay errores → Parar el servidor y mostrar errores
```

## Errores Comunes y Soluciones

### ❌ "MP_ACCESS_TOKEN no está configurado"
**Solución:** Asegúrate de agregar `MP_ACCESS_TOKEN` en el archivo `.env`

### ❌ "MP_ACCESS_TOKEN debe comenzar con APP_USR-"
**Solución:** El token que copiaste no es válido. Copia nuevamente de Mercado Pago

### ❌ "Error de autenticación con Mercado Pago"
**Solución:** El token de acceso es incorrecto o expiró. Regenera las credenciales en MP

### ❌ "NODE_ENV=production pero credenciales son sandbox"
**Advertencia:** Solo advierte, pero puedes usarlo. Asegúrate de cambiar a credenciales de producción

## Testing con Mercado Pago

Para probar pagos en sandbox:

**Tarjeta de TestCC válida:**
- Número: `4111111111111111`
- Nombres: Cualquiera
- Fecha de vencimiento: Cualquier fecha futura (ej: 11/25)
- CVV: Cualquier número (ej: 123)

**Email de TestCC:**
- `test_user_12345@testuser.com`

Estos datos harán que el pago se apruebe siempre en sandbox.

## Verificación

Para verificar que todo está configurado correctamente:

1. **Revisa los logs al iniciar el servidor:**
   ```
   ✅ Variables de entorno validadas correctamente
   ℹ️  MERCADO PAGO: Usando credenciales de SANDBOX (development)
   ✅ Configuración de Mercado Pago validada exitosamente
   ```

2. **Prueba crear una preferencia de pago:**
   ```bash
   curl -X POST http://localhost:3000/api/payment/create-preference \
     -H "Content-Type: application/json" \
     -d '{
       "orderId": 1,
       "items": [
         {
           "productId": 1,
           "title": "Producto Test",
           "quantity": 1,
           "unit_price": 100
         }
       ]
     }'
   ```

3. **Deberías recibir una respuesta como:**
   ```json
   {
     "message": "Preferencia de pago creada",
     "preference_id": "ABC123...",
     "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?...",
     "sandbox_init_point": "https://sandbox.mercadopago.com.ar/checkout/v1/redirect?..."
   }
   ```

## Webhook (Opcional pero Recomendado)

Para recibir notificaciones de cambios de estado de pagos:

1. Configura URL en Mercado Pago dashboard:
   - `https://tu-dominio.com/api/payment/webhook`

2. Las cadenas de webhook se validan con `MP_WEBHOOK_SECRET`

3. El webhook actualiza automáticamente el estado de la orden
