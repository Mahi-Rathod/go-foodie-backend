import jwt, { Secret } from "jsonwebtoken";
import { ROLE } from "../generated/prisma/enums.js";

interface TokenPayload {
  tokenId: string;
  userId: string;
  role: ROLE;
  username: string;
  mobile: string;
  email: string;
  type?: "access" | "refresh";
}

class TokenService {
  generateToken = async (payload: TokenPayload) => {
    return {
      accessToken: await this.generateAccessToken(payload),
      refreshToken: await this.generateRefreshToken(payload),
    };
  };

  private generateAccessToken = async (payload: TokenPayload) => {
    return jwt.sign(
      { ...payload, type: "access" },
      process.env.ACCESS_TOKEN_SECRET as Secret,
      { expiresIn: "15m" },
    );
  };

  private generateRefreshToken = async (payload: TokenPayload) => {
    return jwt.sign(
      { ...payload, type: "refresh" },
      process.env.REFRESH_TOKEN_SECRET as Secret,
      { expiresIn: "7d" },
    );
  };

  verifyAccessToken = async (token: string): Promise<TokenPayload | null> => {
    return jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as Secret,
    ) as TokenPayload | null;
  };

  verifyRefreshToken = async (token: string): Promise<TokenPayload | null> => {
    return jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as Secret,
    ) as TokenPayload | null;
  };
}

export const tokenService = new TokenService();
