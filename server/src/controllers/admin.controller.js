import User, { createAccount, publicUser } from '../models/User.js';
import Notice from '../models/Notice.js';
import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcryptjs';

export const createUser = role => async (req, res) => {
  const user = await createAccount(req.body, role);
  await Notice.create({ userId: user.id, kind: 'account', title: 'Your account is ready',
    body: 'Welcome to Campus Access. Review your profile and security settings.' });
  res.status(201).json({ user: publicUser(user) });
};

export const listUsers = role => async (req, res) => {
  const filter = { role };
  if (typeof req.query.department === 'string' && req.query.department.trim()) {
    filter.department = req.query.department.trim().slice(0, 80);
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ users: users.map(publicUser) });
};

export const setActive = role => async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id) || typeof req.body?.active !== 'boolean') {
    return res.status(400).json({ message: 'Select an account and its new status.' });
  }
  const user = await User.findOneAndUpdate({ _id: req.params.id, role },
    { $set: { active: req.body.active }, $inc: { sessionVersion: 1 } }, { new: true });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  await Notice.create({ userId: user.id, kind: 'account', title: user.active ? 'Account reactivated' : 'Account deactivated',
    body: user.active ? 'Your account can sign in again.' : 'Your account access has been paused by an administrator.' });
  res.json({ user: publicUser(user) });
};

const excelText = value => {
  const text = String(value ?? '');
  return /^[=+@-]/.test(text) ? `'${text}` : text;
};

export const exportUsers = role => async (req, res) => {
  const users = await User.find({ role }).sort({ createdAt: 1 });
  const book = new ExcelJS.Workbook();
  const sheet = book.addWorksheet(role === 'student' ? 'Students' : 'Faculty');
  sheet.columns = [
    { header: 'Name', key: 'name', width: 25 }, { header: 'Email', key: 'email', width: 32 },
    { header: 'Roll number', key: 'rollNumber', width: 20 }, { header: 'Department', key: 'department', width: 25 },
    { header: 'Contact', key: 'contact', width: 22 }, { header: 'Status', key: 'status', width: 15 },
    { header: 'Created', key: 'created', width: 22 },
  ];
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4A285E' } };
  for (const user of users) sheet.addRow({ name: excelText(user.name), email: excelText(user.email),
    rollNumber: excelText(user.rollNumber), department: excelText(user.department),
    contact: excelText(user.contact), status: user.active ? 'Active' : 'Inactive', created: user.createdAt });
  sheet.getColumn('created').numFmt = 'yyyy-mm-dd hh:mm';
  res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.attachment(`${role}-accounts.xlsx`);
  await book.xlsx.write(res);
  res.end();
};

export async function importStudents(req, res) {
  if (typeof req.body !== 'string') return res.status(415).json({ message: 'Upload a CSV file.' });
  let rows;
  try { rows = parse(req.body, { columns: true, bom: true, skip_empty_lines: true, trim: true }); }
  catch { return res.status(400).json({ message: 'Invalid CSV file.' }); }
  if (!rows.length || rows.length > 100) return res.status(400).json({ message: 'CSV must contain 1 to 100 students.' });
  const required = ['name', 'email', 'password', 'rollNumber'];
  if (required.some(field => !Object.hasOwn(rows[0], field))) {
    return res.status(400).json({ message: 'CSV needs name,email,password,rollNumber columns.' });
  }
  const imported = [], errors = [];
  for (const [index, row] of rows.entries()) {
    try {
      const user = await createAccount(row, 'student');
      imported.push(publicUser(user));
      await Notice.create({ userId: user.id, kind: 'account', title: 'Your account is ready',
        body: 'Welcome to Campus Access. Review your profile and security settings.' });
    } catch (error) { errors.push({ row: index + 2, message: error.code === 11000 ? 'Duplicate name, email or roll number.' : error.message }); }
  }
  res.json({ imported, errors });
}

export async function createNotice(req, res) {
  const { kind, title, body, dueAt } = req.body || {};
  if (!['announcement', 'deadline'].includes(kind) || typeof title !== 'string' || !title.trim() ||
    title.length > 100 || typeof body !== 'string' || !body.trim() || body.length > 500 ||
    (kind === 'deadline' && (!dueAt || Number.isNaN(Date.parse(dueAt))))) {
    return res.status(400).json({ message: 'Enter a valid notice.' });
  }
  const users = await User.find({ active: true }).select('_id');
  if (users.length) await Notice.insertMany(users.map(user => ({ userId: user.id, kind,
    title: title.trim(), body: body.trim(), ...(kind === 'deadline' ? { dueAt: new Date(dueAt) } : {}) })));
  res.status(201).json({ delivered: users.length });
}

export async function recordAttendance(req, res) {
  const { day, present } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id) || typeof day !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(`${day}T00:00:00Z`)) ||
    typeof present !== 'boolean') return res.status(400).json({ message: 'Enter a valid date and attendance status.' });
  const user = await User.findOne({ _id: req.params.id, role: { $in: ['student', 'faculty'] } });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  await Attendance.updateOne({ userId: user.id, day }, { $set: { present } }, { upsert: true });
  res.json({ message: 'Attendance saved.' });
}

export async function changeAccountPassword(req, res) {
  const { newPassword } = req.body || {};
  if (!mongoose.isValidObjectId(req.params.id) || typeof newPassword !== 'string' ||
    newPassword.length < 10 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    return res.status(400).json({ message: 'Choose an account and a password of at least 10 characters.' });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await User.findByIdAndUpdate(req.params.id, { $set: { passwordHash },
    $inc: { sessionVersion: 1 }, $unset: { resetTokenHash: '', resetExpiresAt: '' } }, { new: true });
  if (!user) return res.status(404).json({ message: 'Account not found.' });
  await Notice.create({ userId: user.id, kind: 'account', title: 'Password changed',
    body: 'An administrator changed your password. Contact them if this was unexpected.' });
  res.json({ user: publicUser(user), message: 'Password changed.' });
}
