import { build } from "esbuild";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";

const buildOptions = {
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  outdir: "dist",
  sourcemap: true,
  external: [
    "mongoose",
    "express",
    "cors",
    "helmet",
    "morgan",
    "compression",
    "express-rate-limit",
    "dotenv",
    "bcryptjs",
    "jsonwebtoken",
    "nodemailer",
    "uuid",
  ],
  define: {
    "process.env.NODE_ENV": '"production"',
  },
  banner: {
    js: "// MoodLift User Service - Built for production",
  },
};

async function buildProject() {
  try {
    console.log("🏗️  Building user-service...");

    // Ensure dist directory exists
    if (!existsSync("dist")) {
      mkdirSync("dist", { recursive: true });
    }

    // Build with esbuild
    await build(buildOptions);

    // Copy package.json for production (with only runtime dependencies)
    const packageJson = {
      name: "user-service",
      version: "1.0.0",
      type: "module",
      main: "index.js",
      scripts: {
        start: "node index.js",
      },
      dependencies: {
        bcryptjs: "^3.0.2",
        compression: "^1.8.1",
        cors: "^2.8.5",
        dotenv: "^17.2.1",
        express: "^4.21.1",
        "express-rate-limit": "^8.0.1",
        helmet: "^8.1.0",
        jsonwebtoken: "^9.0.2",
        mongoose: "^8.6.1",
        morgan: "^1.10.1",
        nodemailer: "^6.9.15",
        uuid: "^11.1.0",
      },
    };

    await import("fs").then((fs) => {
      fs.writeFileSync(
        "dist/package.json",
        JSON.stringify(packageJson, null, 2)
      );
    });

    console.log("✅ Build completed successfully!");
    console.log("📁 Output: dist/index.js");
    console.log("🚀 Run with: npm start");
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

buildProject();
