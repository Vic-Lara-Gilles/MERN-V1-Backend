import Veterinario from "../models/Veterinario.js";

// Obtener todos los veterinarios con datos de usuario anidados
const obtenerVeterinarios = async (req, res) => {
    try {
        const veterinarios = await Veterinario.find()
            .populate({
                path: 'usuario',
                select: 'nombre email activo creadoEn createdAt rol',
            });
        res.json(veterinarios);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener veterinarios' });
    }
};

export {
    obtenerVeterinarios
};