
require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const { Course, Task, Student, Entrega, SubtaskProgress } = require('./models');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET','POST','PUT','PATCH','DELETE'],
  allowedHeaders: ['Content-Type','x-api-secret'],
}));
app.use(express.json({ limit: '2mb' }));

// Auth middleware (simple API secret)
function auth(req, res, next) {
  const secret = process.env.API_SECRET;
  if (!secret || secret === '7226316') return next();
  if (req.headers['x-api-secret'] !== secret) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

// ─────────────────────────────────────────────
// MONGODB CONNECTION
// ─────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => { console.error('❌ Error MongoDB:', err.message); process.exit(1); });

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Gestor UNAD 740508 API',
    version: '1.0.0',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ─────────────────────────────────────────────
// COURSES
// ─────────────────────────────────────────────
app.get('/api/courses', auth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ period: 1 });
    res.json(courses);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/courses', auth, async (req, res) => {
  try {
    const { period, name, code } = req.body;
    if (!period || !name) return res.status(400).json({ error: 'period y name son obligatorios' });
    const course = await Course.create({ period, name, code: code || '740508' });
    res.status(201).json(course);
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Ya existe ese período' });
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/courses/:id', auth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    await Student.deleteMany({ course: course.period });
    await Task.deleteMany({ course: course.period });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────
// TASKS
// ─────────────────────────────────────────────
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.course) filter.course = req.query.course;
    const tasks = await Task.find(filter).sort({ due: 1 });
    res.json(tasks);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/api/tasks/:id', auth, async (req, res) => {
  try {
    const allowed = ['done','notes','aiHistory','name','course','tipo','pts','due','start','desc','subtasks','recursos','momento','campusUrl'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    await SubtaskProgress.deleteOne({ taskId: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────
// SUBTASK PROGRESS
// ─────────────────────────────────────────────
app.get('/api/tasks/:id/progress', auth, async (req, res) => {
  try {
    const sp = await SubtaskProgress.findOne({ taskId: req.params.id });
    res.json({ doneItems: sp ? sp.doneItems : [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/tasks/:id/progress', auth, async (req, res) => {
  try {
    const { doneItems } = req.body;
    const sp = await SubtaskProgress.findOneAndUpdate(
      { taskId: req.params.id },
      { doneItems: doneItems || [] },
      { upsert: true, new: true }
    );
    res.json(sp);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────
app.get('/api/students', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.query.course) filter.course = req.query.course;
    const students = await Student.find(filter).sort({ nombre: 1 });
    res.json(students);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CAMBIO 1: Importar estudiantes en bulk — ahora guarda también la cédula ──
app.post('/api/students/bulk', auth, async (req, res) => {
  try {
    const { course, students } = req.body;
    if (!course || !Array.isArray(students)) {
      return res.status(400).json({ error: 'Se requiere course y students[]' });
    }
    let imported = 0, duplicates = 0;
    for (const s of students) {
      try {
        await Student.create({
          course,
          nombre:  s.nombre,
          email:   s.email  || '',
          wa:      s.wa     || '',
          cedula:  s.cedula || '',   // ← campo nuevo para el cruce
        });
        imported++;
      } catch (e) {
        if (e.code === 11000) duplicates++;
        else throw e;
      }
    }
    res.status(201).json({ imported, duplicates });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/students/:id', auth, async (req, res) => {
  try {
    const s = await Student.findByIdAndDelete(req.params.id);
    if (!s) return res.status(404).json({ error: 'Estudiante no encontrado' });
    await Entrega.deleteMany({ studentId: req.params.id });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/students/course/:courseId', auth, async (req, res) => {
  try {
    const result = await Student.deleteMany({ course: req.params.courseId });
    res.json({ deleted: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────
// ENTREGAS (delivery status)
// ─────────────────────────────────────────────
app.get('/api/entregas', auth, async (req, res) => {
  try {
    const { course, taskId } = req.query;
    let filter = {};
    if (course) {
      const studentIds = (await Student.find({ course }).select('_id')).map(s => s._id);
      filter.studentId = { $in: studentIds };
    }
    if (taskId) filter.taskId = taskId;
    const entregas = await Entrega.find(filter);
    res.json(entregas);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT — actualizar estado individual
app.put('/api/entregas', auth, async (req, res) => {
  try {
    const { studentId, taskId, estado } = req.body;
    if (!studentId || !taskId || !estado) {
      return res.status(400).json({ error: 'studentId, taskId y estado son obligatorios' });
    }
    const entrega = await Entrega.findOneAndUpdate(
      { studentId, taskId },
      { estado },
      { upsert: true, new: true }
    );
    res.json(entrega);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── CAMBIO 2: POST /api/entregas/bulk — actualizar muchos estados de una sola vez ──
app.post('/api/entregas/bulk', auth, async (req, res) => {
  try {
    const { entregas } = req.body;
    if (!Array.isArray(entregas) || !entregas.length) {
      return res.status(400).json({ error: 'Se requiere entregas[]' });
    }

    // Usar bulkWrite para hacerlo en una sola operación a MongoDB
    const ops = entregas.map(({ studentId, taskId, estado }) => ({
      updateOne: {
        filter: { studentId, taskId },
        update: { $set: { studentId, taskId, estado } },
        upsert: true,
      },
    }));

    const result = await Entrega.bulkWrite(ops, { ordered: false });
    res.json({
      updated:  result.modifiedCount + result.upsertedCount,
      modified: result.modifiedCount,
      created:  result.upsertedCount,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
