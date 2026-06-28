import cron from 'node-cron';
import WorkOrder from './models/WorkOrder.model';
import { sendDueDateReminderEmail } from './emailService';

export const startScheduler = (): void => {

  // Every day at 8:00 AM — check due dates
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Scheduler running — checking due dates...');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // 3 days from now
      const threeDays = new Date(today);
      threeDays.setDate(threeDays.getDate() + 3);

      // Find WOs due in next 3 days, not closed, has customer email
      const upcomingWOs = await WorkOrder.find({
        status: { $ne: 'closed' },
        dueDate: { $gte: today, $lte: threeDays },
        customerEmail: { $exists: true, $ne: '' },
      });

      console.log(`📋 Found ${upcomingWOs.length} upcoming due work orders`);

      for (const wo of upcomingWOs) {
        try {
          const dueDate = new Date(wo.dueDate!);
          const formattedDate = dueDate.toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          });

          await sendDueDateReminderEmail({
            toEmail:        wo.customerEmail!,
            customerName:   wo.customerName || wo.assignedTo || 'Customer',
            serviceRequest: String(wo._id).slice(-6).toUpperCase(),
            description:    wo.description || wo.title,
            location:       wo.location || 'N/A',
            category:       wo.category,
            dueDate:        formattedDate,
            status:         wo.status.toUpperCase(),
          });

        } catch (emailErr: any) {
          console.error(`❌ Email failed for WO ${wo._id}:`, emailErr.message);
        }
      }

    } catch (err: any) {
      console.error('❌ Scheduler error:', err.message);
    }
  });

  console.log('✅ Email scheduler started — runs daily at 8:00 AM');
};