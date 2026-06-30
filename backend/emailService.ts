import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface EmailData {
  toEmail:        string;
  customerName:   string;
  serviceRequest: string;
  description:    string;
  location:       string;
  category:       string;
  dueDate:        string;
  status:         string;
  workOrderId?:   string; // ← for feedback links
}

const BASE_URL = process.env.BASE_URL || 'https://dashboard-cafm-flydubai.onrender.com';

const getFeedbackLinks = (data: EmailData) => {
  if (!data.workOrderId) return '<p style="font-size:28px;letter-spacing:10px;">😞 😐 😊</p>';

  const base = `${BASE_URL}/api/feedback/rate`;
  const params = (rating: string) =>
    `?id=${data.workOrderId}&rating=${rating}&email=${encodeURIComponent(data.toEmail)}&name=${encodeURIComponent(data.customerName)}&title=${encodeURIComponent(data.serviceRequest)}`;

  return `
    <p style="margin-bottom:14px;font-size:14px;color:#374151;font-weight:500;">
      Please click below to rate your experience:
    </p>
    <div style="display:flex;gap:20px;justify-content:center;margin:8px 0;">
      <a href="${base}${params('unsatisfied')}"
         style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:40px;line-height:1;">😞</span>
        <span style="font-size:11px;color:#DC2626;font-weight:700;">Unsatisfied</span>
      </a>
      <a href="${base}${params('neutral')}"
         style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:40px;line-height:1;">😐</span>
        <span style="font-size:11px;color:#D97706;font-weight:700;">Neutral</span>
      </a>
      <a href="${base}${params('satisfied')}"
         style="text-decoration:none;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:40px;line-height:1;">😊</span>
        <span style="font-size:11px;color:#16A34A;font-weight:700;">Satisfied</span>
      </a>
    </div>
  `;
};

// ✅ RESOLVED EMAIL
export const sendResolvedEmail = async (data: EmailData): Promise<void> => {
  const feedbackSection = getFeedbackLinks(data);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a3c6e, #1D4ED8); padding: 24px 30px; }
    .header h2 { color: #ffffff; margin: 0; font-size: 18px; }
    .header p { color: #a8c4e0; margin: 4px 0 0; font-size: 13px; }
    .resolved-bar { background: #10b981; padding: 12px 30px; }
    .resolved-bar p { margin: 0; color: #ffffff; font-weight: bold; font-size: 14px; }
    .body { padding: 28px 30px; }
    .body p { color: #333; font-size: 14px; line-height: 1.7; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table tr { border-bottom: 1px solid #e5e7eb; }
    .info-table td { padding: 10px 8px; font-size: 14px; color: #374151; }
    .info-table td:first-child { font-weight: bold; color: #1a3c6e; width: 40%; }
    .feedback-box { background: #F8FAFC; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; border: 1px solid #E2E8F0; }
    .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 4px 0; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h2>✅ Service Request RESOLVED</h2>
      <p>Facilities Management System · Dubai Airports</p>
    </div>

    <div class="resolved-bar">
      <p>✅ We are pleased to inform that your service request has been resolved.</p>
    </div>

    <div class="body">
      <p>Dear <strong>${data.customerName}</strong>,</p>
      <p>We are pleased to inform that your service request has been resolved:</p>

      <table class="info-table">
        <tr><td>Service Request:</td><td><strong>${data.serviceRequest}</strong></td></tr>
        <tr><td>Description:</td><td>${data.description}</td></tr>
        <tr><td>Location:</td><td>${data.location}</td></tr>
        <tr><td>Category:</td><td>${data.category}</td></tr>
        <tr><td>Date Resolved:</td><td>${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td></tr>
        <tr><td>Status:</td><td><strong style="color:#10b981;">RESOLVED ✅</strong></td></tr>
      </table>

      <div class="divider"></div>

      <div class="feedback-box">
        <p style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:12px;">How was our service?</p>
        ${feedbackSection}
        <p style="font-size:11px;color:#94A3B8;margin-top:12px;">Click an emoji to submit your rating</p>
      </div>
    </div>

    <div class="footer">
      <p><strong>Technical Help Desk Engineering Service Unit</strong></p>
      <p>Tel: +971 4 5055099 &nbsp;|&nbsp; P.O Box: 2525, Dubai, UAE</p>
      <p>E-mail: THD.EngineeringServices@facilities.ae</p>
      <p style="margin-top:8px;color:#9ca3af;font-size:11px;">This is an automated notification. Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"FM Dashboard" <${process.env.EMAIL_FROM}>`,
    to:   data.toEmail,
    subject: `✅ Service Request ${data.serviceRequest} - RESOLVED`,
    html,
  });

  console.log(`✅ Resolved email sent to ${data.toEmail}`);
};

// ⏰ DUE DATE REMINDER EMAIL
export const sendDueDateReminderEmail = async (data: EmailData): Promise<void> => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1a3c6e, #1D4ED8); padding: 24px 30px; }
    .header h2 { color: #ffffff; margin: 0; font-size: 18px; }
    .header p { color: #a8c4e0; margin: 4px 0 0; font-size: 13px; }
    .alert-bar { background: #f59e0b; padding: 12px 30px; }
    .alert-bar p { margin: 0; color: #1a1a1a; font-weight: bold; font-size: 14px; }
    .body { padding: 28px 30px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table tr { border-bottom: 1px solid #e5e7eb; }
    .info-table td { padding: 10px 8px; font-size: 14px; color: #374151; }
    .info-table td:first-child { font-weight: bold; color: #1a3c6e; width: 40%; }
    .footer { background: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; }
    .footer p { margin: 4px 0; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h2>🔔 Work Order Due Date Reminder</h2>
      <p>Facilities Management System · Dubai Airports</p>
    </div>

    <div class="alert-bar">
      <p>⚠️ Your work order is due soon. Please take necessary action.</p>
    </div>

    <div class="body">
      <p style="color:#333;font-size:14px;line-height:1.7;">Dear <strong>${data.customerName}</strong>,</p>
      <p style="color:#333;font-size:14px;line-height:1.7;">
        This is a reminder that the following service request is approaching its due date.
      </p>

      <table class="info-table">
        <tr><td>Service Request:</td><td><strong>${data.serviceRequest}</strong></td></tr>
        <tr><td>Description:</td><td>${data.description}</td></tr>
        <tr><td>Location:</td><td>${data.location}</td></tr>
        <tr><td>Category:</td><td>${data.category}</td></tr>
        <tr><td>Due Date:</td><td><strong style="color:#DC2626;">${data.dueDate}</strong></td></tr>
        <tr><td>Status:</td><td><span style="background:#FEF3C7;color:#92400E;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:700;">${data.status}</span></td></tr>
      </table>

      <p style="color:#6b7280;font-size:13px;margin-top:16px;">
        If you have already addressed this work order or need further assistance,
        please contact our Facilities Management team immediately.
      </p>
    </div>

    <div class="footer">
      <p><strong>Technical Help Desk Engineering Service Unit</strong></p>
      <p>Tel: +971 4 5055099 &nbsp;|&nbsp; P.O Box: 2525, Dubai, UAE</p>
      <p>E-mail: THD.EngineeringServices@facilities.ae</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"FM Dashboard" <${process.env.EMAIL_FROM}>`,
    to:   data.toEmail,
    subject: `🔔 Reminder: Work Order ${data.serviceRequest} Due Soon`,
    html,
  });

  console.log(`✅ Reminder email sent to ${data.toEmail}`);
};