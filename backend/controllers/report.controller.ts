import { Request, Response } from 'express';
import MonthlyStats from '../models/MonthlyStats.model';
import WorkOrder from '../models/WorkOrder.model';

export const generatePDFReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month } = req.params;
    const stats = await MonthlyStats.findOne({ month });
    const workOrders = await WorkOrder.find({ month }).sort({ createdAt: -1 });

    if (!stats) {
      res.status(404).json({ success: false, message: 'Month data not found' });
      return;
    }

    const efficiency = stats.generated > 0
      ? ((stats.closed / stats.generated) * 100).toFixed(1) : '0.0';

    const categoryRows = Object.entries(stats.categories as Record<string, number>)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => `
        <tr>
          <td>${cat.replace(/_/g, ' ')}</td>
          <td style="text-align:center">${count}</td>
          <td style="text-align:center">${stats.generated > 0 ? ((count / stats.generated) * 100).toFixed(1) : 0}%</td>
        </tr>
      `).join('');

    const woRows = workOrders.slice(0, 20).map((wo, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#F8FAFC'}">
        <td>${String(wo._id).slice(-6).toUpperCase()}</td>
        <td>${wo.title}</td>
        <td>${wo.category}</td>
        <td style="color:${wo.status === 'closed' ? '#16A34A' : wo.status === 'in-progress' ? '#D97706' : '#2563EB'};font-weight:700">${wo.status.toUpperCase()}</td>
        <td style="color:${wo.priority === 'high' ? '#DC2626' : wo.priority === 'medium' ? '#D97706' : '#64748B'}">${wo.priority}</td>
        <td>${wo.location || 'N/A'}</td>
      </tr>
    `).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: Arial, sans-serif; color: #1E293B; background: #fff; }
    .header { background: linear-gradient(135deg, #1E3A8A, #1D4ED8); color: white; padding: 32px 40px; }
    .header h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    .header p { font-size: 13px; opacity: 0.8; }
    .logo-tag { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.6; margin-bottom: 12px; }
    .content { padding: 32px 40px; }
    .section-title { font-size: 16px; font-weight: 700; color: #1E3A8A; margin: 28px 0 14px; border-left: 4px solid #1D4ED8; padding-left: 12px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 8px; }
    .kpi-card { background: #F8FAFC; border-radius: 10px; padding: 16px 20px; border: 1px solid #E2E8F0; }
    .kpi-label { font-size: 11px; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .kpi-value { font-size: 28px; font-weight: 800; }
    .kpi-blue { color: #2563EB; }
    .kpi-orange { color: #EA580C; }
    .kpi-green { color: #16A34A; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1E3A8A; color: white; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }
    td { padding: 9px 12px; border-bottom: 1px solid #F1F5F9; }
    .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 40px; margin-top: 40px; }
    .footer p { font-size: 11px; color: #94A3B8; margin-bottom: 4px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
    .badge-generated { background: #DBEAFE; color: #1D4ED8; }
    .badge-closed { background: #D1FAE5; color: #065F46; }
    .divider { height: 1px; background: #E2E8F0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-tag">Facilities Management · Work Order System</div>
    <h1>Monthly Performance Report</h1>
    <p>${month} · Generated on ${new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
  </div>

  <div class="content">
    <div class="section-title">Executive Summary</div>
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-label">Total Generated</div>
        <div class="kpi-value kpi-blue">${stats.generated.toLocaleString()}</div>
        <div style="font-size:12px;color:#64748B;margin-top:4px">Work orders raised</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Closed</div>
        <div class="kpi-value kpi-orange">${stats.closed.toLocaleString()}</div>
        <div style="font-size:12px;color:#64748B;margin-top:4px">Work orders resolved</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Efficiency Rate</div>
        <div class="kpi-value kpi-green">${efficiency}%</div>
        <div style="font-size:12px;color:#64748B;margin-top:4px">Closed vs Generated ratio</div>
      </div>
    </div>

    <div class="divider"></div>

    <div class="section-title">Category Breakdown</div>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th style="text-align:center">Count</th>
          <th style="text-align:center">% of Total</th>
        </tr>
      </thead>
      <tbody>${categoryRows}</tbody>
    </table>

    <div class="section-title" style="margin-top:32px">Work Order Details (Latest 20)</div>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Location</th>
        </tr>
      </thead>
      <tbody>${woRows}</tbody>
    </table>

    ${workOrders.length > 20 ? `<p style="font-size:12px;color:#94A3B8;margin-top:8px;text-align:center">+ ${workOrders.length - 20} more work orders not shown</p>` : ''}
  </div>

  <div class="footer">
    <p><strong>Technical Help Desk Engineering Service Unit</strong></p>
    <p>Tel: +971 4 5055099 · P.O Box: 2525, Dubai, UAE</p>
    <p>Report generated automatically by FM Work Order Dashboard · ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="WO-Report-${month}.html"`);
    res.send(html);

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};