import dotenv from "dotenv";
import app from "./app.js";
import { prisma } from "./lib/prismaClient.js";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

const isDev = process.env.NODE_ENV === "development";

async function main() {
  try {
    await prisma.$connect();
    console.log("✓ Database connected");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✓ Server running on :${PORT}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log("\n⏳ Shutting down gracefully...");
      server.close(async () => {
        await prisma.$disconnect();
        console.log("✓ Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Startup failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
