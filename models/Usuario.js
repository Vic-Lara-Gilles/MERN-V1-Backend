import mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
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
        required: false  // Ahora es opcional
    },
    telefono: {
        type: String,
        trim: true
    },
    rol: {
        type: String,
        required: true,
        enum: ['admin', 'veterinario', 'recepcion'],
        default: 'veterinario'
    },
    // Control
    activo: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: () => generarId()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Validaciones y hasheo de password antes de guardar
usuarioSchema.pre('save', async function(next) {
    // Solo hashear si el password existe y fue modificado
    if(!this.password || !this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Método para comprobar password
usuarioSchema.methods.comprobarPassword = async function(passwordFormulario) {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;
