import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {

    const {email, nombre} = req.body;

    //Prevenir usuarios duplicados
    const existeUsuario = await Usuario.findOne({email});

    if (existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});
    }

    try {
    // Guardar un Nuevo Usuario
    const usuario = new Usuario(req.body);
    const usuarioGuardado = await usuario.save();

    // Enviar email
    emailRegistro({
        email,
        nombre,
        token: usuarioGuardado.token
    });

    res.json(usuarioGuardado);
    }   catch (error) {
        console.log(error);
    };
};

// Perfil -- Usuario
const perfil = (req, res) => {
    const { usuario } = req
    res.json(usuario);
};

const confirmar = async(req, res) => {
    const {token} = req.params

    const usuarioConfirmar = await Usuario.findOne({token});

    if (!usuarioConfirmar) {
        const error = new Error("Token no valido");
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save()

        res.json({ msg: "Usuario Confirmado Correctamente"});
    }   catch (error) {
        console.log(error)
    };
    console.log(usuarioConfirmar);
};

const autenticar = async(req, res) => {
    const {email, password} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email});

    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
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
            token: generarJWT(usuario.id)
        })

    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message});
    }
};

// == Olvide Password ==
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

        // == Enviar email con instrucciones ==
        emailOlvidePassword({
            email,
            nombre: existeUsuario.nombre,
            token: existeUsuario.token,
        })

        res.json({ msg: "Hemos enviado un email con las intrucciones"});
    } catch (error) {
        console.log(error)
    }
};

const comprobarToken = async(req, res) => {
    const {token} = req.params;

    const tokenValido = await Usuario.findOne({ token })

    if(tokenValido) {
        // El token es válido, el usuario existe
        res.json({ msg: "Token váilido y el usuario existe"});
    } else {
        const error = new Error("Token no Válido");
        return res.status(400).json({ msg: error.message});
    }
};

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
        res.json({ msg: "Password modificado correctamente" });
        console.log(usuario);
    } catch (error) {
        console.log(error);
    }
};

const actualizarPerfil = async (req, res) => {
    const usuario = await Usuario.findById(req.params.id)
    if(!usuario) {
        const error = new Error('Hubo un error')
        return res.status(400).json({ msg: error.message})
    }

    const { email } = req.body
    if (usuario.email !== req.body.email) {
        const existeEmail = await Usuario.findOne({email})
        if(existeEmail) {
            const error = new Error("Ese email ya esta en uso")
            return res.status(400).json({msg: error.message})
        }
    }

    try {
        usuario.nombre = req.body.nombre
        usuario.web = req.body.web
        usuario.telefono = req.body.telefono
        usuario.email = req.body.email

        const usuarioActualizado = await usuario.save()
        res.json(usuarioActualizado)

    } catch (error) {

    }
}

const actualizarPassword = async (req, res) => {
    // Leer los datos
    const { id } = req.usuario
    const { pwd_actual, pwd_nuevo} = req.body

    // Comprobar que el usuario existe
    const usuario = await Usuario.findById(id)
    if(!usuario) {
        const error = new Error("Hubo un error")
        return res.status(400).json({ msg: error.message })
    }

    // Comprobar su password
    if (await usuario.comprobarPassword(pwd_actual)) {

        // Almacenar el nuevo password
        usuario.password = pwd_nuevo
        await usuario.save()
        res.json({ msg: "Password Almacenado Correctamente" })

    } else {
        const error = new Error("El password Actual es Incorrecto")
        return res.status(400).json({ msg: error.message })
    }

    // Almacenar el nuevo password
}

export {
    perfil,
    registrar,
    confirmar,
    autenticar,
    nuevoPassword,
    olvidePassword,
    comprobarToken,
    actualizarPerfil,
    actualizarPassword,
}
