# Flujo de Creación de Clientes con Contraseña Temporal

## 📋 Descripción General

Este sistema implementa un flujo para clientes donde:
- El **personal de la clínica** (admin/recepción) crea clientes
- La **contraseña temporal es el RUT sin puntos ni guión**
- El **cliente recibe un email** con sus credenciales y enlace de verificación
- Tras verificar email, el cliente **puede cambiar su contraseña**
- Solo entonces puede **acceder al portal de clientes**

## 🔄 Flujo Completo (Paso a Paso)

### 1️⃣ Personal Crea Cliente

**Frontend:** Formulario de creación de cliente
- Personal completa: nombre, apellido, RUT, email, teléfono, dirección, etc.
- **NO** se solicita contraseña (se genera automáticamente)
- Se envía POST a `/api/clientes`

**Backend:** `clienteController.js → registrar()`
```javascript
// Generar contraseña temporal usando el RUT sin puntos ni guión
const passwordTemporal = rut.replace(/[.-]/g, '');

const cliente = new Cliente({
    ...datos,
    password: passwordTemporal,      // RUT sin formato
    emailVerificado: false,           // Debe verificar email
    token: generarId()                // Token para verificación
});
```

**Email Enviado:** `emailBienvenidaCliente`
```
Subject: Bienvenido a Clínica Veterinaria - Verifica tu cuenta

Contenido:
- Saludo personalizado
- Botón de verificación de cuenta
- Credenciales de acceso:
  * Email: cliente@example.com
  * Contraseña temporal: 123456789 (RUT sin puntos ni guión)
- Instrucciones para cambiar contraseña
- Listado de funcionalidades del portal
```

---

### 2️⃣ Cliente Recibe Email y Verifica Cuenta

**Cliente:** Hace clic en "Verificar mi cuenta" en el email

**Frontend:** Página de confirmación (Portal)
- Obtiene el token de la URL: `/portal/confirmar/{token}`
- Hace GET a `/api/clientes/confirmar/${token}`

**Backend:** `clienteController.js → confirmarEmail()`
```javascript
// Marcar como verificado PERO mantener el token
cliente.emailVerificado = true;
await cliente.save();

// Devolver el token para cambiar password
res.json({ 
    msg: "Email verificado. Ahora puedes cambiar tu contraseña.",
    token: cliente.token  // ← IMPORTANTE
});
```

**Frontend:** Redirige automáticamente a cambiar contraseña
```javascript
navigate(`/portal/restablecer-password/${data.token}`)
```

---

### 3️⃣ Cliente Cambia su Contraseña

**Frontend:** Página de cambio de contraseña
- Cliente ingresa nueva contraseña (mínimo 6 caracteres)
- Confirma nueva contraseña (deben coincidir)
- Se envía POST a `/api/clientes/olvide-password/{token}`

**Backend:** `clienteController.js → nuevoPasswordCliente()`
```javascript
const cliente = await Cliente.findOne({ token });

cliente.token = null;                  // Limpiar token
cliente.password = password;           // Nueva password personalizada
cliente.emailVerificado = true;        // Asegurar verificación
await cliente.save();                  // Password se hashea automáticamente
```

**Frontend:** Redirige al login del portal tras 2 segundos

---

### 4️⃣ Cliente Inicia Sesión en el Portal

**Frontend:** Login del portal de clientes
- Cliente ingresa email y su nueva contraseña
- POST a `/api/clientes/login`

**Backend:** `clienteController.js → autenticarCliente()`
```javascript
// Verificaciones en orden:
1. ¿Cliente existe?
2. ¿Email verificado? → if(!cliente.emailVerificado) throw Error
3. ¿Está activo? → if(!cliente.activo) throw Error
4. ¿Password correcto?
```

**Respuesta Exitosa:**
```json
{
  "_id": "...",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "rut": "12.345.678-9",
  "telefono": "+56912345678",
  "token": "JWT_TOKEN_HERE"
}
```

---

## 🔐 Modelo Cliente

```javascript
{
    nombre: String (required),
    apellido: String (required),
    rut: String (required, unique),
    email: String (required, unique),
    password: String (required),        // Se hashea automáticamente
    telefono: String (required),
    direccion: String,
    ciudad: String,
    comuna: String,
    emailVerificado: Boolean (default: false),
    token: String (generarId()),
    activo: Boolean (default: true),
    fechaRegistro: Date,
    registradoPor: ObjectId (Usuario),
    notas: String
}
```

---

## 📧 Emails Enviados

### Email 1: Bienvenida con Credenciales
**Trigger:** Personal crea cliente  
**Helper:** `emailBienvenidaCliente.js`  
**Contenido:**
- Credenciales de acceso (email + RUT como password)
- Link de verificación: `https://tu-dominio.com/portal/confirmar/{token}`
- Instrucciones para cambiar contraseña
- Funcionalidades del portal

### Email 2: (Opcional) Recuperar Contraseña
**Trigger:** Cliente olvidó password  
**Helper:** `emailOlvidePassword.js`  
**Link:** `https://tu-dominio.com/portal/restablecer-password/{token}`

---

## 🛡️ Seguridad

### Ventajas del Flujo Actual:
✅ **Contraseña temporal predecible solo por el dueño** (su RUT)  
✅ **Email de verificación obligatorio**  
✅ **Cliente cambia contraseña inmediatamente** después de verificar  
✅ **Passwords hasheados con bcrypt** (10 rounds)  
✅ **Token único y temporal** por cliente  
✅ **No se puede acceder sin verificar email**  

### Estados del Cliente:
| Estado | emailVerificado | password | ¿Puede login? |
|--------|----------------|----------|---------------|
| Recién creado | `false` | `RUT sin formato` | ❌ No (falta verificación) |
| Email verificado | `true` | `RUT sin formato` | ⚠️ Sí (debe cambiar password) |
| Password cambiado | `true` | `hash personalizado` | ✅ Sí |

---

## 🧪 Testing del Flujo

### Escenario 1: Creación Normal
```bash
# Ejemplo con RUT: 12.345.678-9

1. POST /api/clientes (personal crea cliente)
   Body: { nombre, apellido, rut: "12.345.678-9", email, ... }
   → Status 200
   → Password guardado: "123456789" (hasheado)
   → Email enviado con credenciales
   
2. GET /api/clientes/confirmar/{token}
   → Status 200
   → emailVerificado = true
   → Devuelve token para cambiar password
   
3. POST /api/clientes/olvide-password/{token}
   Body: { password: "MiNuevaPassword123" }
   → Status 200
   → Password actualizado y hasheado
   
4. POST /api/clientes/login
   Body: { email, password: "MiNuevaPassword123" }
   → Status 200
   → Devuelve JWT token
```

### Escenario 2: Login sin Verificar Email
```bash
POST /api/clientes/login
→ Status 403: "Debes verificar tu email antes de acceder"
```

### Escenario 3: Login con Password Temporal
```bash
# Cliente verificó email pero NO cambió password

POST /api/clientes/login
Body: { email, password: "123456789" }  # RUT sin formato
→ Status 200 (pero debería cambiar password)
```

---

## 🔧 Endpoints Clave

| Endpoint | Método | Protegido | Descripción |
|----------|--------|-----------|-------------|
| `/api/clientes` | POST | ✅ Personal | Crear cliente |
| `/api/clientes/confirmar/:token` | GET | ❌ | Verificar email |
| `/api/clientes/olvide-password/:token` | GET | ❌ | Validar token |
| `/api/clientes/olvide-password/:token` | POST | ❌ | Cambiar password |
| `/api/clientes/login` | POST | ❌ | Autenticar cliente |
| `/api/clientes/perfil` | GET | ✅ Cliente | Perfil del cliente |

---

## 📝 Ejemplo de Email HTML

```html
¡Bienvenido a Clínica Veterinaria!

Hola Juan,

Tu cuenta ha sido creada exitosamente. Para acceder al portal de clientes, 
primero debes verificar tu correo electrónico.

[Verificar mi cuenta]

📧 Tus credenciales de acceso:
Email: juan@example.com
Contraseña temporal: 123456789

⚠️ Importante: Tu contraseña temporal es tu RUT sin puntos ni guión. 
Después de verificar tu email, podrás cambiarla por una contraseña personalizada.

Una vez verificada tu cuenta, podrás:
• Cambiar tu contraseña por una personalizada
• Ver la información de tus mascotas
• Agendar citas
• Revisar el historial médico
• Y mucho más...
```

---

## 🆚 Diferencias con Flujo de Usuarios (Personal)

| Aspecto | Usuarios (Personal) | Clientes |
|---------|-------------------|----------|
| **Quién crea** | Solo admin | Admin o recepción |
| **Password inicial** | Sin password | RUT sin formato |
| **Email enviado** | `emailRegistro` | `emailBienvenidaCliente` |
| **Contenido email** | Solo link verificación | Link + credenciales |
| **Confirmación** | Redirige a crear password | Redirige a cambiar password |
| **Puede login sin verificar** | No | No |
| **Portal de acceso** | `/admin` | `/portal` |

---

## 📚 Archivos Modificados/Creados

### Backend
- `models/Cliente.js` - Ya existía con password required
- `controllers/clienteController.js` - Actualizado con flujo automático
- `helpers/emailBienvenidaCliente.js` - **NUEVO** - Email con credenciales
- `routes/clienteRoutes.js` - Rutas existentes

### Helpers
```javascript
// emailBienvenidaCliente.js
- Recibe: { email, nombre, rut, token }
- Calcula: passwordTemporal = rut.replace(/[.-]/g, '')
- Envía: Email con credenciales + link verificación
```

---

## 🎯 Mejoras Futuras

- [ ] Expiración de tokens de verificación (ej: 48 horas)
- [ ] Forzar cambio de contraseña en primer login
- [ ] Recordatorio por email si no verifica en X días
- [ ] Validación de fortaleza de contraseña
- [ ] Historial de passwords (no repetir últimas N)
- [ ] Notificación al personal cuando cliente verifica cuenta

---

## 🚀 Comandos para Testing

```bash
# Crear cliente (como personal autenticado)
curl -X POST http://localhost:4000/api/clientes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "rut": "12.345.678-9",
    "email": "juan@example.com",
    "telefono": "+56912345678"
  }'

# Verificar email
curl http://localhost:4000/api/clientes/confirmar/TOKEN_AQUI

# Cambiar password
curl -X POST http://localhost:4000/api/clientes/olvide-password/TOKEN_AQUI \
  -H "Content-Type: application/json" \
  -d '{"password": "MiNuevaPassword123"}'

# Login
curl -X POST http://localhost:4000/api/clientes/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "MiNuevaPassword123"
  }'
```

---

**Fecha de Implementación:** 21 de Noviembre, 2025  
**Versión:** 1.0.0  
**Autor:** Vic-Lara-Gilles
