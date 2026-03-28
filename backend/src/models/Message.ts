import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  user?: mongoose.Types.ObjectId;
  sender: 'user' | 'admin';
  content: string;
  room: string; // Typically the user ID or a unique session
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  sender: { type: String, enum: ['user', 'admin'], required: true },
  content: { type: String, required: true },
  room: { type: String, required: true, index: true },
}, { timestamps: true });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
