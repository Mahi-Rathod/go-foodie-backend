import client from "../config/twilio.config.js";
import { env } from "../env.js";

class SMSService {
  async sendOTP(to: string, otp: string) {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: env.TWILIO_PHONE_NUMBER,
      to,
    });
    return message;
  }
}

export const smsService = new SMSService();
