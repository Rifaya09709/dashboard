import { Request, Response } from 'express';
import WorkOrder from '../models/WorkOrder.model';
import MonthlyStats from '../models/MonthlyStats.model';
import { sendResolvedEmail } from '../emailService';

export const getAllWorkOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, month, page = 1, limit = 20 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (month)    filter.month    = month;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      WorkOrder.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      WorkOrder.countDocuments(filter)
    ]);

    res.json({ success: true, data: orders, total, page: Number(page), limit: Number(limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWorkOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.title?.trim()) {
      res.status(400).json({ success: false, message: 'Title is required' });
      return;
    }

    const order = await WorkOrder.create({
      title:         req.body.title.trim(),
      category:      req.body.category,
      status:        req.body.status      || 'open',
      priority:      req.body.priority    || 'medium',
      assignedTo:    req.body.assignedTo  || 'Unassigned',
      location:      req.body.location    || '',
      description:   req.body.description || '',
      month:         req.body.month,
      customerName:  req.body.customerName  || '',
      customerEmail: req.body.customerEmail || '',
      dueDate:       req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    });

    const [, yearStr] = order.month.split('-');
    const year = 2000 + Number(yearStr);
    const categoryKey = order.category.replace(/\s+/g, '_').toUpperCase();

    await MonthlyStats.findOneAndUpdate(
      { month: order.month },
      { $setOnInsert: { year }, $inc: { generated: 1, [`categories.${categoryKey}`]: 1 } },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWorkOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await WorkOrder.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Work order not found' });
      return;
    }

    const update: Record<string, unknown> = {
      title:         req.body.title         ?? existing.title,
      category:      req.body.category      ?? existing.category,
      status:        req.body.status        ?? existing.status,
      priority:      req.body.priority      ?? existing.priority,
      assignedTo:    req.body.assignedTo    ?? existing.assignedTo,
      location:      req.body.location      ?? existing.location,
      description:   req.body.description   ?? existing.description,
      month:         req.body.month         ?? existing.month,
      customerName:  req.body.customerName  ?? existing.customerName,
      customerEmail: req.body.customerEmail ?? existing.customerEmail,
      dueDate:       req.body.dueDate ? new Date(req.body.dueDate) : existing.dueDate,
    };

    // Status → closed: send resolved email with feedback links
    if (update.status === 'closed' && existing.status !== 'closed') {
      update.closedAt = new Date();

      await MonthlyStats.findOneAndUpdate(
        { month: existing.month },
        { $inc: { closed: 1 } }
      );

      const email = (update.customerEmail as string) || existing.customerEmail;
      if (email) {
        try {
          await sendResolvedEmail({
            toEmail:        email,
            customerName:   (update.customerName as string) || existing.customerName || 'Customer',
            serviceRequest: String(existing._id).slice(-6).toUpperCase(),
            description:    existing.description || existing.title,
            location:       existing.location || 'N/A',
            category:       existing.category,
            dueDate:        existing.dueDate
              ? new Date(existing.dueDate).toLocaleDateString('en-GB')
              : 'N/A',
            status:         'RESOLVED',
            workOrderId:    String(existing._id), // ← feedback link-க்கு
          });
        } catch (emailErr: any) {
          console.error('❌ Email error:', emailErr.message);
        }
      }
    }

    // Reverse closed count if reopened
    if (update.status !== 'closed' && existing.status === 'closed') {
      await MonthlyStats.findOneAndUpdate(
        { month: existing.month },
        { $inc: { closed: -1 } }
      );
      update.closedAt = undefined;
    }

    const order = await WorkOrder.findByIdAndUpdate(id, update, { new: true, runValidators: false });
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteWorkOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await WorkOrder.findByIdAndDelete(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Work order not found' });
      return;
    }

    const categoryKey = order.category.replace(/\s+/g, '_').toUpperCase();
    await MonthlyStats.findOneAndUpdate(
      { month: order.month },
      { $inc: { generated: -1, [`categories.${categoryKey}`]: -1 } }
    );

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};