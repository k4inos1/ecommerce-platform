import { Schema, Document, model, Types } from 'mongoose';

export interface INotification extends Document {
  user: Types.ObjectId;
  type: 'order_status' | 'order_placed' | 'promo';
  title: string;
  message: string;
  read: boolean;
  orderId?: Types.ObjectId;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['order_status', 'order_placed', 'promo'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
