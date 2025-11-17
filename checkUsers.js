import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB\n');
    
    const usuarios = await Usuario.find({}, 'nombre email rol confirmado');
    
    console.log('📋 Usuarios en la base de datos:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos');
    } else {
      usuarios.forEach(u => {
        console.log(`✓ ${u.nombre}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Rol: ${u.rol || 'NO DEFINIDO'}`);
        console.log(`  Confirmado: ${u.confirmado ? 'SÍ' : 'NO'}`);
        console.log('');
      });
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Total: ${usuarios.length} usuarios\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
