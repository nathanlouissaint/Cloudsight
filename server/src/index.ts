import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { prisma } from "./config/prisma";

const PORT =
  Number(process.env.PORT) || 5000;

const server =
  app.listen(PORT, () => {
    console.log(
      `CloudSight API running on port ${PORT}`
    );
  });

async function shutdown(
  signal: string
) {
  console.log(
    `Received ${signal}. Shutting down...`
  );

  server.close(async () => {
    await prisma.$disconnect();

    console.log(
      "Shutdown complete."
    );

    process.exit(0);
  });
}

process.on(
  "SIGINT",
  () => void shutdown("SIGINT")
);

process.on(
  "SIGTERM",
  () => void shutdown("SIGTERM")
);
