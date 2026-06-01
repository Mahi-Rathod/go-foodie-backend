import client from "../config/twilio.config.js";

class SMSService {
  async sendOTP(to: string, otp: string) {
    try {
      const message = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER as string,
        to,
      });
      return message;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to send OTP");
    }
  }
}

export const smsService = new SMSService();
