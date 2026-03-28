import { Schema, Document, Types, model } from 'mongoose';

export interface IOrderItem {
  product?: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  discountAmount: number;
  couponCode?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name?: string; street?: string; city?: string; region?: string;
    postal?: string; country?: string; phone?: string;
  };
  stripeSessionId?: string;
  webpayToken?: string;
  paidAt?: Date;
  paymentMethod?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      name: String, street: String, city: String, region: String,
      postal: String, country: String, phone: String,
    },
    stripeSessionId: { type: String },
    webpayToken: { type: String },
    paidAt: { type: Date },
    paymentMethod: { type: String, default: 'card' },
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', OrderSchema);
