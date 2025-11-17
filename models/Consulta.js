import mongoose from "mongoose";

const consultaSchema = mongoose.Schema({
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
    cita: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cita'
    },
    // Fecha y hora
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Motivo y anamnesis
    motivo: {
        type: String,
        required: true,
        trim: true
    },
    anamnesis: {
        type: String,
        trim: true
    },
    // Signos vitales
    signosVitales: {
        temperatura: {
            type: Number
        },
        frecuenciaCardiaca: {
            type: Number
        },
        frecuenciaRespiratoria: {
            type: Number
        },
        peso: {
            type: Number
        },
        condicionCorporal: {
            type: String,
            enum: ['Caquéxico', 'Delgado', 'Ideal', 'Sobrepeso', 'Obeso']
        }
    },
    // Examen físico
    examenFisico: {
        type: String,
        trim: true
    },
    // Diagnóstico
    diagnostico: {
        type: String,
        required: true,
        trim: true
    },
    diagnosticoPresuntivo: {
        type: String,
        trim: true
    },
    diagnosticoDefinitivo: {
        type: String,
        trim: true
    },
    // Tratamiento
    tratamiento: {
        type: String,
        required: true,
        trim: true
    },
    medicamentos: [{
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        dosis: {
            type: String,
            required: true,
            trim: true
        },
        frecuencia: {
            type: String,
            required: true,
            trim: true
        },
        duracion: {
            type: String,
            required: true,
            trim: true
        },
        viaAdministracion: {
            type: String,
            enum: ['Oral', 'Subcutánea', 'Intramuscular', 'Intravenosa', 'Tópica', 'Oftálmica', 'Ótica', 'Otra']
        },
        indicaciones: {
            type: String,
            trim: true
        }
    }],
    // Exámenes y procedimientos
    examenes: [{
        tipo: {
            type: String,
            required: true,
            enum: ['Laboratorio', 'Radiografía', 'Ecografía', 'Electrocardiograma', 'Biopsia', 'Otro']
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        resultado: {
            type: String,
            trim: true
        },
        archivo: {
            type: String
        },
        observaciones: {
            type: String,
            trim: true
        }
    }],
    procedimientos: [{
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        descripcion: {
            type: String,
            trim: true
        }
    }],
    // Vacunas aplicadas
    vacunas: [{
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        lote: {
            type: String,
            trim: true
        },
        laboratorio: {
            type: String,
            trim: true
        },
        proximaDosis: {
            type: Date
        }
    }],
    // Observaciones y seguimiento
    observaciones: {
        type: String,
        trim: true
    },
    recomendaciones: {
        type: String,
        trim: true
    },
    proximaConsulta: {
        type: Date
    },
    // Archivos adjuntos
    archivos: [{
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        url: {
            type: String,
            required: true
        },
        tipo: {
            type: String,
            enum: ['Imagen', 'Documento', 'Video', 'Otro']
        }
    }],
    // Control
    estado: {
        type: String,
        enum: ['En proceso', 'Completada'],
        default: 'Completada'
    }
}, {
    timestamps: true
});

// Índices para mejorar búsquedas
consultaSchema.index({ paciente: 1, fecha: -1 });
consultaSchema.index({ veterinario: 1, fecha: -1 });
consultaSchema.index({ cliente: 1, fecha: -1 });
consultaSchema.index({ fecha: -1 });

const Consulta = mongoose.model('Consulta', consultaSchema);
export default Consulta;
