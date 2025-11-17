import mongoose from "mongoose";

const pacienteSchema = mongoose.Schema({
    // Identificación
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    numeroHistoriaClinica: {
        type: String,
        unique: true,
        trim: true
    },
    // Información básica
    especie: {
        type: String,
        required: true,
        enum: ['Canino', 'Felino', 'Ave', 'Reptil', 'Roedor', 'Otro']
    },
    raza: {
        type: String,
        trim: true
    },
    fechaNacimiento: {
        type: Date
    },
    sexo: {
        type: String,
        enum: ['Macho', 'Hembra']
    },
    color: {
        type: String,
        trim: true
    },
    peso: {
        type: Number
    },
    // Relación con cliente
    propietario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    // Información médica
    microchip: {
        type: String,
        trim: true
    },
    esterilizado: {
        type: Boolean,
        default: false
    },
    alergias: [{
        type: String,
        trim: true
    }],
    condicionesMedicas: [{
        type: String,
        trim: true
    }],
    // Multimedia
    foto: {
        type: String
    },
    // Control
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generar número de historia clínica antes de guardar
pacienteSchema.pre('save', async function(next) {
    if(!this.numeroHistoriaClinica) {
        const count = await mongoose.model('Paciente').countDocuments();
        this.numeroHistoriaClinica = `HC-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

const Paciente = mongoose.model('Paciente', pacienteSchema);
export default Paciente;
