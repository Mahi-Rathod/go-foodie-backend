import { v4 as uuidv4 } from "uuid";
import { User } from "../../generated/prisma/browser.js";
import { OTP_PURPOSE, ROLE } from "../../generated/prisma/enums.js";
import { UserCreateInput } from "../../generated/prisma/models.js";
import { prisma } from "../../lib/prismaClient.js";
import { otpService } from "../../services/otp.service.js";
import { smsService } from "../../services/sms.service.js";
import { tokenService } from "../../services/token.service.js";
import { AppError } from "../../utils/app.error.js";
import { comparePassword, hashPassword } from "./auth.utils.js";

export const registerUserService = async (
  data: UserCreateInput,
): Promise<{ user: Omit<User, "password"> }> => {
  const { username, email, mobile, name, password, role } = data;
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }, { mobile }],
    },
  });

  if (existingUser) {
    throw new AppError(
      "User already exists with this username, email or mobile",
      409,
    );
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      name,
      email,
      mobile,
      password: hashedPassword,
      role: role ?? ROLE.USER,
    },
  });

  if (!user) {
    throw new AppError("Failed to create user", 500);
  }

  const otpCode = await otpService.generateOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.REGISTER,
  });

  await smsService.sendOTP(mobile, otpCode.otp);

  return { user };
};

export const verifyUserService = async ({
  otp,
  identifier,
  purpose,
}: {
  otp: string;
  identifier: string;
  purpose: OTP_PURPOSE;
}) => {
  const isValid = await otpService.verifyOtp({
    identifier,
    purpose,
    otp,
  });
  if (!isValid) {
    throw new AppError("Invalid OTP", 400);
  }

  const user = await prisma.user.update({
    where: {
      mobile: identifier,
    },
    data: {
      isVerified: true,
    },
  });

  return { user: user as Omit<User, "password"> };
};

export const loginUserByPasswordService = async ({
  identifier,
  password,
  ip,
  userAgent,
}: {
  identifier: string;
  password: string;
  ip: string;
  userAgent: string;
}) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { mobile: identifier }],
    },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new AppError("Invalid password", 401);
  }

  const tokenId = uuidv4();
  const { refreshToken, accessToken } = await tokenService.generateToken({
    tokenId,
    userId: user.id,
    role: user.role,
    username: user.username,
    mobile: user.mobile,
    email: user.email,
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenId,
      refreshToken,
      userAgent,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  if (!session) {
    throw new AppError("Failed to create session", 500);
  }

  return { user: user as Omit<User, "password">, accessToken, refreshToken };
};

export const loginUserByOtpService = async ({
  mobile,
  otp,
  ip,
  userAgent,
}: {
  mobile: string;
  otp: string;
  ip: string;
  userAgent: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      mobile,
    },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  const isValid = await otpService.verifyOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.LOGIN,
    otp,
  });
  if (!isValid) {
    throw new AppError("Invalid OTP", 401);
  }

  const tokenId = uuidv4();

  const { refreshToken, accessToken } = await tokenService.generateToken({
    tokenId,
    userId: user.id,
    role: user.role,
    username: user.username,
    mobile: user.mobile,
    email: user.email,
  });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenId,
      refreshToken,
      userAgent,
      ipAddress: ip,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return {
    user: user as Omit<User, "password">,
    accessToken,
    refreshToken,
  };
};

export const logoutService = async (refreshToken: string) => {
  const payload = await tokenService.verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new AppError("Invalid refresh token", 401);
  }

  const session = await prisma.session.findUnique({
    where: { tokenId: payload?.tokenId as string },
  });

  if (!session) {
    throw new AppError("Session not found or already logged out", 404);
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { tokenId: payload?.tokenId as string },
    });
    throw new AppError("Session expired", 401);
  }

  await prisma.session.delete({
    where: { tokenId: payload?.tokenId as string },
  });

  return { message: "Logged out successfully" };
};

export const refreshTokenService = async ({
  refreshToken,
  ip,
  userAgent,
}: {
  refreshToken: string;
  ip: string;
  userAgent: string;
}) => {
  const payload = await tokenService.verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new AppError("Invalid refresh token", 401);
  }

  const session = await prisma.session.findUnique({
    where: { tokenId: payload.tokenId },
  });

  if (!session) {
    throw new AppError("Invalid session", 401);
  }

  const isMatch = refreshToken === session.refreshToken;

  if (!isMatch) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { tokenId: payload.tokenId },
    });
    throw new AppError("Session expired", 401);
  }

  // delete old session
  await prisma.session.delete({
    where: { tokenId: payload.tokenId },
  });

  const tokenId = uuidv4();

  const { accessToken, refreshToken: newRefreshToken } =
    await tokenService.generateToken({
      tokenId,
      userId: payload.userId,
      role: payload.role,
      username: payload.username,
      mobile: payload.mobile,
      email: payload.email,
    });

  await prisma.session.create({
    data: {
      userId: payload.userId,
      tokenId,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent,
      ipAddress: ip,
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const logoutAllService = async (refreshToken: string) => {
  const paylod = await tokenService.verifyRefreshToken(refreshToken);
  if (!paylod) {
    throw new AppError("Invalid refresh token", 401);
  }
  await prisma.session.deleteMany({
    where: {
      userId: paylod.userId,
    },
  });
  return { message: "Logged out from all devices successfully" };
};

export const sendForgotPasswordOtpService = async ({
  mobile,
}: {
  mobile: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      mobile,
    },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (!user.isVerified) {
    throw new AppError("User is not verified", 400);
  }
  const { otp } = await otpService.generateOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.RESET_PASSWORD,
  });

  await smsService.sendOTP(mobile, otp);
  return { message: "OTP sent successfully" };
};

export const resetForgotPasswordService = async ({
  mobile,
  otp,
  newPassword,
}: {
  mobile: string;
  otp: string;
  newPassword: string;
}) => {
  const user = await prisma.user.findUnique({
    where: {
      mobile,
    },
  });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (!user.isVerified) {
    throw new AppError("User is not verified", 400);
  }

  const isValid = await otpService.verifyOtp({
    identifier: mobile,
    purpose: OTP_PURPOSE.RESET_PASSWORD,
    otp,
  });

  if (!isValid) {
    throw new AppError("Invalid OTP", 400);
  }
  const hashedPassword = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password reset successfully" };
};
