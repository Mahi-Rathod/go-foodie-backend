import bcrypt from "bcrypt";
import { OTP_PURPOSE } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prismaClient.js";

type TransactionClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

class OtpService {
  private OTP_EXPIRY_MINUTES = 10;

  async generateOtp({
    identifier,
    purpose,
    tx,
  }: {
    identifier: string;
    purpose: OTP_PURPOSE;
    tx?: TransactionClient;
  }): Promise<{ otp: string }> {
    const client = tx ?? prisma;

    await client.otpCodes.deleteMany({
      where: { identifier, purpose },
    });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(
      Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000,
    );
    await client.otpCodes.create({
      data: {
        identifier,
        purpose,
        otp_hash: otpHash,
        expiresAt,
      },
    });

    return { otp };
  }

  async verifyOtp({
    identifier,
    purpose,
    otp,
  }: {
    identifier: string;
    purpose: OTP_PURPOSE;
    otp: string;
  }): Promise<boolean> {
    const otpRecord = await prisma.otpCodes.findFirst({
      where: {
        identifier,
        purpose,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) return false;

    const isValid = await bcrypt.compare(otp, otpRecord.otp_hash);

    if (!isValid) return false;

    await prisma.otpCodes.delete({
      where: { id: otpRecord.id },
    });

    return true;
  }

  async cleanupExpiredOtps(): Promise<void> {
    await prisma.otpCodes.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}

export const otpService = new OtpService();
