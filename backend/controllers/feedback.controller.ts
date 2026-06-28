import { Request, Response } from 'express';
import Feedback from '../models/Feedback.model';

// GET /api/feedback/rate?id=xxx&rating=satisfied&email=xxx&name=xxx&title=xxx
export const rateFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, rating, email, name, title } = req.query as Record<string, string>;

    if (!id || !rating) {
      res.status(400).send('<h1>Invalid feedback link</h1>');
      return;
    }

    await Feedback.findOneAndUpdate(
      { workOrderId: id },
      {
        rating,
        customerEmail:  email  || '',
        customerName:   name   || '',
        workOrderTitle: title  || '',
      },
      { upsert: true, new: true }
    );

    const configs = {
      satisfied:   { emoji: '😊', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', title: 'Thank You!', message: 'We are delighted to hear you had a great experience. Your satisfaction is our priority!' },
      neutral:     { emoji: '😐', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', title: 'Thank You for Your Feedback', message: 'We appreciate your honest feedback. We will work hard to improve our service quality.' },
      unsatisfied: { emoji: '😞', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', title: 'We Sincerely Apologize', message: 'We are sorry you had a poor experience. Our team will review your feedback and work to do better.' },
    };

    const c = configs[rating as keyof typeof configs] || configs.neutral;

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Feedback Received - FM Dashboard</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: Arial, sans-serif;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .card {
      background: #ffffff;
      border-radius: 24px;
      padding: 48px 40px;
      text-align: center;
      box-shadow: 0 32px 80px rgba(0,0,0,0.4);
      max-width: 440px;
      width: 100%;
      animation: slideUp 0.4s cubic-bezier(0.22,1,0.36,1);
    }
    @keyframes slideUp {
      from { opacity:0; transform:translateY(30px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .logo-bar {
      background: linear-gradient(135deg, #1E3A8A, #1D4ED8);
      margin: -48px -40px 32px;
      padding: 20px 32px;
      border-radius: 24px 24px 0 0;
      text-align: left;
    }
    .logo-bar p { color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 4px; }
    .logo-bar h2 { color: #fff; font-size: 16px; font-weight: 800; }
    .emoji-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: ${c.bg};
      border: 3px solid ${c.border};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 52px;
      margin: 0 auto 24px;
      animation: bounce 0.6s ease 0.3s both;
    }
    @keyframes bounce {
      0%   { transform: scale(0); }
      60%  { transform: scale(1.15); }
      100% { transform: scale(1); }
    }
    h1 { font-size: 22px; font-weight: 800; color: ${c.color}; margin-bottom: 12px; }
    .message { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 24px; }
    .rating-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${c.bg};
      border: 1px solid ${c.border};
      color: ${c.color};
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 28px;
    }
    .divider { height: 1px; background: #F1F5F9; margin: 24px 0; }
    .footer { font-size: 12px; color: #94A3B8; line-height: 1.8; }
    .footer strong { color: #475569; }
    .checkmark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background: ${c.color};
      border-radius: 50%;
      color: white;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-bar">
      <p>Facilities Management System</p>
      <h2>Work Order Feedback</h2>
    </div>

    <div class="emoji-circle">${c.emoji}</div>

    <h1>${c.title}</h1>
    <p class="message">${c.message}</p>

    <div class="rating-badge">
      <span class="checkmark">✓</span>
      Feedback recorded as: <strong>${rating.toUpperCase()}</strong>
    </div>

    ${title ? `<p style="font-size:13px;color:#64748B;margin-bottom:16px;">Work Order: <strong style="color:#0F172A;">${title}</strong></p>` : ''}

    <div class="divider"></div>

    <div class="footer">
      <strong>Technical Help Desk Engineering Service Unit</strong><br>
      Tel: +971 4 5055099<br>
      P.O Box: 2525, Dubai, UAE<br>
      E-mail: THD.EngineeringServices@facilities.ae
    </div>
  </div>
</body>
</html>
    `);
  } catch (error: any) {
    console.error('Feedback error:', error.message);
    res.status(500).send('<h1>Something went wrong. Please try again.</h1>');
  }
};

// GET /api/feedback/:workOrderId — Get feedback for a WO
export const getFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.findOne({ workOrderId: req.params.workOrderId });
    res.json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/feedback — Get all feedback
export const getAllFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    const stats = {
      total:       feedback.length,
      satisfied:   feedback.filter(f => f.rating === 'satisfied').length,
      neutral:     feedback.filter(f => f.rating === 'neutral').length,
      unsatisfied: feedback.filter(f => f.rating === 'unsatisfied').length,
      satisfaction_rate: feedback.length > 0
        ? Math.round((feedback.filter(f => f.rating === 'satisfied').length / feedback.length) * 100)
        : 0,
    };
    res.json({ success: true, data: feedback, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};