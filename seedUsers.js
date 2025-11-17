import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';
import dotenv from 'dotenv';

dotenv.config();

const conectarDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${db.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

const usuarios = [
  {
    nombre: 'Admin Principal',
    email: 'admin@veterinaria.com',
    password: 'admin@veterinaria.com',
    rol: 'admin',
    telefono: '123456789',
    confirmado: true,
  },
  {
    nombre: 'Dr. Carlos Veterinario',
    email: 'veterinario@veterinaria.com',
    password: 'veterinario@veterinaria.com',
    rol: 'veterinario',
    telefono: '987654321',
    confirmado: true,
  },
  {
    nombre: 'María Recepción',
    email: 'recepcion@veterinaria.com',
    password: 'recepcion@veterinaria.com',
    rol: 'recepcion',
    telefono: '555123456',
    confirmado: true,
  },
];

const seedUsers = async () => {
  try {
    await conectarDB();

    // Limpiar usuarios de prueba existentes
    await Usuario.deleteMany({ 
      email: { $in: ['admin@veterinaria.com', 'veterinario@veterinaria.com', 'recepcion@veterinaria.com'] } 
    });
    console.log('🗑️  Usuarios de prueba anteriores eliminados\n');

    // Crear nuevos usuarios
    for (const userData of usuarios) {
      const usuario = new Usuario(userData);
      await usuario.save();
      console.log(`✅ Usuario creado: ${userData.email} (${userData.rol})`);
    }

    console.log('\n🎉 Seed completado!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@veterinaria.com');
    console.log('   Password: admin@veterinaria.com');
    console.log('\n🩺 VETERINARIO:');
    console.log('   Email: veterinario@veterinaria.com');
    console.log('   Password: veterinario@veterinaria.com');
    console.log('\n📞 RECEPCIÓN:');
    console.log('   Email: recepcion@veterinaria.com');
    console.log('   Password: recepcion@veterinaria.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seedUsers();
