import mongoose from 'mongoose';
import Usuario from '../models/Usuario.js';
import Veterinario from '../models/Veterinario.js';
import Cita from '../models/Cita.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tu_basededatos';

async function migrarVeterinarios() {
  await mongoose.connect(MONGO_URI);
  console.log('Conectado a MongoDB');

  // 1. Buscar todos los usuarios con rol veterinario
  const usuariosVet = await Usuario.find({ rol: 'veterinario' });
  console.log(`Veterinarios encontrados: ${usuariosVet.length}`);

  for (const usuario of usuariosVet) {
    // 2. Crear documento en Veterinario
    let vet = await Veterinario.findOne({ usuario: usuario._id });
    if (!vet) {
      vet = new Veterinario({
        usuario: usuario._id,
        especialidad: usuario.especialidad,
        licenciaProfesional: usuario.licenciaProfesional
      });
      await vet.save();
      console.log(`Veterinario creado para usuario ${usuario._id}`);
    }
    // 3. Actualizar todas las citas que apunten a este usuario como veterinario
    const result = await Cita.updateMany(
      { veterinario: usuario._id },
      { $set: { veterinario: vet._id } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Citas actualizadas para veterinario ${usuario._id}: ${result.modifiedCount}`);
    }
    // 4. Limpiar campos de veterinario en Usuario
    usuario.especialidad = undefined;
    usuario.licenciaProfesional = undefined;
    await usuario.save();
  }

  console.log('Migración completada.');
  await mongoose.disconnect();
}

migrarVeterinarios().catch(e => {
  console.error('Error en migración:', e);
  process.exit(1);
});
