import { Request, Response } from 'express';
import MonthlyStats from '../models/MonthlyStats.model';

export const getAllStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await MonthlyStats.find().sort({ year: 1, _id: 1 });
    const totalGenerated = stats.reduce((sum, s) => sum + s.generated, 0);
    const totalClosed = stats.reduce((sum, s) => sum + s.closed, 0);
    const efficiencyRate = totalGenerated > 0
      ? ((totalClosed / totalGenerated) * 100).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        summary: { totalGenerated, totalClosed, efficiencyRate: parseFloat(efficiencyRate) },
        monthly: stats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

export const getStatsByMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month } = req.params;
    const stat = await MonthlyStats.findOne({ month });
    if (!stat) {
      res.status(404).json({ success: false, message: 'Month not found' });
      return;
    }
    res.json({ success: true, data: stat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};