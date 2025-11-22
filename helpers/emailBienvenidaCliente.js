import nodemailer from 'nodemailer';

const emailBienvenidaCliente = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const { email, nombre, rut, token } = datos;

    // Generar password temporal (RUT sin puntos ni guión)
    const passwordTemporal = rut.replace(/[.-]/g, '');

    // Enviar el email
    const info = await transport.sendMail({
        from: "Clínica Veterinaria <administracion@clinicaveterinaria.com>",
        to: email,
        subject: "Bienvenido a Clínica Veterinaria - Verifica tu cuenta",
        text: "Verifica tu cuenta en Clínica Veterinaria",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                <div style="background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h1 style="color: #2d3748; margin-bottom: 20px;">¡Bienvenido a Clínica Veterinaria!</h1>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Hola <strong>${nombre}</strong>,
                    </p>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
                        Tu cuenta ha sido creada exitosamente. Para acceder al portal de clientes, 
                        primero debes verificar tu correo electrónico haciendo clic en el siguiente botón:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/portal/confirmar/${token}" 
                           style="background-color: #84cc16; color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; font-weight: bold; 
                                  display: inline-block;">
                            Verificar mi cuenta
                        </a>
                    </div>
                    
                    <div style="background-color: #f7fafc; border-left: 4px solid #84cc16; padding: 15px; margin: 20px 0;">
                        <h3 style="color: #2d3748; margin-top: 0;">Tus credenciales de acceso:</h3>
                        <p style="color: #4a5568; margin: 10px 0;">
                            <strong>Email:</strong> ${email}<br>
                            <strong>Contraseña temporal:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 3px;">${passwordTemporal}</code>
                        </p>
                        <p style="color: #718096; font-size: 14px; margin-top: 15px;">
                            <strong>Importante:</strong> Tu contraseña temporal es tu RUT sin puntos ni guión. 
                            Después de verificar tu email, podrás cambiarla por una contraseña personalizada.
                        </p>
                    </div>
                    
                    <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-top: 20px;">
                        Una vez verificada tu cuenta, podrás:
                    </p>
                    
                    <ul style="color: #4a5568; font-size: 16px; line-height: 1.8;">
                        <li>Cambiar tu contraseña por una personalizada</li>
                        <li>Ver la información de tus mascotas</li>
                        <li>Agendar citas</li>
                        <li>Revisar el historial médico</li>
                        <li>Y mucho más...</li>
                    </ul>
                    
                    <p style="color: #718096; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        Si no solicitaste esta cuenta, por favor ignora este correo o contacta con nosotros.
                    </p>
                    
                    <p style="color: #718096; font-size: 14px;">
                        Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                        <a href="${process.env.FRONTEND_URL}/portal/confirmar/${token}" style="color: #84cc16;">
                            ${process.env.FRONTEND_URL}/portal/confirmar/${token}
                        </a>
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
                    <p>Clínica Veterinaria © ${new Date().getFullYear()}</p>
                    <p>Este es un correo automático, por favor no responder.</p>
                </div>
            </div>
        `
    });

    console.log("Mensaje enviado: %s", info.messageId);
};

export default emailBienvenidaCliente;
