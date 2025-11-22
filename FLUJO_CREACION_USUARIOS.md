# Flujo de Creación de Usuarios sin Contraseña

## 📋 Descripción General

Este sistema implementa un flujo seguro de creación de usuarios donde:
- El **administrador** crea usuarios SIN contraseña
- El **nuevo usuario** recibe un email de confirmación
- Tras confirmar, el usuario **crea su propia contraseña**
- Solo entonces puede **iniciar sesión**

## 🔄 Flujo Completo (Paso a Paso)

### 1️⃣ Administrador Crea Usuario

**Frontend:** `FormularioUsuario.jsx`
- Admin completa el formulario con: nombre, email, rol, teléfono
- **NO** se solicita contraseña
- Se envía POST a `/api/usuarios`

**Backend:** `usuarioController.js → registrar()`
```javascript
// Crear usuario SIN password
const usuario = new Usuario({
    nombre,
    email,
    rol,
    telefono,
    confirmado: false,  // Debe confirmar email
    token: generarId()  // Token para confirmación
});
```

**Email Enviado:**
```
Subject: Confirma tu cuenta en Clínica Veterinaria
Body: Haz clic en este enlace para confirmar tu cuenta:
      https://tu-dominio.com/confirmar/{token}
```

---

### 2️⃣ Usuario Recibe Email y Confirma

**Usuario:** Hace clic en el enlace del email

**Frontend:** `ConfirmarCuenta.jsx`
- Obtiene el token de la URL: `/confirmar/{token}`
- Hace GET a `/api/usuarios/confirmar/{token}`

**Backend:** `usuarioController.js → confirmar()`
```javascript
// Marcar como confirmado PERO mantener el token
usuarioConfirmar.confirmado = true;
await usuarioConfirmar.save();

// Devolver el token para crear password
res.json({ 
    msg: "Email confirmado. Ahora debes crear tu contraseña.",
    token: usuarioConfirmar.token  // ← IMPORTANTE
});
```

**Frontend:** Redirige automáticamente a:
```javascript
navigate(`/restablecer-password/${data.token}`)
```

---

### 3️⃣ Usuario Crea su Contraseña

**Frontend:** `NuevoPassword.jsx`
- Usuario ingresa su nueva contraseña (mínimo 6 caracteres)
- Se envía POST a `/api/usuarios/olvide-password/{token}`

**Backend:** `usuarioController.js → nuevoPassword()`
```javascript
const usuario = await Usuario.findOne({ token });

usuario.token = null;           // Limpiar token
usuario.password = password;    // Establecer password
usuario.confirmado = true;      // Asegurar confirmación
await usuario.save();           // Password se hashea automáticamente
```

**Frontend:** Redirige al login tras 2 segundos

---

### 4️⃣ Usuario Inicia Sesión

**Frontend:** `Login.jsx`
- Usuario ingresa email y password
- POST a `/api/usuarios/login`

**Backend:** `usuarioController.js → autenticar()`
```javascript
// Verificaciones en orden:
1. ¿Usuario existe?
2. ¿Email confirmado? → if(!usuario.confirmado) throw Error
3. ¿Tiene password? → if(!usuario.password) throw Error ← NUEVO
4. ¿Está activo?
5. ¿Password correcto?
```

**Respuesta Exitosa:**
```json
{
  "_id": "...",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "veterinario",
  "token": "JWT_TOKEN_HERE"
}
```

---

## 🔐 Modelo Usuario (Cambios)

**Antes:**
```javascript
password: {
    type: String,
    required: true  // ← Obligatorio
}
```

**Después:**
```javascript
password: {
    type: String,
    required: false  // ← Opcional
}
```

**Pre-save hook actualizado:**
```javascript
usuarioSchema.pre('save', async function(next) {
    // Solo hashear si el password existe y fue modificado
    if(!this.password || !this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
```

---

## 📧 Emails Enviados

### Email 1: Confirmación de Cuenta
**Trigger:** Admin crea usuario  
**Helper:** `emailRegistro.js`  
**Link:** `https://tu-dominio.com/confirmar/{token}`

### Email 2: (Opcional) Recuperar Contraseña
**Trigger:** Usuario olvidó password  
**Helper:** `emailOlvidePassword.js`  
**Link:** `https://tu-dominio.com/restablecer-password/{token}`

---

## 🛡️ Seguridad

### Ventajas del Flujo Actual:
✅ **Admin NO conoce la contraseña** del usuario  
✅ **Usuario tiene control total** desde el inicio  
✅ **Verificación de email obligatoria**  
✅ **Passwords hasheados con bcrypt** (10 rounds)  
✅ **Token único y temporal** por usuario  
✅ **No se puede iniciar sesión sin password**  

### Estados del Usuario:
| Estado | confirmado | password | ¿Puede login? |
|--------|-----------|----------|---------------|
| Recién creado | `false` | `null` | ❌ No |
| Email confirmado | `true` | `null` | ❌ No (falta password) |
| Password creado | `true` | `hash` | ✅ Sí |

---

## 🧪 Testing del Flujo

### Escenario 1: Creación Normal
```bash
1. POST /api/usuarios (admin crea usuario)
   → Status 200, usuario guardado sin password
   
2. GET /api/usuarios/confirmar/{token}
   → Status 200, confirmado=true, devuelve token
   
3. POST /api/usuarios/olvide-password/{token}
   → Status 200, password hasheado y guardado
   
4. POST /api/usuarios/login
   → Status 200, devuelve JWT token
```

### Escenario 2: Login sin Confirmar Email
```bash
POST /api/usuarios/login
→ Status 403: "Tu cuenta no ha sido confirmada"
```

### Escenario 3: Login sin Crear Password
```bash
POST /api/usuarios/login
→ Status 403: "Debes crear tu contraseña primero"
```

---

## 🔧 Endpoints Clave

| Endpoint | Método | Protegido | Descripción |
|----------|--------|-----------|-------------|
| `/api/usuarios` | POST | ✅ Admin | Crear usuario |
| `/api/usuarios/confirmar/:token` | GET | ❌ | Confirmar email |
| `/api/usuarios/olvide-password/:token` | GET | ❌ | Validar token |
| `/api/usuarios/olvide-password/:token` | POST | ❌ | Crear/resetear password |
| `/api/usuarios/login` | POST | ❌ | Autenticar |

---

## 📝 Variables de Entorno

```env
# Admin por defecto (auto-creado)
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@vetclinic.com
ADMIN_PASSWORD=Admin123!

# Email (Mailtrap para desarrollo)
EMAIL_USER=your_mailtrap_user
EMAIL_PASS=your_mailtrap_pass
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525

# JWT
JWT_SECRET=your_secret_key

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## 🎯 Mejoras Futuras

- [ ] Expiración de tokens de confirmación (ej: 24 horas)
- [ ] Reenvío de email de confirmación
- [ ] Validación de fortaleza de contraseña
- [ ] Notificación al admin cuando usuario completa registro
- [ ] Logs de auditoría de creación de usuarios

---

## 📚 Archivos Modificados

### Backend
- `models/Usuario.js` - Password opcional
- `controllers/usuarioController.js` - Lógica actualizada
- `utils/crearAdminDefault.js` - Admin automático

### Frontend
- `components/FormularioUsuarioForm.jsx` - Sin campo password
- `paginas/usuario/FormularioUsuario.jsx` - Sin validación password
- `paginas/auth/ConfirmarCuenta.jsx` - Redirige a crear password
- `paginas/auth/NuevoPassword.jsx` - Mensajes adaptativos

---

## 🚀 Comandos de Inicio

```bash
# Backend
cd backend
pnpm install
pnpm dev

# Frontend
cd frontend
pnpm install
pnpm dev
```

---

**Fecha de Implementación:** 21 de Noviembre, 2025  
**Versión:** 1.0.0  
**Autor:** Vic-Lara-Gilles
