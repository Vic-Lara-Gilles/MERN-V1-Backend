import express from 'express';
const router = express.Router();
import {
    registrar,
    obtenerClientes,
    obtenerCliente,
    buscarPorRut,
    actualizarCliente,
    eliminarCliente,
    habilitarPortal,
    autenticarCliente,
    perfilCliente,
    confirmarEmail,
    olvidePasswordCliente,
    comprobarTokenCliente,
    nuevoPasswordCliente
} from "../controllers/clienteController.js";
import checkAuth from "../middleware/authMiddleware.js";
import checkClienteAuth from "../middleware/clienteAuthMiddleware.js";
import { isPersonal, checkActivo } from "../middleware/roleMiddleware.js";

// ===== RUTAS PARA PERSONAL DE LA CLÍNICA =====

// Gestión de clientes (personal de la clínica)
router.post("/", checkAuth, checkActivo, isPersonal, registrar);
router.get("/", checkAuth, checkActivo, isPersonal, obtenerClientes);
router.get("/:id", checkAuth, checkActivo, isPersonal, obtenerCliente);
router.get("/rut/:rut", checkAuth, checkActivo, isPersonal, buscarPorRut);
router.put("/:id", checkAuth, checkActivo, isPersonal, actualizarCliente);
router.delete("/:id", checkAuth, checkActivo, isPersonal, eliminarCliente);
router.post("/habilitar-portal/:id", checkAuth, checkActivo, isPersonal, habilitarPortal);

// ===== RUTAS PARA PORTAL DE CLIENTES =====

// Autenticación de clientes
router.post("/portal/login", autenticarCliente);
router.get("/portal/confirmar/:token", confirmarEmail);
router.post("/portal/olvide-password", olvidePasswordCliente);
router.route("/portal/olvide-password/:token")
    .get(comprobarTokenCliente)
    .post(nuevoPasswordCliente);

// Área privada del cliente
router.get("/portal/perfil", checkClienteAuth, perfilCliente);

export default router;
