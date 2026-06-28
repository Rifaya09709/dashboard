import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  try {
    await transporter.verify();
    console.log('✅ Gmail connected!');

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'shafeeq.s@flydubai.com',
      subject: 'Test - Work Order Dashboard',
      html: '<h2>✅ Email working!</h2><p>Your FM Dashboard email is configured correctly.</p>',
    });

    console.log('✅ Email sent successfully!');
  } catch (err: any) {
    console.error('❌ Error:', err.message);
  }
  process.exit(0);
}

test();