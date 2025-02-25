import { execSync } from "child_process";

function Start() {
  console.log("Starting Kukuri Client...");
  try {
    execSync("bun run start", { stdio: "inherit" });
    console.log("Kukuri Client started successfully.");
  } catch {
    console.log("Failed to start Kukuri Client.");
    process.exit(1);
  }
}

Start();
