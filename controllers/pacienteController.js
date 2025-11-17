import Paciente from "../models/Paciente.js";

const agregarPaciente = async(req, res) => {
    const paciente = new Paciente(req.body);
    paciente.veterinario = req.veterinario._id;
    try {
        const pacienteAlmacenado = await paciente.save();
        res.json(pacienteAlmacenado);
    }   catch (error) {
        console.log(error);
    }
};

const obtenerPacientes = async (req, res) => {
    const pacientes = await Paciente.find()
        .where('veterinario')
        .equals(req.veterinario);
    res.json(pacientes);
};

const obtenerPaciente = async(req, res) => {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if(!paciente) {
        return res.status(404).json({msg: 'No encontrado'}); 
    }

    if(paciente.veterinario._id.toString() 
        !== req.veterinario._id.toString()) {
       return res.json({msg: 'Acción no válida'})
    }
    res.json(paciente);
};

const obtenerPacienteRut = async(req, res) => {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if(!paciente) {
        return res.status(404).json({msg: 'No encontrado'}); 
    }

    if(paciente.veterinario._id.toString() 
        !== req.veterinario._id.toString()) {
       return res.json({msg: 'Acción no válida'})
    }
    res.json(paciente);
};

const actualizarPaciente = async(req, res) => {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if(!paciente) {
    return res.status(404).json({msg: 'No encontrado'}); 
    }

    if(paciente.veterinario._id.toString() 
        !== req.veterinario._id.toString()) {
       return res.json({msg: 'Acción no válida'})
    }
    // Actualizar Paciente 
    paciente.nombre = req.body.nombre || paciente.nombre;
    paciente.sexo = req.body.sexo || paciente.sexo;
    paciente.especie = req.body.especie || paciente.especie;
    paciente.peso = req.body.peso || paciente.peso;
    paciente.raza = req.body.raza || paciente.raza;
    paciente.altura = req.body.altura || paciente.altura;

    paciente.fechaIngreso = req.body.fechaIngreso || paciente.fechaIngreso;
    paciente.fechaAlta = req.body.fechaAlta || paciente.fechaAlta;
    paciente.fechaNac = req.body.fechaNac || paciente.fechaNac;
    paciente.sintomas = req.body.sintomas || paciente.sintomas;

    paciente.propietario = req.body.propietario || paciente.propietario;
    paciente.run = req.body.run || paciente.run;
    paciente.domicilio = req.body.domicilio || paciente.domicilio;
    paciente.telefono = req.body.telefono || paciente.telefono;
    paciente.email = req.body.email || paciente.email;

    try {
        const pacienteActualizado = await paciente.save();
        res.json(pacienteActualizado);
    }   catch (error) {
        console.log(error)
    }
};

const eliminarPaciente = async(req, res) => {
    const { id } = req.params;
    const paciente = await Paciente.findById(id);

    if(!paciente) {
    return res.status(404).json({msg: 'No encontrado'}); 
    }

    if(paciente.veterinario._id.toString() 
        !== req.veterinario._id.toString()) {
       return res.json({msg: 'Acción no válida'})
    }

    try {
        await paciente.deleteOne();
        res.json({ msg: "Paciente Eliminado"});
    }   catch (error) {
        console.log(error)
    }
};


export {
    agregarPaciente, 
    obtenerPacientes, 
    obtenerPaciente, 
    actualizarPaciente, 
    eliminarPaciente,
};
