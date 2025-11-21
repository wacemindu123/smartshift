import twilio from 'twilio';
import * as dotenv from 'dotenv';

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

async function testSms() {
  try {
    console.log('Sending test SMS...');
    
    const result = await twilioClient.messages.create({
      body: '🎉 ShiftSmart SMS is working! You will receive shift notifications here.',
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: '+19048913477',
    });

    console.log('✅ SMS sent successfully!');
    console.log('Message SID:', result.sid);
  } catch (error) {
    console.error('❌ SMS failed:', error);
  }
}

testSms();
