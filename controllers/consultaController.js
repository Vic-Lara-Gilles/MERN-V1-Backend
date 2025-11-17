import Consulta from "../models/Consulta.js";
import Paciente from "../models/Paciente.js";
import Cliente from "../models/Cliente.js";
import Cita from "../models/Cita.js";

// Crear nueva consulta médica
const crearConsulta = async(req, res) => {
    const { paciente, cliente, cita } = req.body;

    // Verificar que existe el paciente
    const existePaciente = await Paciente.findById(paciente);
    if (!existePaciente) {
        const error = new Error('Paciente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    // Verificar que existe el cliente
    const existeCliente = await Cliente.findById(cliente);
    if (!existeCliente) {
        const error = new Error('Cliente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        const consulta = new Consulta({
            ...req.body,
            veterinario: req.usuario._id
        });
        const consultaGuardada = await consulta.save();
        
        // Si la consulta está vinculada a una cita, actualizar la cita
        if (cita) {
            await Cita.findByIdAndUpdate(cita, {
                estado: 'Completada',
                consulta: consultaGuardada._id
            });
        }

        await consultaGuardada.populate([
            { path: 'paciente', select: 'nombre especie raza numeroHistoriaClinica' },
            { path: 'cliente', select: 'nombre apellido rut telefono' },
            { path: 'veterinario', select: 'nombre especialidad' }
        ]);

        res.json(consultaGuardada);
    } catch (error) {
        console.log(error);
        const e = new Error('Error al crear la consulta');
        return res.status(500).json({msg: e.message});
    }
};

// Obtener todas las consultas
const obtenerConsultas = async(req, res) => {
    try {
        const consultas = await Consulta.find()
            .populate('paciente', 'nombre especie numeroHistoriaClinica')
            .populate('cliente', 'nombre apellido')
            .populate('veterinario', 'nombre especialidad')
            .sort({ fecha: -1 });
        res.json(consultas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener consulta por ID
const obtenerConsulta = async(req, res) => {
    const { id } = req.params;
    
    try {
        const consulta = await Consulta.findById(id)
            .populate('paciente')
            .populate('cliente')
            .populate('veterinario', 'nombre especialidad licenciaProfesional')
            .populate('cita');

        if(!consulta) {
            const error = new Error('Consulta no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        res.json(consulta);
    } catch (error) {
        console.log(error);
    }
};

// Obtener historial médico de un paciente
const obtenerHistorialPaciente = async(req, res) => {
    const { pacienteId } = req.params;
    
    try {
        const consultas = await Consulta.find({ paciente: pacienteId })
            .populate('veterinario', 'nombre especialidad')
            .populate('cita', 'tipo fecha hora')
            .sort({ fecha: -1 });

        res.json(consultas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener consultas de un veterinario
const obtenerConsultasPorVeterinario = async(req, res) => {
    const { veterinarioId } = req.params;
    
    try {
        const consultas = await Consulta.find({ veterinario: veterinarioId })
            .populate('paciente', 'nombre especie numeroHistoriaClinica')
            .populate('cliente', 'nombre apellido')
            .sort({ fecha: -1 });

        res.json(consultas);
    } catch (error) {
        console.log(error);
    }
};

// Obtener consultas de un cliente
const obtenerConsultasPorCliente = async(req, res) => {
    const { clienteId } = req.params;
    
    try {
        const consultas = await Consulta.find({ cliente: clienteId })
            .populate('paciente', 'nombre especie')
            .populate('veterinario', 'nombre especialidad')
            .sort({ fecha: -1 });

        res.json(consultas);
    } catch (error) {
        console.log(error);
    }
};

// Actualizar consulta
const actualizarConsulta = async(req, res) => {
    const { id } = req.params;
    
    try {
        const consulta = await Consulta.findById(id);

        if(!consulta) {
            const error = new Error('Consulta no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        // Solo el veterinario que creó la consulta puede editarla
        if (consulta.veterinario.toString() !== req.usuario._id.toString() && req.usuario.rol !== 'admin') {
            const error = new Error('No tienes permisos para editar esta consulta');
            return res.status(403).json({msg: error.message});
        }

        // Actualizar campos
        consulta.motivo = req.body.motivo || consulta.motivo;
        consulta.anamnesis = req.body.anamnesis || consulta.anamnesis;
        consulta.signosVitales = req.body.signosVitales || consulta.signosVitales;
        consulta.examenFisico = req.body.examenFisico || consulta.examenFisico;
        consulta.diagnostico = req.body.diagnostico || consulta.diagnostico;
        consulta.diagnosticoPresuntivo = req.body.diagnosticoPresuntivo || consulta.diagnosticoPresuntivo;
        consulta.diagnosticoDefinitivo = req.body.diagnosticoDefinitivo || consulta.diagnosticoDefinitivo;
        consulta.tratamiento = req.body.tratamiento || consulta.tratamiento;
        consulta.medicamentos = req.body.medicamentos || consulta.medicamentos;
        consulta.examenes = req.body.examenes || consulta.examenes;
        consulta.procedimientos = req.body.procedimientos || consulta.procedimientos;
        consulta.vacunas = req.body.vacunas || consulta.vacunas;
        consulta.observaciones = req.body.observaciones || consulta.observaciones;
        consulta.recomendaciones = req.body.recomendaciones || consulta.recomendaciones;
        consulta.proximaConsulta = req.body.proximaConsulta || consulta.proximaConsulta;
        consulta.archivos = req.body.archivos || consulta.archivos;
        consulta.estado = req.body.estado || consulta.estado;

        const consultaActualizada = await consulta.save();
        await consultaActualizada.populate([
            { path: 'paciente', select: 'nombre especie' },
            { path: 'cliente', select: 'nombre apellido' },
            { path: 'veterinario', select: 'nombre especialidad' }
        ]);

        res.json(consultaActualizada);
    } catch (error) {
        console.log(error);
    }
};

// Agregar medicamento a la consulta
const agregarMedicamento = async(req, res) => {
    const { id } = req.params;
    const medicamento = req.body;
    
    try {
        const consulta = await Consulta.findById(id);

        if(!consulta) {
            const error = new Error('Consulta no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        consulta.medicamentos.push(medicamento);
        await consulta.save();

        res.json({msg: 'Medicamento agregado correctamente', consulta});
    } catch (error) {
        console.log(error);
    }
};

// Agregar examen a la consulta
const agregarExamen = async(req, res) => {
    const { id } = req.params;
    const examen = req.body;
    
    try {
        const consulta = await Consulta.findById(id);

        if(!consulta) {
            const error = new Error('Consulta no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        consulta.examenes.push(examen);
        await consulta.save();

        res.json({msg: 'Examen agregado correctamente', consulta});
    } catch (error) {
        console.log(error);
    }
};

// Agregar vacuna a la consulta
const agregarVacuna = async(req, res) => {
    const { id } = req.params;
    const vacuna = req.body;
    
    try {
        const consulta = await Consulta.findById(id);

        if(!consulta) {
            const error = new Error('Consulta no encontrada');
            return res.status(404).json({msg: error.message}); 
        }

        consulta.vacunas.push(vacuna);
        await consulta.save();

        res.json({msg: 'Vacuna registrada correctamente', consulta});
    } catch (error) {
        console.log(error);
    }
};

// Obtener estadísticas de consultas
const obtenerEstadisticas = async(req, res) => {
    try {
        const totalConsultas = await Consulta.countDocuments();
        const consultasPorTipo = await Consulta.aggregate([
            {
                $lookup: {
                    from: 'citas',
                    localField: 'cita',
                    foreignField: '_id',
                    as: 'citaInfo'
                }
            },
            {
                $unwind: { path: '$citaInfo', preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: '$citaInfo.tipo',
                    total: { $sum: 1 }
                }
            }
        ]);

        const consultasPorEspecie = await Consulta.aggregate([
            {
                $lookup: {
                    from: 'pacientes',
                    localField: 'paciente',
                    foreignField: '_id',
                    as: 'pacienteInfo'
                }
            },
            {
                $unwind: '$pacienteInfo'
            },
            {
                $group: {
                    _id: '$pacienteInfo.especie',
                    total: { $sum: 1 }
                }
            }
        ]);

        res.json({
            totalConsultas,
            consultasPorTipo,
            consultasPorEspecie
        });
    } catch (error) {
        console.log(error);
    }
};

export {
    crearConsulta,
    obtenerConsultas,
    obtenerConsulta,
    obtenerHistorialPaciente,
    obtenerConsultasPorVeterinario,
    obtenerConsultasPorCliente,
    actualizarConsulta,
    agregarMedicamento,
    agregarExamen,
    agregarVacuna,
    obtenerEstadisticas
};
