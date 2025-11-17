import mongoose from "mongoose";

const pacientesSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    especie: {
        type: String,
        required: true,
    },
    sexo: {
        type: String,
        required: true,
    },
    peso: {
        type: String,
        required: true,
    },
    raza: {
        type: String,
        required: true,
    },
    altura: {
        type: String,
        required: true,
    },
    fechaIngreso: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    fechaAlta: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    fechaNac: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    sintomas: {
        type: String,
        required: true,
    },
    propietario: {
        type: String,
        required: true,
    },
    run: {
        type: String,
        required: true,
    },
    domicilio: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    veterinario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Veterinario",
    },
}, 
{
    timestamps: true,
}
);

const Paciente = mongoose.model("Paciente", pacientesSchema);

export default Paciente;


