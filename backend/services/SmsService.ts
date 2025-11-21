import twilio from 'twilio';
import prisma from '../db/connection';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER!;

export enum SmsType {
  SHIFT_PUBLISHED = 'SHIFT_PUBLISHED',
  SHIFT_REMINDER_1HR = 'SHIFT_REMINDER_1HR',
  SHIFT_REMINDER_24HR = 'SHIFT_REMINDER_24HR',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  SHIFT_SWAP_REQUEST = 'SHIFT_SWAP_REQUEST',
  SHIFT_SWAP_APPROVED = 'SHIFT_SWAP_APPROVED',
  TIME_OFF_APPROVED = 'TIME_OFF_APPROVED',
  TIME_OFF_DENIED = 'TIME_OFF_DENIED',
  CALLOUT_COVERAGE = 'CALLOUT_COVERAGE',
}

const SMS_TEMPLATES = {
  [SmsType.SHIFT_PUBLISHED]: (data: any) =>
    `📅 Hi ${data.name}! Your schedule is ready. You have ${data.count} shifts next week.`,
  
  [SmsType.SHIFT_REMINDER_1HR]: (data: any) =>
    `⏰ Reminder: Your ${data.role} shift starts in 1 hour. See you soon!`,
  
  [SmsType.SHIFT_REMINDER_24HR]: (data: any) =>
    `📅 Tomorrow: ${data.role} shift at ${data.time}. Don't forget!`,
  
  [SmsType.SCHEDULE_CHANGE]: (data: any) =>
    `📝 Schedule Update: Your shift moved to ${data.newTime}`,
  
  [SmsType.SHIFT_SWAP_REQUEST]: (data: any) =>
    `🔄 ${data.requester} wants to swap their shift on ${data.date} at ${data.time}. Interested?`,
  
  [SmsType.SHIFT_SWAP_APPROVED]: (data: any) =>
    `✅ Shift swap approved! You now have a shift on ${data.date} at ${data.time}`,
  
  [SmsType.TIME_OFF_APPROVED]: (data: any) =>
    `✅ Time off approved: ${data.startDate} to ${data.endDate}. Enjoy!`,
  
  [SmsType.TIME_OFF_DENIED]: (data: any) =>
    `❌ Time off request for ${data.startDate} was denied. Reason: ${data.reason}`,
  
  [SmsType.CALLOUT_COVERAGE]: (data: any) =>
    `🚨 Coverage needed: ${data.role} on ${data.date} at ${data.time}. Can you help?`,
};

class SmsService {
  async send(phoneNumber: string, message: string, userId?: string): Promise<boolean> {
    try {
      // Check quiet hours (10pm - 7am)
      const hour = new Date().getHours();
      if (hour >= 22 || hour < 7) {
        console.log('Skipping SMS - quiet hours');
        return false;
      }

      // Send SMS via Twilio
      const result = await twilioClient.messages.create({
        body: message,
        from: TWILIO_PHONE,
        to: phoneNumber,
      });

      console.log('✅ SMS sent:', result.sid);

      // Log success
      if (userId) {
        await this.logSms(userId, phoneNumber, message, 'SENT');
      }

      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      if (userId) {
        await this.logSms(userId, phoneNumber, message, 'FAILED', String(error));
      }
      return false;
    }
  }

  async sendNotification(userId: string, type: SmsType, data: any): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.phoneNumber || !user.smsEnabled) {
      console.log('User has no phone number or SMS disabled');
      return false;
    }

    const message = SMS_TEMPLATES[type](data);
    return this.send(user.phoneNumber, message, userId);
  }

  private async logSms(
    userId: string,
    phoneNumber: string,
    message: string,
    status: 'SENT' | 'FAILED',
    error?: string
  ): Promise<void> {
    try {
      await prisma.smsLog.create({
        data: {
          userId,
          phoneNumber,
          message,
          status,
          errorMessage: error,
        },
      });
    } catch (err) {
      console.error('Failed to log SMS:', err);
    }
  }
}

export default new SmsService();
