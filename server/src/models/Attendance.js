import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  present: { type: Boolean, required: true },
}, { timestamps: true });

attendanceSchema.index({ userId: 1, day: 1 }, { unique: true });
export default mongoose.model('Attendance', attendanceSchema);
