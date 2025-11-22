import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import conectarDB from "./config/db.js";
import crearAdminDefault from "./utils/crearAdminDefault.js";

import authRoutes from './routes/usuarioRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import citaRoutes from './routes/citaRoutes.js';
import consultaRoutes from './routes/consultaRoutes.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';

const app = express();

dotenv.config();

// Conectar a la base de datos
conectarDB();

// Crear administrador por defecto si no existe
crearAdminDefault();

// Configuración de CORS
const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        // Permitir requests sin origin (como Postman, curl, etc.)
        if (!origin) {
            return callback(null, true);
        }
        
        if (dominiosPermitidos.indexOf(origin) !== -1) {
            // El origen está permitido
            callback(null, true);
        } else {
            // El origen no está permitido
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Request-Id']
};

app.use(cors(corsOptions)); 
app.use(express.json());

// Rutas de autenticación y gestión de usuarios
app.use("/api/veterinarios", veterinarioRoutes);
app.use("/api/usuarios", authRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/citas", citaRoutes);
app.use("/api/consultas", consultaRoutes); 

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`); 
});
