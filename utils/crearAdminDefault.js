import Usuario from '../models/Usuario.js';

/**
 * Crea un administrador por defecto si no existe ningún admin en el sistema
 * Se ejecuta automáticamente al iniciar el servidor
 */
const crearAdminDefault = async () => {
    try {
        // Verificar si ya existe un administrador
        const adminExiste = await Usuario.findOne({ rol: 'admin' });
        
        if (adminExiste) {
            console.log('Admin ya existe en el sistema');
            return;
        }

        // Obtener credenciales desde variables de entorno o usar valores por defecto
        const adminData = {
            nombre: process.env.ADMIN_NAME || 'Super Admin',
            email: process.env.ADMIN_EMAIL || 'admin@vetclinic.com',
            password: process.env.ADMIN_PASSWORD || 'Admin123!',
            rol: 'admin',
            confirmado: true
        };

        // Crear el administrador
        const admin = new Usuario(adminData);
        await admin.save();

        console.log('Administrador por defecto creado exitosamente');
        console.log(`Email: ${adminData.email}`);
        console.log(`Contraseña: ${adminData.password}`);
        console.log('IMPORTANTE: Cambia la contraseña después del primer login');
        
    } catch (error) {
        console.error('Error al crear administrador por defecto:', error.message);
    }
};

export default crearAdminDefault;
