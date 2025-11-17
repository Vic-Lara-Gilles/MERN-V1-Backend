import jwt from "jsonwebtoken";
import Cliente from "../models/Cliente.js";

const checkClienteAuth = async(req, res, next) => {
    let token;
    if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.cliente = await Cliente.findById(decoded.id).select(
                "-password -token"
            );

            if (!req.cliente) {
                const error = new Error('Cliente no encontrado');
                return res.status(404).json({msg: error.message});
            }

            if (!req.cliente.activo) {
                const error = new Error('Tu cuenta está desactivada. Contacta a la clínica');
                return res.status(403).json({msg: error.message});
            }

            if (!req.cliente.emailVerificado) {
                const error = new Error('Debes verificar tu email antes de acceder');
                return res.status(403).json({msg: error.message});
            }

            return next();
        } catch (error) {
            const e = new Error('Token no válido o inexistente');
            return res.status(403).json({msg: e.message});  
        }
    };
    if (!token) {
        const error = new Error('Token no válido o inexistente');
        res.status(403).json({msg: error.message});
    };
    next();
};

export default checkClienteAuth;
