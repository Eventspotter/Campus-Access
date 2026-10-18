import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  kind: { type: String, enum: ['announcement', 'deadline', 'account'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  body: { type: String, required: true, trim: true, maxlength: 500 },
  dueAt: Date,
  readAt: Date,
}, { timestamps: true });

noticeSchema.index({ userId: 1, createdAt: -1 });
export default mongoose.model('Notice', noticeSchema);
