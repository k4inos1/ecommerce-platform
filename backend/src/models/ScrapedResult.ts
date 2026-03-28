import { Schema, Document, model } from 'mongoose';

export interface IScrapedProduct {
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  supplierPrice: number;
  margin: number;
  demandScore: number;
  competitionLevel: string;
  trend: string;
  source: string;
  sourceUrl: string;
}

export interface IScrapedResult extends Document {
  query: string;
  source: string;
  products: IScrapedProduct[];
  count: number;
  createdAt: Date;
}

const ScrapedProductSchema = new Schema<IScrapedProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, default: 'Accessories' },
    supplierPrice: { type: Number, default: 0 },
    margin: { type: Number, default: 0 },
    demandScore: { type: Number, default: 0 },
    competitionLevel: { type: String, default: 'medium' },
    trend: { type: String, default: 'stable' },
    source: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
  },
  { _id: false }
);

const ScrapedResultSchema = new Schema<IScrapedResult>(
  {
    query: { type: String, required: true, index: true },
    source: { type: String, default: 'scraper' },
    products: { type: [ScrapedProductSchema], default: [] },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ScrapedResult = model<IScrapedResult>('ScrapedResult', ScrapedResultSchema);
