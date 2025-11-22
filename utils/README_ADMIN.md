# Administrador por Defecto

## ¿Cómo funciona?

El sistema crea automáticamente un administrador por defecto al iniciar el servidor si no existe ningún admin en la base de datos.

## Configuración

Las credenciales del administrador se configuran en el archivo `.env`:

```env
ADMIN_NAME=Super Admin
ADMIN_EMAIL=admin@vetclinic.com
ADMIN_PASSWORD=Admin123!
```

## Uso

1. **Primera vez**: Al iniciar el servidor, verás este mensaje en la consola:
   ```
   ✅ Administrador por defecto creado exitosamente
   📧 Email: admin@vetclinic.com
   🔑 Contraseña: Admin123!
   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login
   ```

2. **Inicios posteriores**: Si el admin ya existe, verás:
   ```
   ℹ️  Admin ya existe en el sistema
   ```

3. **Iniciar sesión**:
   - Ve a `http://localhost:5173`
   - Email: `admin@vetclinic.com`
   - Contraseña: `Admin123!`

## Seguridad

⚠️ **IMPORTANTE**: 
- Cambia la contraseña después del primer login
- En producción, usa contraseñas fuertes y únicas
- No compartas las credenciales del `.env`
- El archivo `.env` está en `.gitignore` para evitar subirlo al repositorio

## Credenciales por Defecto

Si no defines las variables en `.env`, se usarán estos valores:
- **Nombre**: Super Admin
- **Email**: admin@vetclinic.com
- **Contraseña**: Admin123!
- **Rol**: admin
- **Confirmado**: true

## Cambiar Credenciales

Para cambiar las credenciales del admin por defecto:

1. Edita el archivo `.env`
2. Elimina el admin actual de la base de datos (si existe)
3. Reinicia el servidor

O simplemente usa la interfaz del sistema para modificar los datos del admin existente.
