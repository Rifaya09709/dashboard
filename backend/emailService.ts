import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  toEmail: string;
  customerName: string;
  serviceRequest: string;
  description: string;
  location: string;
  category: string;
  dueDate: string;
  status: string;
  workOrderId?: string;
}

const BASE_URL = process.env.BASE_URL || 'https://dashboard-cafm-flydubai.onrender.com';

const getFeedbackLinks = (data: EmailData) => {
  if (!data.workOrderId) return '<p style="font-size:28px;letter-spacing:10px;">😞 😐 😊</p>';
  const base = `${BASE_URL}/api/feedback/rate`;
  const params = (rating: string) =>
    `?id=${data.workOrderId}&rating=${rating}&email=${encodeURIComponent(data.toEmail)}&name=${encodeURIComponent(data.customerName)}&title=${encodeURIComponent(data.serviceRequest)}`;
  return `
    <p style="margin-bottom:14px;font-size:14px;color:#374151;font-weight:500;">Please click below to rate your experience:</p>
    <div style="display:flex;gap:20px;justify-content:center;margin:8px 0;">
      <a href="${base}${params('unsatisfied')}" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:40px;line-height:1;">😞</span><span style="font-size:11px;color:#DC2626;font-weight:700;">Unsatisfied</span></a>
      <a href="${base}${params('neutral')}" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:40px;line-height:1;">😐</span><span style="font-size:11px;color:#D97706;font-weight:700;">Neutral</span></a>
      <a href="${base}${params('satisfied')}" style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:40px;line-height:1;">😊</span><span style="font-size:11px;color:#16A34A;font-weight:700;">Satisfied</span></a>
    </div>`;
};

export const sendResolvedEmail = async (data: EmailData): Promise<void> => {
  const feedbackSection = getFeedbackLinks(data);
  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;}
.wrapper{max-width:600px;margin:30px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
.header{background:linear-gradient(135deg,#1a3c6e,#1D4ED8);padding:24px 30px;}
.header h2{color:#fff;margin:0;font-size:18px;}
.header p{color:#a8c4e0;margin:4px 0 0;font-size:13px;}
.resolved-bar{background:#10b981;padding:12px 30px;}
.resolved-bar p{margin:0;color:#fff;font-weight:bold;font-size:14px;}
.body{padding:28px 30px;}
.body p{color:#333;font-size:14px;line-height:1.7;}
.info-table{width:100%;border-collapse:collapse;margin:20px 0;}
.info-table tr{border-bottom:1px solid #e5e7eb;}
.info-table td{padding:10px 8px;font-size:14px;color:#374151;}
.info-table td:first-child{font-weight:bold;color:#1a3c6e;width:40%;}
.feedback-box{background:#F8FAFC;border-radius:12px;padding:20px;text-align:center;margin:20px 0;border:1px solid #E2E8F0;}
.footer{background:#f9fafb;padding:20px 30px;border-top:1px solid #e5e7eb;}
.footer p{margin:4px 0;color:#6b7280;font-size:12px;}
</style></head><body>
<div class="wrapper">
<div class="header"><h2>✅ Service Request RESOLVED</h2><p>Facilities Management System · Dubai Airports</p></div>
<div class="resolved-bar"><p>✅ We are pleased to inform that your service request has been resolved.</p></div>
<div class="body">
<p>Dear <strong>${data.customerName}</strong>,</p>
<p>We are pleased to inform that your service request has been resolved:</p>
<table class="info-table">
<tr><td>Service Request:</td><td><strong>${data.serviceRequest}</strong></td></tr>
<tr><td>Description:</td><td>${data.description}</td></tr>
<tr><td>Location:</td><td>${data.location}</td></tr>
<tr><td>Category:</td><td>${data.category}</td></tr>
<tr><td>Status:</td><td><strong style="color:#10b981;">RESOLVED ✅</strong></td></tr>
</table>
<div class="feedback-box">
<p style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:12px;">How was our service?</p>
${feedbackSection}
</div>
</div>
<div class="footer">
<p><strong>Technical Help Desk Engineering Service Unit</strong></p>
<p>Tel: +971 4 5055099 &nbsp;|&nbsp; Dubai, UAE</p>
</div>
</div></body></html>`;

  try {
    await resend.emails.send({
      from: 'FM Dashboard <shafeeqmohamed478@gmail.com>',
      to: data.toEmail,
      subject: `Service Request ${data.serviceRequest} - RESOLVED`,
      html,
    });
    console.log(`✅ Resolved email sent to ${data.toEmail}`);
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
  }
};

export const sendDueDateReminderEmail = async (data: EmailData): Promise<void> => {
  const html = `<h2>Reminder: ${data.serviceRequest} due ${data.dueDate}</h2>`;
  try {
    await resend.emails.send({
      from: 'FM Dashboard <shafeeqmohamed478@gmail.com>',
      to: data.toEmail,
      subject: `Reminder: Work Order ${data.serviceRequest} Due Soon`,
      html,
    });
    console.log(`✅ Reminder email sent to ${data.toEmail}`);
  } catch (error: any) {
    console.error('❌ Email error:', error.message);
  }
};