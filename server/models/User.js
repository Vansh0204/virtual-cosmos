import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  lastX: { type: Number, default: 0 },
  lastY: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
