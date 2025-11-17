import express from 'express';
const router = express.Router();
import {
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
} from "../controllers/consultaController.js";
import checkAuth from "../middleware/authMiddleware.js";
import checkClienteAuth from "../middleware/clienteAuthMiddleware.js";
import { isVeterinario, isPersonal, isAdmin, checkActivo } from "../middleware/roleMiddleware.js";

// Rutas para veterinarios
router.post("/", checkAuth, checkActivo, isVeterinario, crearConsulta);
router.put("/:id", checkAuth, checkActivo, isVeterinario, actualizarConsulta);
router.post("/medicamento/:id", checkAuth, checkActivo, isVeterinario, agregarMedicamento);
router.post("/examen/:id", checkAuth, checkActivo, isVeterinario, agregarExamen);
router.post("/vacuna/:id", checkAuth, checkActivo, isVeterinario, agregarVacuna);

// Rutas para personal (consultar)
router.get("/", checkAuth, checkActivo, isPersonal, obtenerConsultas);
router.get("/estadisticas", checkAuth, checkActivo, isAdmin, obtenerEstadisticas);
router.get("/veterinario/:veterinarioId", checkAuth, checkActivo, isPersonal, obtenerConsultasPorVeterinario);
router.get("/cliente/:clienteId", checkAuth, checkActivo, isPersonal, obtenerConsultasPorCliente);
router.get("/paciente/:pacienteId", checkAuth, checkActivo, isPersonal, obtenerHistorialPaciente);
router.get("/:id", checkAuth, checkActivo, isPersonal, obtenerConsulta);

// Rutas para portal de clientes (solo lectura)
router.get("/portal/mis-consultas", checkClienteAuth, obtenerConsultasPorCliente);
router.get("/portal/paciente/:pacienteId", checkClienteAuth, obtenerHistorialPaciente);

export default router;
