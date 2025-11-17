import Paciente from "../models/Paciente.js";
import Cliente from "../models/Cliente.js";

// Agregar paciente (mascota)
const agregarPaciente = async(req, res) => {
    const { propietario } = req.body;

    // Verificar que existe el cliente
    const cliente = await Cliente.findById(propietario);
    if (!cliente) {
        const error = new Error('Cliente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        const paciente = new Paciente(req.body);
        const pacienteAlmacenado = await paciente.save();
        
        // Poblar propietario antes de enviar respuesta
        await pacienteAlmacenado.populate('propietario', 'nombre apellido rut telefono');
        
        res.json(pacienteAlmacenado);
    } catch (error) {
        console.log(error);
        const e = new Error('Error al crear el paciente');
        return res.status(500).json({msg: e.message});
    }
};

// Obtener todos los pacientes
const obtenerPacientes = async (req, res) => {
    try {
        const pacientes = await Paciente.find()
            .populate('propietario', 'nombre apellido rut telefono email')
            .sort({ createdAt: -1 });
        res.json(pacientes);
    } catch (error) {
        console.log(error);
    }
};

// Obtener paciente por ID
const obtenerPaciente = async(req, res) => {
    const { id } = req.params;
    
    try {
        const paciente = await Paciente.findById(id)
            .populate('propietario', 'nombre apellido rut telefono email direccion ciudad comuna');

        if(!paciente) {
            const error = new Error('Paciente no encontrado');
            return res.status(404).json({msg: error.message}); 
        }

        res.json(paciente);
    } catch (error) {
        console.log(error);
        const e = new Error('Error al obtener el paciente');
        return res.status(500).json({msg: e.message});
    }
};

// Obtener pacientes de un cliente específico
const obtenerPacientesPorCliente = async(req, res) => {
    const { clienteId } = req.params;
    
    try {
        const pacientes = await Paciente.find({ propietario: clienteId, activo: true })
            .sort({ nombre: 1 });
        
        res.json(pacientes);
    } catch (error) {
        console.log(error);
    }
};

// Buscar paciente por número de historia clínica
const buscarPorHistoria = async(req, res) => {
    const { numeroHistoria } = req.params;
    
    try {
        const paciente = await Paciente.findOne({ numeroHistoriaClinica: numeroHistoria })
            .populate('propietario', 'nombre apellido rut telefono email');

        if(!paciente) {
            const error = new Error('Paciente no encontrado');
            return res.status(404).json({msg: error.message}); 
        }

        res.json(paciente);
    } catch (error) {
        console.log(error);
    }
};

// Actualizar paciente
const actualizarPaciente = async(req, res) => {
    const { id } = req.params;
    
    try {
        const paciente = await Paciente.findById(id);

        if(!paciente) {
            const error = new Error('Paciente no encontrado');
            return res.status(404).json({msg: error.message}); 
        }

        // Actualizar campos
        paciente.nombre = req.body.nombre || paciente.nombre;
        paciente.especie = req.body.especie || paciente.especie;
        paciente.raza = req.body.raza || paciente.raza;
        paciente.fechaNacimiento = req.body.fechaNacimiento || paciente.fechaNacimiento;
        paciente.sexo = req.body.sexo || paciente.sexo;
        paciente.color = req.body.color || paciente.color;
        paciente.peso = req.body.peso || paciente.peso;
        paciente.microchip = req.body.microchip || paciente.microchip;
        paciente.esterilizado = req.body.esterilizado !== undefined ? req.body.esterilizado : paciente.esterilizado;
        paciente.alergias = req.body.alergias || paciente.alergias;
        paciente.condicionesMedicas = req.body.condicionesMedicas || paciente.condicionesMedicas;
        paciente.foto = req.body.foto || paciente.foto;

        const pacienteActualizado = await paciente.save();
        await pacienteActualizado.populate('propietario', 'nombre apellido rut telefono email');
        
        res.json(pacienteActualizado);
    } catch (error) {
        console.log(error);
        const e = new Error('Error al actualizar el paciente');
        return res.status(500).json({msg: e.message});
    }
};

// Eliminar paciente (desactivar)
const eliminarPaciente = async(req, res) => {
    const { id } = req.params;
    
    try {
        const paciente = await Paciente.findById(id);

        if(!paciente) {
            const error = new Error('Paciente no encontrado');
            return res.status(404).json({msg: error.message}); 
        }

        paciente.activo = false;
        await paciente.save();
        
        res.json({msg: 'Paciente eliminado correctamente'});
    } catch (error) {
        console.log(error);
    }
};

// Obtener pacientes inactivos
const obtenerPacientesInactivos = async(req, res) => {
    try {
        const pacientes = await Paciente.find({ activo: false })
            .populate('propietario', 'nombre apellido rut');
        res.json(pacientes);
    } catch (error) {
        console.log(error);
    }
};

// Reactivar paciente
const reactivarPaciente = async(req, res) => {
    const { id } = req.params;
    
    try {
        const paciente = await Paciente.findById(id);

        if(!paciente) {
            const error = new Error('Paciente no encontrado');
            return res.status(404).json({msg: error.message}); 
        }

        paciente.activo = true;
        await paciente.save();
        
        res.json({msg: 'Paciente reactivado correctamente'});
    } catch (error) {
        console.log(error);
    }
};

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    obtenerPacientesPorCliente,
    buscarPorHistoria,
    actualizarPaciente,
    eliminarPaciente,
    obtenerPacientesInactivos,
    reactivarPaciente
};
