import Cita from "../models/Cita.js";
import Paciente from "../models/Paciente.js";
import Cliente from "../models/Cliente.js";
import Usuario from "../models/Usuario.js";

// Crear nueva cita
const crearCita = async(req, res) => {
    const { paciente, cliente, veterinario, fecha, hora } = req.body;

    // Verificar que existen las referencias
    const existePaciente = await Paciente.findById(paciente);
    const existeCliente = await Cliente.findById(cliente);
    const existeVeterinario = await Usuario.findOne({ _id: veterinario, rol: 'veterinario' });

    if (!existePaciente) {
        const error = new Error('Paciente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    if (!existeCliente) {
        const error = new Error('Cliente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    if (!existeVeterinario) {
        const error = new Error('Veterinario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        const cita = new Cita({
            ...req.body,
            agendadaPor: req.usuario._id
        });
        const citaGuardada = await cita.save();
        
        await citaGuardada.populate([
            { path: 'paciente', select: 'nombre especie numeroHistoriaClinica' },
            { path: 'cliente', select: 'nombre apellido rut telefono' },
            { path: 'veterinario', select: 'nombre especialidad' },
            { path: 'agendadaPor', select: 'nombre rol' }
        ]);

        res.json(citaGuardada);
    } catch (error) {
        console.log(error);
        const e = new Error('Error al crear la cita');
        return res.status(500).json({msg: e.message});
    }
};

// Obtener todas las citas
const obtenerCitas = async(req, res) => {
    try {
        const citas = await Cita.find()
            .populate('paciente', 'nombre especie numeroHistoriaClinica')
            .populate('cliente', 'nombre apellido rut telefono')
            .populate('veterinario', 'nombre especialidad')
            .sort({ fecha: 1, hora: 1 });
        res.json(citas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener cita por ID
const obtenerCita = async(req, res) => {
    const { id } = req.params;
    
    try {
        const cita = await Cita.findById(id)
            .populate('paciente')
            .populate('cliente')
            .populate('veterinario', 'nombre especialidad')
            .populate('agendadaPor', 'nombre rol');

        if(!cita) {
            const error = new Error('Cita no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        res.json(cita);
    } catch (error) {
        console.log(error);
    }
};

// Obtener citas por fecha
const obtenerCitasPorFecha = async(req, res) => {
    const { fecha } = req.params;
    
    try {
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);

        const citas = await Cita.find({
            fecha: {
                $gte: fechaInicio,
                $lte: fechaFin
            }
        })
        .populate('paciente', 'nombre especie')
        .populate('cliente', 'nombre apellido telefono')
        .populate('veterinario', 'nombre')
        .sort({ hora: 1 });

        res.json(citas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener citas de un veterinario
const obtenerCitasPorVeterinario = async(req, res) => {
    const { veterinarioId } = req.params;
    
    try {
        const citas = await Cita.find({ 
            veterinario: veterinarioId,
            estado: { $in: ['Pendiente', 'Confirmada'] }
        })
        .populate('paciente', 'nombre especie')
        .populate('cliente', 'nombre apellido telefono')
        .sort({ fecha: 1, hora: 1 });

        res.json(citas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener citas de un cliente
const obtenerCitasPorCliente = async(req, res) => {
    const { clienteId } = req.params;
    
    try {
        const citas = await Cita.find({ cliente: clienteId })
            .populate('paciente', 'nombre especie')
            .populate('veterinario', 'nombre especialidad')
            .sort({ fecha: -1 });

        res.json(citas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener citas de un paciente
const obtenerCitasPorPaciente = async(req, res) => {
    const { pacienteId } = req.params;
    
    try {
        const citas = await Cita.find({ paciente: pacienteId })
            .populate('veterinario', 'nombre especialidad')
            .populate('cliente', 'nombre apellido')
            .sort({ fecha: -1 });

        res.json(citas);
    } catch (error) {
        console.log(error);
    }
};

// Actualizar cita
const actualizarCita = async(req, res) => {
    const { id } = req.params;
    
    try {
        const cita = await Cita.findById(id);

        if(!cita) {
            const error = new Error('Cita no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        // No permitir modificar citas completadas o canceladas
        if (cita.estado === 'Completada' || cita.estado === 'Cancelada') {
            const error = new Error('No se puede modificar una cita completada o cancelada');
            return res.status(400).json({msg: error.message});
        }

        // Actualizar campos
        cita.fecha = req.body.fecha || cita.fecha;
        cita.hora = req.body.hora || cita.hora;
        cita.tipo = req.body.tipo || cita.tipo;
        cita.motivo = req.body.motivo || cita.motivo;
        cita.observaciones = req.body.observaciones || cita.observaciones;
        cita.estado = req.body.estado || cita.estado;
        cita.veterinario = req.body.veterinario || cita.veterinario;

        const citaActualizada = await cita.save();
        await citaActualizada.populate([
            { path: 'paciente', select: 'nombre especie' },
            { path: 'cliente', select: 'nombre apellido telefono' },
            { path: 'veterinario', select: 'nombre especialidad' }
        ]);

        res.json(citaActualizada);
    } catch (error) {
        console.log(error);
    }
};

// Cancelar cita
const cancelarCita = async(req, res) => {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;
    
    try {
        const cita = await Cita.findById(id);

        if(!cita) {
            const error = new Error('Cita no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        if (cita.estado === 'Completada') {
            const error = new Error('No se puede cancelar una cita completada');
            return res.status(400).json({msg: error.message});
        }

        cita.estado = 'Cancelada';
        cita.fechaCancelacion = new Date();
        cita.motivoCancelacion = motivoCancelacion;

        await cita.save();
        res.json({msg: 'Cita cancelada correctamente'});
    } catch (error) {
        console.log(error);
    }
};

// Completar cita
const completarCita = async(req, res) => {
    const { id } = req.params;
    const { consultaId } = req.body;
    
    try {
        const cita = await Cita.findById(id);

        if(!cita) {
            const error = new Error('Cita no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        cita.estado = 'Completada';
        if (consultaId) {
            cita.consulta = consultaId;
        }

        await cita.save();
        res.json({msg: 'Cita completada correctamente'});
    } catch (error) {
        console.log(error);
    }
};

// Cambiar estado de cita
const cambiarEstado = async(req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const cita = await Cita.findById(id);

        if(!cita) {
            const error = new Error('Cita no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        const estadosValidos = ['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'No asistió'];
        if (!estadosValidos.includes(estado)) {
            const error = new Error('Estado no válido');
            return res.status(400).json({msg: error.message});
        }

        cita.estado = estado;
        await cita.save();

        res.json({msg: `Cita actualizada a ${estado}`});
    } catch (error) {
        console.log(error);
    }
};

export {
    crearCita,
    obtenerCitas,
    obtenerCita,
    obtenerCitasPorFecha,
    obtenerCitasPorVeterinario,
    obtenerCitasPorCliente,
    obtenerCitasPorPaciente,
    actualizarCita,
    cancelarCita,
    completarCita,
    cambiarEstado
};
