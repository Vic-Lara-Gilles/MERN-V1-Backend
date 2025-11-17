import mongoose from "mongoose";

const citaSchema = mongoose.Schema({
    // Referencias
    paciente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paciente',
        required: true
    },
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    veterinario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // Fecha y hora
    fecha: {
        type: Date,
        required: true
    },
    hora: {
        type: String,
        required: true,
        trim: true
    },
    // Detalles
    tipo: {
        type: String,
        required: true,
        enum: ['Consulta', 'Vacunación', 'Cirugía', 'Emergencia', 'Control', 'Otro']
    },
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    observaciones: {
        type: String,
        trim: true
    },
    // Estado
    estado: {
        type: String,
        required: true,
        enum: ['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió'],
        default: 'Pendiente'
    },
    // Control
    agendadaPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    fechaCancelacion: {
        type: Date
    },
    motivoCancelacion: {
        type: String,
        trim: true
    },
    // Relación con consulta (si se completó)
    consulta: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consulta'
    }
}, {
    timestamps: true
});

// Índices para mejorar búsquedas
citaSchema.index({ fecha: 1, veterinario: 1 });
citaSchema.index({ paciente: 1, fecha: -1 });
citaSchema.index({ cliente: 1, fecha: -1 });
citaSchema.index({ estado: 1, fecha: 1 });

const Cita = mongoose.model('Cita', citaSchema);
export default Cita;
