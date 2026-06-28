import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'Admin' | 'User';
  status: 'Active' | 'Inactive';
}

const UserSchema = new Schema<IUser>({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['Admin', 'User'], default: 'User' },
  status:   { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });



export default mongoose.model<IUser>('User', UserSchema);