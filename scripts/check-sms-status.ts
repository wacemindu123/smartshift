import twilio from 'twilio';
import * as dotenv from 'dotenv';

dotenv.config();

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

async function checkStatus() {
  try {
    console.log('Fetching recent messages...\n');
    
    const messages = await twilioClient.messages.list({ limit: 5 });
    
    messages.forEach((msg) => {
      console.log('---');
      console.log('To:', msg.to);
      console.log('From:', msg.from);
      console.log('Status:', msg.status);
      console.log('Error:', msg.errorCode, msg.errorMessage);
      console.log('Body:', msg.body.substring(0, 50));
      console.log('Date:', msg.dateCreated);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

checkStatus();
