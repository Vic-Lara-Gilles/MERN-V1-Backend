import express from 'express';
const router = express.Router();
import {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    obtenerPacientesPorCliente,
    buscarPorHistoria,
    actualizarPaciente,
    eliminarPaciente,
    obtenerPacientesInactivos,
    reactivarPaciente
} from "../controllers/pacienteController.js";
import checkAuth from "../middleware/authMiddleware.js";
import checkClienteAuth from "../middleware/clienteAuthMiddleware.js";
import { isPersonal, checkActivo } from "../middleware/roleMiddleware.js";

// Rutas para personal de la clínica
router.post("/", checkAuth, checkActivo, isPersonal, agregarPaciente);
router.get("/", checkAuth, checkActivo, isPersonal, obtenerPacientes);
router.get("/inactivos", checkAuth, checkActivo, isPersonal, obtenerPacientesInactivos);
router.get("/historia/:numeroHistoria", checkAuth, checkActivo, isPersonal, buscarPorHistoria);
router.get("/cliente/:clienteId", checkAuth, checkActivo, isPersonal, obtenerPacientesPorCliente);
router.get("/:id", checkAuth, checkActivo, isPersonal, obtenerPaciente);
router.put("/:id", checkAuth, checkActivo, isPersonal, actualizarPaciente);
router.delete("/:id", checkAuth, checkActivo, isPersonal, eliminarPaciente);
router.put("/reactivar/:id", checkAuth, checkActivo, isPersonal, reactivarPaciente);

// Rutas para portal de clientes
router.get("/portal/mis-pacientes", checkClienteAuth, obtenerPacientesPorCliente);

export default router;
