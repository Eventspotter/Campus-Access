import mongoose from 'mongoose';
import Notice from '../models/Notice.js';
import Attendance from '../models/Attendance.js';

export async function listNotices(req, res) {
  const notices = await Notice.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
  res.json({ notices });
}

export async function markNoticeRead(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid notice.' });
  const notice = await Notice.findOneAndUpdate({ _id: req.params.id, userId: req.user.id },
    { $set: { readAt: new Date() } }, { new: true });
  if (!notice) return res.status(404).json({ message: 'Notice not found.' });
  res.json({ notice });
}

export async function summary(req, res) {
  const [unread, deadlines, attendance] = await Promise.all([
    Notice.countDocuments({ userId: req.user.id, readAt: null }),
    Notice.find({ userId: req.user.id, kind: 'deadline', dueAt: { $gte: new Date() } })
      .sort({ dueAt: 1 }).limit(3).select('title dueAt'),
    Attendance.find({ userId: req.user.id }).select('present'),
  ]);
  res.json({ unread, deadlines, attendance: {
    recorded: attendance.length, present: attendance.filter(day => day.present).length,
  } });
}
