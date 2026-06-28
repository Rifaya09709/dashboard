import mongoose, { Document, Schema } from 'mongoose';

export interface ICategoryCount {
  [key: string]: number;
  AV: number;
  BMS: number;
  CIVIL: number;
  CARPENTER: number;
  ELECTRICAL: number;
  FIRE_FIGHTING: number;
  FURNITURE: number;
  GENERAL: number;
  GENERATOR: number;
  HOUSEKEEPING: number;
  HVAC: number;
  IT: number;
  KITCHEN_EQPT: number;
  MECH: number;
  PLUMBING: number;
  MISC: number;
  SECURITY_SYSTEMS: number;
}

export interface IMonthlyStats extends Document {
  month: string;
  year: number;
  generated: number;
  closed: number;
  categories: ICategoryCount;
}

const CategoryCountSchema = new Schema<ICategoryCount>(
  {
    AV: { type: Number, default: 0 },
    BMS: { type: Number, default: 0 },
    CIVIL: { type: Number, default: 0 },
    CARPENTER: { type: Number, default: 0 },
    ELECTRICAL: { type: Number, default: 0 },
    FIRE_FIGHTING: { type: Number, default: 0 },
    FURNITURE: { type: Number, default: 0 },
    GENERAL: { type: Number, default: 0 },
    GENERATOR: { type: Number, default: 0 },
    HOUSEKEEPING: { type: Number, default: 0 },
    HVAC: { type: Number, default: 0 },
    IT: { type: Number, default: 0 },
    KITCHEN_EQPT: { type: Number, default: 0 },
    MECH: { type: Number, default: 0 },
    PLUMBING: { type: Number, default: 0 },
    MISC: { type: Number, default: 0 },
    SECURITY_SYSTEMS: { type: Number, default: 0 }
  },
  { _id: false }
);

const MonthlyStatsSchema = new Schema<IMonthlyStats>(
  {
    month: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    generated: { type: Number, default: 0 },
    closed: { type: Number, default: 0 },
    categories: { type: CategoryCountSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export default mongoose.model<IMonthlyStats>('MonthlyStats', MonthlyStatsSchema);