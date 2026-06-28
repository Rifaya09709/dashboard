import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkOrder extends Document {
  title: string;
  category: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  location: string;
  description: string;
  month: string;
  // ✅ New email fields
  customerName:  string;
  customerEmail: string;
  dueDate?:      Date;
  createdAt:     Date;
  closedAt?:     Date;
}

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    title:         { type: String, required: true, trim: true },
    category:      { type: String, required: true, trim: true },
    status:        { type: String, enum: ['open', 'in-progress', 'closed'], default: 'open' },
    priority:      { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo:    { type: String, default: 'Unassigned' },
    location:      { type: String, default: '' },
    description:   { type: String, default: '' },
    month:         { type: String, required: true },
    // ✅ New fields
    customerName:  { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    dueDate:       { type: Date },
    closedAt:      { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkOrder>('WorkOrder', WorkOrderSchema);