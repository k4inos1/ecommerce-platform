import { Schema, Document, model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  cloudinaryPublicId: string;  // Cloudinary public_id for managed images (empty for external URLs)
  published: boolean;          // admin toggles this to show/hide in store
  source: string;              // 'manual' | 'aliexpress' | 'ebay' | 'import'
  sourceUrl: string;
  supplierPrice: number;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name:                 { type: String, required: true, trim: true },
    description:          { type: String, default: '' },
    price:                { type: Number, required: true, min: 0 },
    stock:                { type: Number, required: true, default: 0, min: 0 },
    category:             { type: String, required: true },
    image:                { type: String, default: '' },
    cloudinaryPublicId:   { type: String, default: '' },
    published:            { type: Boolean, default: false }, // imported = draft, admin publishes
    source:               { type: String, default: 'manual' },
    sourceUrl:            { type: String, default: '' },
    supplierPrice:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ published: 1 });

export const Product = model<IProduct>('Product', ProductSchema);
