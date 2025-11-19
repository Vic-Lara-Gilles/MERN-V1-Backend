import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

// Registrar nuevo usuario (solo admin)
const registrar = async (req, res) => {
    const {email, nombre, rol} = req.body;

    // Prevenir usuarios duplicados
    const existeUsuario = await Usuario.findOne({email});

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});
    }

    // Validar rol
    const rolesPermitidos = ['admin', 'veterinario', 'recepcion'];
    if (rol && !rolesPermitidos.includes(rol)) {
        const error = new Error('Rol no válido');
        return res.status(400).json({msg: error.message});
    }

    try {
        // Guardar un nuevo usuario
        const usuario = new Usuario(req.body);
        const usuarioGuardado = await usuario.save();

        // Enviar email
        emailRegistro({
            email,
            nombre,
            token: usuarioGuardado.token
        });

        res.json(usuarioGuardado);
    } catch (error) {
        console.log(error);
    }
};

// Obtener perfil del usuario autenticado
const perfil = (req, res) => {
    const { usuario } = req;
    res.json(usuario);
};

// Confirmar cuenta
const confirmar = async(req, res) => {
    const {token} = req.params;

    const usuarioConfirmar = await Usuario.findOne({token});

    if (!usuarioConfirmar) {
        const error = new Error("Token no válido");
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({ msg: "Usuario confirmado correctamente"});
    } catch (error) {
        console.log(error);
    }
};

// Autenticar usuario
const autenticar = async(req, res) => {
    const {email, password} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email});

    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario está confirmado
    if(!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message});
    }

    // Comprobar si está activo
    if(!usuario.activo) {
        const error = new Error("Tu cuenta está desactivada. Contacta al administrador");
        return res.status(403).json({msg: error.message});
    }

    // Revisar el password
    if (await usuario.comprobarPassword(password)) {
        // Autenticar
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
            especialidad: usuario.especialidad,
            token: generarJWT(usuario.id)
        });
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message});
    }
};

// Olvidé password
const olvidePassword = async (req, res) => {
    const {email} = req.body;

    const existeUsuario = await Usuario.findOne({email});
    if (!existeUsuario) {
        const error = new Error("El usuario no existe");
        return res.status(400).json({ msg: error.message});
    }

    try {
        existeUsuario.token = generarId();
        await existeUsuario.save();

        // Enviar email con instrucciones
        emailOlvidePassword({
            email,
            nombre: existeUsuario.nombre,
            token: existeUsuario.token,
        });

        res.json({ msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error);
    }
};

// Comprobar token de recuperación
const comprobarToken = async(req, res) => {
    const {token} = req.params;

    const tokenValido = await Usuario.findOne({ token });

    if(tokenValido) {
        res.json({ msg: "Token válido y el usuario existe"});
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({ msg: error.message});
    }
};

// Establecer nuevo password
const nuevoPassword = async(req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });
    if (!usuario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }

    try {
        usuario.token = null;
        usuario.password = password;
        await usuario.save();
        res.json({ msg: "Password modificado correctamente"});
    } catch (error) {
        console.log(error);
    }
};

// Actualizar perfil
const actualizarPerfil = async(req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    const {email} = req.body;
    if(usuario.email !== email) {
        const existeEmail = await Usuario.findOne({email});
        if(existeEmail) {
            const error = new Error('Email ya en uso');
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        usuario.nombre = req.body.nombre || usuario.nombre;
        usuario.email = req.body.email || usuario.email;
        usuario.telefono = req.body.telefono || usuario.telefono;
        usuario.especialidad = req.body.especialidad || usuario.especialidad;
        usuario.licenciaProfesional = req.body.licenciaProfesional || usuario.licenciaProfesional;

        const usuarioActualizado = await usuario.save();
        res.json(usuarioActualizado);
    } catch (error) {
        console.log(error);
    }
};

// Actualizar password
const actualizarPassword = async(req, res) => {
    const { id } = req.usuario;
    const { pwd_actual, pwd_nuevo } = req.body;

    const usuario = await Usuario.findById(id);
    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    if(await usuario.comprobarPassword(pwd_actual)) {
        usuario.password = pwd_nuevo;
        await usuario.save();
        res.json({msg: 'Password actualizado correctamente'});
    } else {
        const error = new Error('El password actual es incorrecto');
        return res.status(400).json({msg: error.message});
    }
};

// Obtener todos los usuarios (solo admin)
const obtenerUsuarios = async(req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password -token');
        res.json(usuarios);
    } catch (error) {
        console.log(error);
    }
};

// Obtener veterinarios activos
const obtenerVeterinarios = async(req, res) => {
    try {
        const veterinarios = await Usuario.find({ 
            rol: 'veterinario',
            activo: true,
            confirmado: true
        }).select('_id nombre especialidad licenciaProfesional');
        
        res.json(veterinarios);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener veterinarios' });
    }
};

// Desactivar usuario (solo admin)
const desactivarUsuario = async(req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuario.activo = false;
        await usuario.save();
        res.json({msg: 'Usuario desactivado correctamente'});
    } catch (error) {
        console.log(error);
    }
};

// Activar usuario (solo admin)
const activarUsuario = async(req, res) => {
    const usuario = await Usuario.findById(req.params.id);
    if(!usuario) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuario.activo = true;
        await usuario.save();
        res.json({msg: 'Usuario activado correctamente'});
    } catch (error) {
        console.log(error);
    }
};


// Obtener usuario por ID (solo admin)
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id).select('-password -token');
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener usuario' });
    }
};

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword,
    obtenerUsuarios,
    obtenerVeterinarios,
    desactivarUsuario,
    activarUsuario,
    obtenerUsuarioPorId
};
