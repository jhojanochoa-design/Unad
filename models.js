const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// COURSE MODEL
// ─────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  period:  { type: String, required: true, unique: true }, // '2281'
  name:    { type: String, required: true },
  code:    { type: String, default: '740508' },
}, { timestamps: true });

// ─────────────────────────────────────────────
// TASK MODEL
// ─────────────────────────────────────────────
const taskSchema = new mongoose.Schema({
  course:    { type: String, required: true },  // period id e.g. '2281'
  momento:   { type: String, enum: ['Inicial','Intermedio','Final',''], default: '' },
  name:      { type: String, required: true },
  tipo:      { type: String, enum: ['ind','col','prueba'], default: 'ind' },
  pts:       { type: Number, default: 0 },
  due:       { type: String },               // 'YYYY-MM-DD'
  desc:      { type: String, default: '' },
  recursos:  [{ type: String }],
  subtasks:  [{ type: String }],
  campusUrl: { type: String, default: '' },
  notes:     { type: String, default: '' },
  done:      { type: Boolean, default: false },
  aiHistory: [{
    role:    { type: String, enum: ['user','assistant'] },
    content: { type: String },
  }],
}, { timestamps: true });

// ─────────────────────────────────────────────
// STUDENT MODEL
// ─────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  course:  { type: String, required: true },  // period id
  nombre:  { type: String, required: true },
  email:   { type: String, default: '' },
  wa:      { type: String, default: '' },     // WhatsApp number
}, { timestamps: true });

// Unique per course+nombre+email
studentSchema.index({ course: 1, nombre: 1, email: 1 }, { unique: true });

// ─────────────────────────────────────────────
// ENTREGA MODEL (delivery status per student per task)
// ─────────────────────────────────────────────
const entregaSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  estado:    { type: String, enum: ['pendiente','entrego','inactivo'], default: 'pendiente' },
}, { timestamps: true });

entregaSchema.index({ studentId: 1, taskId: 1 }, { unique: true });

// ─────────────────────────────────────────────
// SUBTASK PROGRESS (which subtasks are checked)
// ─────────────────────────────────────────────
const subtaskProgressSchema = new mongoose.Schema({
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, unique: true },
  doneItems: [{ type: Number }],   // indexes of completed subtasks
}, { timestamps: true });

module.exports = {
  Course:          mongoose.model('Course',          courseSchema),
  Task:            mongoose.model('Task',            taskSchema),
  Student:         mongoose.model('Student',         studentSchema),
  Entrega:         mongoose.model('Entrega',         entregaSchema),
  SubtaskProgress: mongoose.model('SubtaskProgress', subtaskProgressSchema),
};
