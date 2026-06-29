import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';

const generateToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '7d' });

export const login = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) {
      
      const hashed = await bcrypt.hash(password, 10);
      user = await User.create({
        name: email.split('@')[0],
        email,
        password: hashed,
        role: 'User',
        status: 'Active',
      });
      res.json({
        _id: user._id, name: user.name, email: user.email,
        role: user.role, token: generateToken(String(user._id)),
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(String(user._id)),
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    // ✅ Controller-லயே hash பண்றோம்
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email,
      password: hashed,  // ← already hashed
      role: role || 'User',
      status: 'Active',
    });

    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(String(user._id)),
    });
  } catch (error: any) {
    console.error('Register error:', error.message);
    res.status(500).json({ message: error.message });
  }
};