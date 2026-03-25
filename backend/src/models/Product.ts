import { Schema, Document, model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: String, required: true },
    image: { type: String, default: '' },
  },
  { timestamps: true }
);

// Text search index
ProductSchema.index({ name: 'text', description: 'text' });

export const Product = model<IProduct>('Product', ProductSchema);
