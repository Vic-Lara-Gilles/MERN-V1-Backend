import mongoose from 'mongoose';
import Usuario from './models/Usuario.js';
import Cliente from './models/Cliente.js';
import Paciente from './models/Paciente.js';
import Cita from './models/Cita.js';
import Veterinario from './models/Veterinario.js';
import dotenv from 'dotenv';

dotenv.config();

const conectarDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB conectado: ${db.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await conectarDB();

    console.log('🗑️  Limpiando datos anteriores...\n');
    
    // Limpiar datos existentes
    await Cita.deleteMany({});
    await Paciente.deleteMany({});
    await Cliente.deleteMany({});
    await Cita.deleteMany({});
    await Paciente.deleteMany({});
    await Cliente.deleteMany({});
    await Veterinario.deleteMany({});
    await Usuario.deleteMany({ 
      email: { $in: ['admin@veterinaria.com', 'veterinario@veterinaria.com', 'recepcion@veterinaria.com'] } 
    });

    console.log('✅ Datos anteriores eliminados\n');
    console.log('📝 Creando nuevos datos...\n');

    // 1. Crear usuarios
    const adminUser = new Usuario({
      nombre: 'Admin Principal',
      email: 'admin@veterinaria.com',
      password: 'admin@veterinaria.com',
      rol: 'admin',
      telefono: '123456789',
      confirmado: true,
    });
    await adminUser.save();
    console.log('✅ Usuario Admin creado');

    const veterinarioUser = new Usuario({
      nombre: 'Dr. Carlos Veterinario',
      email: 'veterinario@veterinaria.com',
      password: 'veterinario@veterinaria.com',
      rol: 'veterinario',
      telefono: '987654321',
      confirmado: true,
    });
    await veterinarioUser.save();
    // Crear documento en Veterinario
    const veterinarioDoc = new Veterinario({
      usuario: veterinarioUser._id,
      especialidad: 'Medicina interna',
      licenciaProfesional: 'VET-12345'
    });
    await veterinarioDoc.save();
    console.log('✅ Usuario Veterinario y documento Veterinario creados');

    const recepcionUser = new Usuario({
      nombre: 'María Recepción',
      email: 'recepcion@veterinaria.com',
      password: 'recepcion@veterinaria.com',
      rol: 'recepcion',
      telefono: '555123456',
      confirmado: true,
    });
    await recepcionUser.save();
    console.log('✅ Usuario Recepción creado\n');

    // 2. Crear clientes
    const cliente1 = new Cliente({
      nombre: 'Pedro',
      apellido: 'Lara',
      rut: '12345678-9',
      email: 'pedro@email.com',
      telefono: '+56912345678',
      direccion: 'Calle Principal 123',
      password: '123456789',
      confirmado: true
    });
    await cliente1.save();
    console.log('✅ Cliente Pedro Lara creado');

    const cliente2 = new Cliente({
      nombre: 'María',
      apellido: 'González',
      rut: '98765432-1',
      email: 'maria@email.com',
      telefono: '+56987654321',
      direccion: 'Avenida Central 456',
      password: '987654321',
      confirmado: true
    });
    await cliente2.save();
    console.log('✅ Cliente María González creado');

    const cliente3 = new Cliente({
      nombre: 'Juan',
      apellido: 'Martínez',
      rut: '11223344-5',
      email: 'juan@email.com',
      telefono: '+56911223344',
      direccion: 'Pasaje Los Robles 789',
      password: '112233445',
      confirmado: true
    });
    await cliente3.save();
    console.log('✅ Cliente Juan Martínez creado\n');

    // 3. Crear pacientes (mascotas)
    const paciente1 = new Paciente({
      nombre: 'Luna',
      especie: 'Felino',
      raza: 'Persa',
      fechaNacimiento: new Date('2020-05-15'),
      sexo: 'Hembra',
      color: 'Blanco',
      peso: 4.5,
      esterilizado: true,
      propietario: cliente1._id,
      numeroHistoriaClinica: 'HC-2024-001',
      alergias: ['Ninguna'],
      condicionesMedicas: []
    });
    await paciente1.save();
    console.log('✅ Paciente Luna (Felino) creado');

    const paciente2 = new Paciente({
      nombre: 'Max',
      especie: 'Canino',
      raza: 'Golden Retriever',
      fechaNacimiento: new Date('2019-03-20'),
      sexo: 'Macho',
      color: 'Dorado',
      peso: 30,
      esterilizado: true,
      propietario: cliente1._id,
      numeroHistoriaClinica: 'HC-2024-002',
      alergias: [],
      condicionesMedicas: ['Displasia de cadera']
    });
    await paciente2.save();
    console.log('✅ Paciente Max (Canino) creado');

    const paciente3 = new Paciente({
      nombre: 'Mimi',
      especie: 'Felino',
      raza: 'Siamés',
      fechaNacimiento: new Date('2021-07-10'),
      sexo: 'Hembra',
      color: 'Crema y marrón',
      peso: 3.8,
      esterilizado: false,
      propietario: cliente2._id,
      numeroHistoriaClinica: 'HC-2024-003',
      alergias: [],
      condicionesMedicas: []
    });
    await paciente3.save();
    console.log('✅ Paciente Mimi (Felino) creado');

    const paciente4 = new Paciente({
      nombre: 'Rocky',
      especie: 'Canino',
      raza: 'Bulldog',
      fechaNacimiento: new Date('2022-01-05'),
      sexo: 'Macho',
      color: 'Blanco y café',
      peso: 25,
      esterilizado: true,
      propietario: cliente3._id,
      numeroHistoriaClinica: 'HC-2024-004',
      alergias: ['Polen'],
      condicionesMedicas: []
    });
    await paciente4.save();
    console.log('✅ Paciente Rocky (Canino) creado');

    const paciente5 = new Paciente({
      nombre: 'Bella',
      especie: 'Canino',
      raza: 'Beagle',
      fechaNacimiento: new Date('2020-11-12'),
      sexo: 'Hembra',
      color: 'Tricolor',
      peso: 12,
      esterilizado: true,
      propietario: cliente3._id,
      numeroHistoriaClinica: 'HC-2024-005',
      alergias: [],
      condicionesMedicas: []
    });
    await paciente5.save();
    console.log('✅ Paciente Bella (Canino) creado\n');

    // 4. Crear citas con diferentes fechas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const mañana = new Date(hoy);
    mañana.setDate(hoy.getDate() + 1);

    const pasadoMañana = new Date(hoy);
    pasadoMañana.setDate(hoy.getDate() + 2);

    const proximaSemana = new Date(hoy);
    proximaSemana.setDate(hoy.getDate() + 7);

    const dosSemanasAdelante = new Date(hoy);
    dosSemanasAdelante.setDate(hoy.getDate() + 14);

    const ayer = new Date(hoy);
    ayer.setDate(hoy.getDate() - 1);

    const semanapasada = new Date(hoy);
    semanapasada.setDate(hoy.getDate() - 7);

    console.log('📅 Creando citas con diferentes fechas...\n');

    // CITAS DE HOY
    const cita1 = new Cita({
      paciente: paciente1._id,
      cliente: cliente1._id,
      veterinario: veterinarioUser._id,
      fecha: hoy,
      hora: '09:00',
      tipo: 'Control',
      motivo: 'Control de peso y vacunación anual',
      observaciones: 'Revisar historial de vacunas',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita1.save();
    console.log('✅ HOY 09:00 - Luna (Control)');

    const cita2 = new Cita({
      paciente: paciente2._id,
      cliente: cliente1._id,
      veterinario: veterinarioUser._id,
      fecha: hoy,
      hora: '10:30',
      tipo: 'Consulta',
      motivo: 'Revisión de displasia de cadera',
      observaciones: 'Traer radiografías anteriores',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita2.save();
    console.log('✅ HOY 10:30 - Max (Consulta)');

    const cita3 = new Cita({
      paciente: paciente4._id,
      cliente: cliente3._id,
      veterinario: veterinarioUser._id,
      fecha: hoy,
      hora: '14:00',
      tipo: 'Consulta',
      motivo: 'Problemas respiratorios',
      observaciones: 'Cliente reporta dificultad para respirar',
      estado: 'Pendiente',
      agendadaPor: recepcionUser._id
    });
    await cita3.save();
    console.log('✅ HOY 14:00 - Rocky (Consulta)');

    const cita4 = new Cita({
      paciente: paciente5._id,
      cliente: cliente3._id,
      veterinario: veterinarioUser._id,
      fecha: hoy,
      hora: '16:45',
      tipo: 'Control',
      motivo: 'Control post-operatorio',
      observaciones: 'Revisión de puntos quirúrgicos',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita4.save();
    console.log('✅ HOY 16:45 - Bella (Control)\n');

    // CITAS DE MAÑANA
    const cita5 = new Cita({
      paciente: paciente3._id,
      cliente: cliente2._id,
      veterinario: veterinarioUser._id,
      fecha: mañana,
      hora: '08:30',
      tipo: 'Vacunación',
      motivo: 'Vacuna antirrábica y triple felina',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita5.save();
    console.log('✅ MAÑANA 08:30 - Mimi (Vacunación)');

    const cita6 = new Cita({
      paciente: paciente1._id,
      cliente: cliente1._id,
      veterinario: veterinarioUser._id,
      fecha: mañana,
      hora: '11:00',
      tipo: 'Otro',
      motivo: 'Corte de uñas y limpieza dental',
      estado: 'Pendiente',
      agendadaPor: recepcionUser._id
    });
    await cita6.save();
    console.log('✅ MAÑANA 11:00 - Luna (Otro)');

    const cita7 = new Cita({
      paciente: paciente2._id,
      cliente: cliente1._id,
      veterinario: veterinarioUser._id,
      fecha: mañana,
      hora: '15:00',
      tipo: 'Control',
      motivo: 'Seguimiento de tratamiento para displasia',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita7.save();
    console.log('✅ MAÑANA 15:00 - Max (Control)\n');

    // CITAS PASADO MAÑANA
    const cita8 = new Cita({
      paciente: paciente4._id,
      cliente: cliente3._id,
      veterinario: veterinarioUser._id,
      fecha: pasadoMañana,
      hora: '09:30',
      tipo: 'Consulta',
      motivo: 'Control de alergia al polen',
      observaciones: 'Evaluación de tratamiento antialérgico',
      estado: 'Pendiente',
      agendadaPor: recepcionUser._id
    });
    await cita8.save();
    console.log('✅ PASADO MAÑANA 09:30 - Rocky (Consulta)');

    const cita9 = new Cita({
      paciente: paciente5._id,
      cliente: cliente3._id,
      veterinario: veterinarioUser._id,
      fecha: pasadoMañana,
      hora: '13:00',
      tipo: 'Cirugía',
      motivo: 'Esterilización programada',
      observaciones: 'Ayuno de 12 horas previas',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita9.save();
    console.log('✅ PASADO MAÑANA 13:00 - Bella (Cirugía)\n');

    // CITAS PRÓXIMA SEMANA
    const cita10 = new Cita({
      paciente: paciente3._id,
      cliente: cliente2._id,
      veterinario: veterinarioUser._id,
      fecha: proximaSemana,
      hora: '10:00',
      tipo: 'Control',
      motivo: 'Control post-vacunación',
      estado: 'Pendiente',
      agendadaPor: recepcionUser._id
    });
    await cita10.save();
    console.log('✅ PRÓXIMA SEMANA 10:00 - Mimi (Control)');

    const cita11 = new Cita({
      paciente: paciente1._id,
      cliente: cliente1._id,
      veterinario: veterinarioUser._id,
      fecha: proximaSemana,
      hora: '16:00',
      tipo: 'Consulta',
      motivo: 'Chequeo general anual',
      estado: 'Confirmada',
      agendadaPor: recepcionUser._id
    });
    await cita11.save();
    console.log('✅ PRÓXIMA SEMANA 16:00 - Luna (Consulta)\n');

    // CITAS DOS SEMANAS ADELANTE
    const cita12 = new Cita({
      paciente: paciente2._id,
      cliente: cliente1._id,
      veterinario: veterinarioUser._id,
      fecha: dosSemanasAdelante,
      hora: '11:30',
      tipo: 'Control',
      motivo: 'Evaluación trimestral de displasia',
      estado: 'Pendiente',
      agendadaPor: recepcionUser._id
    });
    await cita12.save();
    console.log('✅ 2 SEMANAS 11:30 - Max (Control)\n');

    // CITAS PASADAS (para historial)
    const cita13 = new Cita({
      paciente: paciente4._id,
      cliente: cliente3._id,
      veterinario: veterinarioUser._id,
      fecha: ayer,
      hora: '14:30',
      tipo: 'Consulta',
      motivo: 'Consulta de emergencia',
      estado: 'Completada',
      agendadaPor: recepcionUser._id
    });
    await cita13.save();
    console.log('✅ AYER 14:30 - Rocky (Consulta - Completada)');

    const cita14 = new Cita({
      paciente: paciente5._id,
      cliente: cliente3._id,
      veterinario: veterinarioUser._id,
      fecha: semanapasada,
      hora: '10:00',
      tipo: 'Vacunación',
      motivo: 'Refuerzo de vacunas',
      estado: 'Completada',
      agendadaPor: recepcionUser._id
    });
    await cita14.save();
    console.log('✅ SEMANA PASADA 10:00 - Bella (Vacunación - Completada)\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ¡Seed completado exitosamente!\n');
    console.log('📊 Resumen de datos creados:');
    console.log('   • 3 Usuarios (Admin, Veterinario, Recepción)');
    console.log('   • 1 Veterinario (modelo separado)');
    console.log('   • 3 Clientes');
    console.log('   • 5 Pacientes (mascotas)');
    console.log('   • 14 Citas distribuidas en:\n');
    console.log('     📅 HOY: 4 citas (09:00, 10:30, 14:00, 16:45)');
    console.log('     📅 MAÑANA: 3 citas (08:30, 11:00, 15:00)');
    console.log('     📅 PASADO MAÑANA: 2 citas (09:30, 13:00)');
    console.log('     📅 PRÓXIMA SEMANA: 2 citas (10:00, 16:00)');
    console.log('     📅 2 SEMANAS: 1 cita (11:30)');
    console.log('     📅 HISTORIAL: 2 citas completadas\n');
    console.log('📋 Credenciales de acceso:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👑 ADMIN:');
    console.log('   Email: admin@veterinaria.com');
    console.log('   Password: admin@veterinaria.com\n');
    console.log('🩺 VETERINARIO:');
    console.log('   Email: veterinario@veterinaria.com');
    console.log('   Password: veterinario@veterinaria.com\n');
    console.log('📞 RECEPCIÓN:');
    console.log('   Email: recepcion@veterinaria.com');
    console.log('   Password: recepcion@veterinaria.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedData();
