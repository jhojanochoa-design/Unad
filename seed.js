// seed.js — Ejecuta UNA SOLA VEZ para poblar la base de datos
// node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { Course, Task } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI;

const COURSES = [
  { period: '2281', name: 'Educación en Tecnología e Informática V', code: '740508' },
  { period: '2104', name: 'Educación en Tecnología e Informática V', code: '740508' },
];

const url = c => ({
  '2281': 'https://campus123.unad.edu.co/sinepv06/course/view.php?id=137',
  '2104': 'https://campus123.unad.edu.co/sinepv06/course/view.php?id=103',
}[c] || '#');

const mk = (course, momento, name, tipo, pts, due, desc, recursos, subtasks) => ({
  course, momento, name, tipo, pts, due, desc, recursos, subtasks,
  campusUrl: url(course), notes: '', done: false, aiHistory: [],
});

const TASKS = [
  // ── 2281 ──
  mk('2281','Inicial','Prueba Inicial','prueba',50,'2026-02-13','Prueba de evaluación inicial.',
    ['Recurso educativo — Explorando saberes previos','Prueba inicial (campus)'],
    ['Marcar Acuerdos del curso como realizado','Revisar recurso educativo','Realizar la prueba antes del 13/FEB 23:55']),
  mk('2281','Intermedio','Act. Evaluativa — La revolución y la tecnología','ind',120,'2026-05-01',
    'Documento Word/PDF sobre ciencia, técnica, tecnología y las 4 revoluciones industriales.',
    ['Guía de aprendizaje','Recurso educativo — Industria 4.0','Webconferencia educativa'],
    ['Descargar Guía de aprendizaje','Ver recurso Industria 4.0','Ver webconferencia','Resolver actividades','Entregar Word/PDF antes del 01/MAY 23:55']),
  mk('2281','Intermedio','Proyecto Integrador — Estación 7 (PLE)','ind',80,'2026-05-01',
    'Entorno Personal de Aprendizaje del proyecto empresarial — Estación 7.',
    ['Problema del ciclo — Ciclo V','Guía de aprendizaje Estación 7','Webconferencia educativa'],
    ['Leer Problema del ciclo','Descargar guía Estación 7','Ver webconferencia','Construir el PLE','Entregar antes del 01/MAY 23:55']),
  mk('2281','Intermedio','Foro Proyecto Transversal','col',40,'2026-05-01',
    '¿Cómo hacer realidad nuestra idea de negocio a través de las TIC?',
    ['Foro Proyecto Transversal (campus)'],
    ['Leer situación problematizadora','Publicar aporte mín. 200 palabras','Responder 2 compañeros','Verificar antes del 01/MAY 23:55']),
  mk('2281','Intermedio','Prueba Intermedia','prueba',60,'2026-05-04',
    'Evalúa ciencia, técnica, tecnología y las 4 revoluciones. Disponible 02–04/MAY.',
    ['Prueba Intermedia (campus)'],
    ['Repasar guía y recurso Industria 4.0','Realizar prueba entre 02/MAY y 04/MAY']),
  mk('2281','Final','Act. Evaluativa — Pensamiento Computacional con Bloques','ind',60,'2026-06-13',
    'Componentes electrónicos, Hardware y Software de dispositivos.',
    ['Guía de aprendizaje — Pensamiento Computacional','Recurso educativo — Pensamiento lógico','Webconferencia educativa'],
    ['Descargar guía de aprendizaje','Ver recurso pensamiento lógico','Ver webconferencia','Desarrollar actividades','Entregar antes del 13/JUN 23:55']),
  mk('2281','Final','Foro Colaborativo — Tejiendo Palabras','col',40,'2026-06-13',
    'Soluciones a problemas en artefactos electrónicos.',
    ['Foro colaborativo tejiendo palabras (campus)'],
    ['Leer el problema del foro','Publicar solución argumentada','Comentar 2 compañeros','Verificar antes del 13/JUN 23:55']),
  mk('2281','Final','Prueba Final','prueba',50,'2026-06-17',
    'Hardware, Software y seguridad informática. Disponible 15–17/JUN.',
    ['Prueba final (campus)'],
    ['Repasar guía Pensamiento Computacional','Estudiar Hardware Software y seguridad','Realizar prueba entre 15/JUN y 17/JUN']),
  // ── 2104 ──
  mk('2104','Inicial','Prueba Inicial','prueba',50,'2025-11-04','Prueba de evaluación inicial.',
    ['Recurso educativo — Explorando saberes previos','Prueba inicial (campus)'],
    ['Marcar Acuerdos del curso como realizado','Revisar recurso educativo','Realizar la prueba antes del 04/NOV 23:55']),
  mk('2104','Intermedio','Act. Evaluativa — La revolución y la tecnología','ind',120,'2025-12-14',
    'Documento Word/PDF sobre ciencia, técnica, tecnología y las 4 revoluciones industriales.',
    ['Guía de aprendizaje','Recurso educativo — Industria 4.0','Webconferencia educativa'],
    ['Descargar Guía de aprendizaje','Ver recurso Industria 4.0','Ver webconferencia','Resolver actividades','Entregar Word/PDF antes del 14/DIC 23:55']),
  mk('2104','Intermedio','Proyecto Integrador — Estación 7 (PLE)','ind',80,'2026-02-11',
    'Entorno Personal de Aprendizaje del proyecto empresarial — Estación 7.',
    ['Problema del ciclo — Ciclo V','Guía de aprendizaje Estación 7','Webconferencia educativa'],
    ['Leer Problema del ciclo','Descargar guía Estación 7','Ver webconferencia','Construir el PLE','Entregar antes del 11/FEB 23:55']),
  mk('2104','Intermedio','Foro Proyecto Transversal','col',40,'2026-02-11',
    '¿Cómo hacer realidad nuestra idea de negocio a través de las TIC?',
    ['Foro Proyecto Transversal (campus)'],
    ['Leer situación problematizadora','Publicar aporte mín. 200 palabras','Responder 2 compañeros','Verificar antes del 11/FEB 23:55']),
  mk('2104','Intermedio','Prueba Intermedia','prueba',60,'2026-02-14',
    'Evalúa ciencia, técnica, tecnología y las 4 revoluciones. Disponible 11–14/FEB.',
    ['Prueba Intermedia (campus)'],
    ['Repasar guía y recurso Industria 4.0','Realizar prueba entre 11/FEB y 14/FEB']),
  mk('2104','Final','Act. Evaluativa — Pensamiento Computacional con Bloques','ind',60,'2026-03-21',
    'Componentes electrónicos, Hardware y Software de dispositivos.',
    ['Guía de aprendizaje — Pensamiento Computacional','Recurso educativo — Pensamiento lógico','Webconferencia educativa'],
    ['Descargar guía de aprendizaje','Ver recurso pensamiento lógico','Ver webconferencia','Desarrollar actividades','Entregar antes del 21/MAR 23:55']),
  mk('2104','Final','Foro Colaborativo — Tejiendo Palabras','col',40,'2026-03-21',
    'Soluciones a problemas en artefactos electrónicos.',
    ['Foro colaborativo tejiendo palabras (campus)'],
    ['Leer el problema del foro','Publicar solución argumentada','Comentar 2 compañeros','Verificar antes del 21/MAR 23:55']),
  mk('2104','Final','Prueba Final','prueba',50,'2026-03-23',
    'Hardware, Software y seguridad informática. Disponible 20–23/MAR.',
    ['Prueba final (campus)'],
    ['Repasar guía Pensamiento Computacional','Estudiar Hardware Software y seguridad','Realizar prueba entre 20/MAR y 23/MAR']),
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas');

    // Limpiar colecciones
    await Course.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑  Colecciones limpiadas');

    // Insertar cursos
    await Course.insertMany(COURSES);
    console.log(`📘 ${COURSES.length} cursos insertados`);

    // Insertar tareas
    await Task.insertMany(TASKS);
    console.log(`📋 ${TASKS.length} tareas insertadas`);

    console.log('\n🎉 Seed completado exitosamente!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en seed:', err.message);
    process.exit(1);
  }
}

seed();
