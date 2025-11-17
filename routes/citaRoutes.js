import express from 'express';
const router = express.Router();
import {
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
} from "../controllers/citaController.js";
import checkAuth from "../middleware/authMiddleware.js";
import checkClienteAuth from "../middleware/clienteAuthMiddleware.js";
import { isPersonal, isVeterinario, checkActivo } from "../middleware/roleMiddleware.js";

// Rutas para personal de la clínica
router.post("/", checkAuth, checkActivo, isPersonal, crearCita);
router.get("/", checkAuth, checkActivo, isPersonal, obtenerCitas);
router.get("/fecha/:fecha", checkAuth, checkActivo, isPersonal, obtenerCitasPorFecha);
router.get("/veterinario/:veterinarioId", checkAuth, checkActivo, isVeterinario, obtenerCitasPorVeterinario);
router.get("/cliente/:clienteId", checkAuth, checkActivo, isPersonal, obtenerCitasPorCliente);
router.get("/paciente/:pacienteId", checkAuth, checkActivo, isPersonal, obtenerCitasPorPaciente);
router.get("/:id", checkAuth, checkActivo, isPersonal, obtenerCita);
router.put("/:id", checkAuth, checkActivo, isPersonal, actualizarCita);
router.put("/cancelar/:id", checkAuth, checkActivo, isPersonal, cancelarCita);
router.put("/completar/:id", checkAuth, checkActivo, isVeterinario, completarCita);
router.put("/estado/:id", checkAuth, checkActivo, isPersonal, cambiarEstado);

// Rutas para portal de clientes
router.get("/portal/mis-citas", checkClienteAuth, obtenerCitasPorCliente);

export default router;
