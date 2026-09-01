import jwt, { Secret } from "jsonwebtoken";
import { env } from "../env.js";
import { UnauthorizedError } from "../errors/app-error.js";
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
      env.JWT_ACCESS_SECRET as Secret,
      { expiresIn: "15m" },
    );
  };

  private generateRefreshToken = async (payload: TokenPayload) => {
    return jwt.sign(
      { ...payload, type: "refresh" },
      env.JWT_REFRESH_SECRET as Secret,
      { expiresIn: "7d" },
    );
  };

  verifyAccessToken = async (token: string): Promise<TokenPayload> => {
    try {
      const decoded = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET as Secret,
      ) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired access token");
    }
  };

  verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
    try {
      const decoded = jwt.verify(
        token,
        env.JWT_REFRESH_SECRET as Secret,
      ) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  };
}

export const tokenService = new TokenService();
