import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import conectarDB from "./config/db.js";
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';

const app = express();

dotenv.config();

conectarDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function(origin, callback) {
        console.log('CORS Origin:', origin);
        console.log('Dominios permitidos:', dominiosPermitidos);
        if(!origin || dominiosPermitidos.indexOf(origin) !== -1) {
             // El Origen del request esta permitido
             console.log('✅ Origen permitido');
             callback(null, true)
        } else {
             // No lanzar error, solo denegar
             console.log('❌ Origen denegado');
             callback(null, false)
        }
    },
    credentials: true
};

app.use(cors(corsOptions)); 
app.use(express.json());

app.use("/api/veterinarios", veterinarioRoutes); 
app.use("/api/pacientes", pacienteRoutes); 

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Servidor funcionando en el puerto ${PORT}`); 
});