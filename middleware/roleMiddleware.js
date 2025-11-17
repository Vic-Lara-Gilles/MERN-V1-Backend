// Middleware para verificar roles específicos
const checkRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuario) {
            const error = new Error('Usuario no autenticado');
            return res.status(401).json({ msg: error.message });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            const error = new Error('No tienes permisos para realizar esta acción');
            return res.status(403).json({ msg: error.message });
        }

        next();
    };
};

// Middleware para verificar si el usuario está activo
const checkActivo = (req, res, next) => {
    if (!req.usuario) {
        const error = new Error('Usuario no autenticado');
        return res.status(401).json({ msg: error.message });
    }

    if (!req.usuario.activo) {
        const error = new Error('Tu cuenta está desactivada. Contacta al administrador');
        return res.status(403).json({ msg: error.message });
    }

    next();
};

// Atajos para roles comunes
const isAdmin = checkRole('admin');
const isVeterinario = checkRole('veterinario', 'admin');
const isRecepcion = checkRole('recepcion', 'admin');
const isPersonal = checkRole('admin', 'veterinario', 'recepcion');

export {
    checkRole,
    checkActivo,
    isAdmin,
    isVeterinario,
    isRecepcion,
    isPersonal
};
