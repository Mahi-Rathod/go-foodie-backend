import cors, { CorsOptions } from "cors";
import { env } from "../env.js";

const allowlist = new Set<string>(env.CORS_ORIGINS);

const options: CorsOptions = {
  origin(origin, callback) {
    if (origin === undefined) {
      callback(null, true);
      return;
    }

    callback(null, allowlist.has(origin));
  },

  credentials: true,

  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
};

export const corsMiddleware = cors(options);
