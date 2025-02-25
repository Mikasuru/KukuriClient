import { execSync } from "child_process";
import { existsSync, writeFileSync } from "fs";

function Install() {
  console.log("Installing project dependencies...");
  try {
    execSync("bun install", { stdio: "inherit" });
    console.log("Dependencies installed successfully.");
  } catch {
    console.log("Failed to install dependencies.");
    process.exit(1);
  }
}

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

function Setup() {
  console.log("Starting setup process...");

  if (!existsSync("./config/tokens.json")) {
    writeFileSync("./config/tokens.json", JSON.stringify({}));
    console.log("Created empty tokens.json");
  }
  Install();
  Start();
}

Setup();
