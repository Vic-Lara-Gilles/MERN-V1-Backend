import express from 'express'
const router = express.Router()
import {
    registrar, 
    perfil, 
    confirmar,
    autenticar,
    nuevoPassword,
    comprobarToken, 
    olvidePassword,
    actualizarPerfil,
    actualizarPassword,
    obtenerUsuarios,
    obtenerVeterinarios,
    desactivarUsuario,
    activarUsuario,
    obtenerUsuarioPorId
} from "../controllers/usuarioController.js"
import checkAuth from "../middleware/authMiddleware.js"
import { isAdmin, isPersonal } from "../middleware/roleMiddleware.js"
 
// Area publica
router.post("/", registrar)       
router.get("/confirmar/:token", confirmar)  
router.post("/login", autenticar)
router.post("/olvide-password", olvidePassword)
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword)

// Area privada
router.get("/perfil", checkAuth, perfil)
router.put('/perfil/:id', checkAuth, actualizarPerfil)
router.put('/actualizar-password', checkAuth, actualizarPassword)

// Rutas de administración (solo admin)
router.get("/", checkAuth, isAdmin, obtenerUsuarios)
router.get("/:id", checkAuth, isAdmin, obtenerUsuarioPorId)
router.get("/veterinarios", checkAuth, isPersonal, obtenerVeterinarios)
router.put("/desactivar/:id", checkAuth, isAdmin, desactivarUsuario)
router.put("/activar/:id", checkAuth, isAdmin, activarUsuario)


export default router; 