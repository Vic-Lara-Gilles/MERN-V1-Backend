import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';
import dotenv from 'dotenv';

dotenv.config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB\n');
    
    const email = 'admin@veterinaria.com';
    const password = 'Admin123!';
    
    const usuario = await Usuario.findOne({ email });
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log('✅ Usuario encontrado:');
    console.log(`   Nombre: ${usuario.nombre}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Rol: ${usuario.rol}`);
    console.log(`   Confirmado: ${usuario.confirmado}`);
    console.log('');
    
    const passwordCorrecto = await usuario.comprobarPassword(password);
    
    if (passwordCorrecto) {
      console.log('✅ Password CORRECTO');
      console.log(`   Puedes iniciar sesión con:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
    } else {
      console.log('❌ Password INCORRECTO');
      console.log('   El password almacenado no coincide con Admin123!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
