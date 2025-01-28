import fs from 'fs';
import path from 'path';

export interface LoggerOptions {
    saveToFile?: boolean;
}

export class Logger {
  private static instance: Logger;
  private logFile: string | null = null;
  private readonly savingLogs: boolean;
  private readonly logDir: string;
  private readonly colors: Record<string, string>;

  private constructor(options: LoggerOptions = {}) {
    this.savingLogs = options.saveToFile ?? true;
    this.logDir = path.join(process.cwd(), 'logs');
    
    this.colors = {
      reset: '\x1b[0m',
      cyan: '\x1b[36m',    // INFO
      yellow: '\x1b[33m',  // WARNING  
      red: '\x1b[31m',     // ERROR
      green: '\x1b[32m',   // DEBUG
      magenta: '\x1b[35m'  // LOAD
    };

    if (this.savingLogs) {
      this.initializeLogFile();
    }
  }

  public static getInstance(options?: LoggerOptions): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(options);
    }
    return Logger.instance;
  }

  private initializeLogFile(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const now = new Date();
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.logFile = path.join(
      this.logDir,
      `Log_${now.getDate()}-${months[now.getMonth()]}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}.kukuri`
    );
  }

  private async log(level: string, message: string): Promise<void> {
    const timeStr = new Date().toLocaleTimeString();
    const color = {
      'INFO': this.colors.cyan,
      'WARNING': this.colors.yellow,
      'ERROR': this.colors.red,
      'DEBUG': this.colors.green,
      'LOAD': this.colors.magenta
    }[level] || this.colors.reset;

    console.log(`${color}[${level}]${this.colors.reset} (${timeStr}): ${message}`);

    if (this.savingLogs && this.logFile) {
      const logEntry = `[${timeStr}] [${level}] ${message}\n`;
      try {
        fs.appendFileSync(this.logFile, logEntry);
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  public static info(message: string): void {
    Logger.getInstance().log('INFO', message);
  }

  public static warning(message: string): void {
    Logger.getInstance().log('WARNING', message);
  }

  public static error(message: string): void {
    Logger.getInstance().log('ERROR', message);
  }

  public static debug(message: string): void {
    Logger.getInstance().log('DEBUG', message);
  }

  public static load(message: string): void {
    Logger.getInstance().log('LOAD', message);
  }
}

export default Logger;