import mongoose from "mongoose";

const veterinarioSchema = mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
  especialidad: { type: String, trim: true },
  licenciaProfesional: { type: String, trim: true },
  // Puedes agregar más campos específicos aquí
}, { timestamps: true });

const Veterinario = mongoose.model('Veterinario', veterinarioSchema);
export default Veterinario;
