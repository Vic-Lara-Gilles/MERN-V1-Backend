import express from 'express';
const router = express.Router();
import { obtenerVeterinarios } from '../controllers/veterinarioController.js';
import checkAuth from '../middleware/authMiddleware.js';
import { isPersonal } from '../middleware/roleMiddleware.js';

// GET /api/veterinarios - Listar todos los veterinarios (requiere autenticación y rol personal)
router.get('/', checkAuth, isPersonal, obtenerVeterinarios);

export default router;