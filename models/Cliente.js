import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const clienteSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    rut: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    direccion: {
        type: String,
        trim: true
    },
    ciudad: {
        type: String,
        trim: true
    },
    comuna: {
        type: String,
        trim: true
    },
    // Control de portal
    emailVerificado: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: () => generarId()
    },
    activo: {
        type: Boolean,
        default: true
    },
    // Metadata
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    registradoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    notas: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Hashear password antes de guardar
clienteSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comprobar password
clienteSchema.methods.comprobarPassword = async function(passwordFormulario) {
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Cliente = mongoose.model('Cliente', clienteSchema);
export default Cliente;
