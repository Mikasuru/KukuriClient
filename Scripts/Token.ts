import { execSync } from "child_process";
import { platform } from "os";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function isWindows(): boolean {
  return platform() === "win32";
}

function commandExists(command: string): boolean {
  try {
    execSync(isWindows() ? `where ${command}` : `command -v ${command}`, {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function addManualToken() {
  const name = await askQuestion("Enter bot name: ");
  const prefix = await askQuestion("Enter prefix: ");
  const token = await askQuestion("Enter token: ");
  const allowUsersInput = await askQuestion(
    'Enter allowed users (comma-separated) or "all": ',
  );
  const allowEveryoneInput = await askQuestion("Allow everyone? (yes/no): ");

  const allowUsers =
    allowUsersInput === "all"
      ? "all"
      : allowUsersInput.split(",").map((u) => u.trim());
  const allowEveryone = allowEveryoneInput.toLowerCase() === "yes";

  const config = existsSync("./config/tokens.json")
    ? JSON.parse(readFileSync("./config/tokens.json", "utf8"))
    : {};

  config[name] = { prefix, token, allowUsers, allowEveryone };
  writeFileSync("./config/tokens.json", JSON.stringify(config, null, 2));

  console.log(`Token for ${name} added successfully.`);
}

async function addQRCodeToken() {
  if (!commandExists("bun")) {
    console.log("Bun is not installed. Please install Bun manually.");
    process.exit(1);
  }

  try {
    const { Client } = await import("discord.js-selfbot-v13");
    const client = new Client();

    client.on("qrCode", (qrCode) => {
      console.log("Please scan this QR code with your Discord mobile app:");
      console.log(qrCode);
    });

    client.on("ready", async () => {
      const token = client.token;
      const name = await askQuestion("Enter bot name for this token: ");
      const prefix = await askQuestion("Enter prefix: ");
      const allowUsersInput = await askQuestion(
        'Enter allowed users (comma-separated) or "all": ',
      );
      const allowEveryoneInput = await askQuestion(
        "Allow everyone? (yes/no): ",
      );

      const allowUsers =
        allowUsersInput === "all"
          ? "all"
          : allowUsersInput.split(",").map((u) => u.trim());
      const allowEveryone = allowEveryoneInput.toLowerCase() === "yes";

      const config = existsSync("./config/tokens.json")
        ? JSON.parse(readFileSync("./config/tokens.json", "utf8"))
        : {};

      config[name] = { prefix, token, allowUsers, allowEveryone };
      writeFileSync("./config/tokens.json", JSON.stringify(config, null, 2));

      console.log(`Token for ${name} added successfully via QR code.`);
      client.destroy();
      rl.close();
      process.exit(0);
    });

    // ใช้ QRLogin แทน login
    await client.QRLogin();
  } catch (error) {
    console.log("Failed to generate QR code:", error.message);
    process.exit(1);
  }
}

async function manageTokens() {
  if (!commandExists("bun")) {
    console.log("Bun is not installed. Please install Bun manually.");
    process.exit(1);
  }

  const addToken = await askQuestion("Do you want to add a token? (yes/no): ");
  if (addToken.toLowerCase() !== "yes") {
    console.log("No token added. Exiting...");
    rl.close();
    return;
  }

  const method = await askQuestion("Choose method (1 = Manual, 2 = QR Code): ");
  if (method === "1") {
    await addManualToken();
  } else if (method === "2") {
    await addQRCodeToken();
  } else {
    console.log("Invalid method selected. Exiting...");
  }

  rl.close();
}

manageTokens();
