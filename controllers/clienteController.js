import Cliente from "../models/Cliente.js";
import Paciente from "../models/Paciente.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailBienvenidaCliente from "../helpers/emailBienvenidaCliente.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

// Registrar nuevo cliente (personal de la clínica)
const registrar = async (req, res) => {
    const {email, rut, pacientes} = req.body;

    // Prevenir clientes duplicados
    const existeEmail = await Cliente.findOne({email});
    if (existeEmail) {
        const error = new Error('Email ya registrado');
        return res.status(400).json({msg: error.message});
    }

    const existeRut = await Cliente.findOne({rut});
    if (existeRut) {
        const error = new Error('RUT ya registrado');
        return res.status(400).json({msg: error.message});
    }

    try {
        // Generar contraseña temporal usando el RUT sin puntos ni guión
        const passwordTemporal = rut.replace(/[.-]/g, '');
        
        // Guardar nuevo cliente con contraseña temporal
        const cliente = new Cliente({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            rut: req.body.rut,
            email: req.body.email,
            telefono: req.body.telefono,
            direccion: req.body.direccion,
            ciudad: req.body.ciudad,
            comuna: req.body.comuna,
            notas: req.body.notas,
            password: passwordTemporal,
            emailVerificado: false,  // Debe verificar email
            token: generarId(),      // Token para verificación
            registradoPor: req.usuario._id
        });
        const clienteGuardado = await cliente.save();

        // Enviar email de verificación automáticamente
        emailBienvenidaCliente({
            email: clienteGuardado.email,
            nombre: clienteGuardado.nombre,
            rut: clienteGuardado.rut,
            token: clienteGuardado.token
        });

        // Crear pacientes asociados si se enviaron
        let pacientesCreados = [];
        if (pacientes && Array.isArray(pacientes) && pacientes.length > 0) {
            for (const pacienteData of pacientes) {
                const nuevoPaciente = new Paciente({
                    ...pacienteData,
                    propietario: clienteGuardado._id
                });
                const pacienteGuardado = await nuevoPaciente.save();
                pacientesCreados.push(pacienteGuardado);
            }
        }

        // Devolver respuesta sin el password
        const { password, token, ...clienteResponse } = clienteGuardado.toObject();
        res.json({
            msg: 'Cliente creado. Se ha enviado un email de verificación.',
            cliente: {
                ...clienteResponse,
                pacientes: pacientesCreados
            }
        });
    } catch (error) {
        console.log(error);
        const e = new Error('Error al crear el cliente');
        return res.status(500).json({msg: e.message, detalle: error.message});
    }
};

// Obtener todos los clientes
const obtenerClientes = async(req, res) => {
    try {
        const clientes = await Cliente.find()
            .select('-password -token -registradoPor');
        res.json(clientes);
    } catch (error) {
        console.log(error);
    }
};

// Obtener un cliente por ID
const obtenerCliente = async(req, res) => {
    const {id} = req.params;

    try {
        const cliente = await Cliente.findById(id)
            .select('-password -token -registradoPor');
        
        if (!cliente) {
            const error = new Error('Cliente no encontrado');
            return res.status(404).json({msg: error.message});
        }

        res.json(cliente);
    } catch (error) {
        console.log(error);
        const e = new Error('Error al obtener el cliente');
        return res.status(500).json({msg: e.message});
    }
};

// Buscar cliente por RUT
const buscarPorRut = async(req, res) => {
    const {rut} = req.params;

    try {
        const cliente = await Cliente.findOne({rut})
            .select('-password -token');
        
        if (!cliente) {
            const error = new Error('Cliente no encontrado');
            return res.status(404).json({msg: error.message});
        }

        res.json(cliente);
    } catch (error) {
        console.log(error);
    }
};

// Actualizar cliente
const actualizarCliente = async(req, res) => {
    const {id} = req.params;
    const cliente = await Cliente.findById(id);

    if(!cliente) {
        const error = new Error('Cliente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    const {email, rut} = req.body;

    // Verificar email único
    if(cliente.email !== email) {
        const existeEmail = await Cliente.findOne({email});
        if(existeEmail) {
            const error = new Error('Email ya en uso');
            return res.status(400).json({msg: error.message});
        }
    }

    // Verificar RUT único
    if(cliente.rut !== rut) {
        const existeRut = await Cliente.findOne({rut});
        if(existeRut) {
            const error = new Error('RUT ya en uso');
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        cliente.nombre = req.body.nombre || cliente.nombre;
        cliente.apellido = req.body.apellido || cliente.apellido;
        cliente.rut = req.body.rut || cliente.rut;
        cliente.email = req.body.email || cliente.email;
        cliente.telefono = req.body.telefono || cliente.telefono;
        cliente.direccion = req.body.direccion || cliente.direccion;
        cliente.ciudad = req.body.ciudad || cliente.ciudad;
        cliente.comuna = req.body.comuna || cliente.comuna;
        cliente.notas = req.body.notas !== undefined ? req.body.notas : cliente.notas;

        const clienteActualizado = await cliente.save();
        res.json(clienteActualizado);
    } catch (error) {
        console.log(error);
    }
};

// Eliminar cliente (desactivar)
const eliminarCliente = async(req, res) => {
    const {id} = req.params;
    const cliente = await Cliente.findById(id);

    if(!cliente) {
        const error = new Error('Cliente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        cliente.activo = false;
        await cliente.save();
        res.json({msg: 'Cliente desactivado correctamente'});
    } catch (error) {
        console.log(error);
    }
};

// Habilitar acceso al portal
const habilitarPortal = async(req, res) => {
    const {id} = req.params;
    const {password} = req.body;

    const cliente = await Cliente.findById(id);
    if(!cliente) {
        const error = new Error('Cliente no encontrado');
        return res.status(404).json({msg: error.message});
    }

    try {
        cliente.password = password;
        cliente.token = generarId();
        await cliente.save();

        // Enviar email de verificación
        emailBienvenidaCliente({
            email: cliente.email,
            nombre: cliente.nombre,
            rut: cliente.rut,
            token: cliente.token
        });

        res.json({msg: 'Email de verificación enviado al cliente'});
    } catch (error) {
        console.log(error);
    }
};

// ===== PORTAL DE CLIENTES =====

// Autenticar cliente (portal)
const autenticarCliente = async(req, res) => {
    const {email, password} = req.body;

    const cliente = await Cliente.findOne({email});
    if(!cliente) {
        const error = new Error("Email o password incorrectos");
        return res.status(404).json({msg: error.message});
    }

    if(!cliente.emailVerificado) {
        const error = new Error("Debes verificar tu email antes de acceder");
        return res.status(403).json({msg: error.message});
    }

    if(!cliente.activo) {
        const error = new Error("Tu cuenta está desactivada. Contacta a la clínica");
        return res.status(403).json({msg: error.message});
    }

    if (await cliente.comprobarPassword(password)) {
        res.json({
            _id: cliente._id,
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            email: cliente.email,
            rut: cliente.rut,
            telefono: cliente.telefono,
            token: generarJWT(cliente.id)
        });
    } else {
        const error = new Error("Email o password incorrectos");
        return res.status(403).json({msg: error.message});
    }
};

// Perfil del cliente autenticado
const perfilCliente = (req, res) => {
    const { cliente } = req;
    res.json(cliente);
};

// Confirmar email del cliente - Redirige a cambiar password
const confirmarEmail = async(req, res) => {
    const {token} = req.params;

    const cliente = await Cliente.findOne({token});
    if (!cliente) {
        const error = new Error("Token no válido");
        return res.status(404).json({msg: error.message});
    }

    try {
        // Marcar como verificado PERO mantener el token para cambiar password
        cliente.emailVerificado = true;
        await cliente.save();

        res.json({ 
            msg: "Email verificado. Ahora puedes cambiar tu contraseña.",
            token: cliente.token  // Devolver token para cambiar password
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Error al verificar email'});
    }
};

// Olvidé password (portal cliente)
const olvidePasswordCliente = async (req, res) => {
    const {email} = req.body;

    const cliente = await Cliente.findOne({email});
    if (!cliente) {
        return res.json({ msg: "Hemos enviado un email con las instrucciones"});
    }

    try {
        cliente.token = generarId();
        await cliente.save();

        emailOlvidePassword({
            email,
            nombre: cliente.nombre,
            token: cliente.token,
        });

        res.json({ msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error);
    }
};

// Comprobar token cliente
const comprobarTokenCliente = async(req, res) => {
    const {token} = req.params;
    const tokenValido = await Cliente.findOne({ token });

    if(tokenValido) {
        res.json({ msg: "Token válido"});
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({ msg: error.message});
    }
};

// Nuevo password cliente (usado para cambiar password inicial o reseteo)
const nuevoPasswordCliente = async(req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const cliente = await Cliente.findOne({ token });
    if (!cliente) {
        const error = new Error("Token no válido");
        return res.status(400).json({ msg: error.message });
    }

    try {
        cliente.token = null;           // Limpiar token
        cliente.password = password;    // Nueva password
        cliente.emailVerificado = true; // Asegurar verificación
        await cliente.save();
        
        res.json({ msg: "Contraseña cambiada correctamente. Ya puedes iniciar sesión."});
    } catch (error) {
        console.log(error);
        res.status(500).json({msg: 'Error al cambiar contraseña'});
    }
};

export {
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
};
