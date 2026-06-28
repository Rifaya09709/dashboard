import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  workOrderId: string;
  rating: 'unsatisfied' | 'neutral' | 'satisfied';
  customerEmail: string;
  customerName: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  workOrderId:   { type: String, required: true },
  rating:        { type: String, enum: ['unsatisfied', 'neutral', 'satisfied'], required: true },
  customerEmail: { type: String, default: '' },
  customerName:  { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);