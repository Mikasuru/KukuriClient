export interface Result<T, E = Error> {
    success: boolean;
    data?: T;
    error?: E;
}

export class Utils {
    /**
     * Generate a random delay between min and max
     */
    public static randomDelay(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Sleep for specified duration
     */
    public static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Safe JSON parse with error handling
     */
    public static safeJsonParse<T>(json: string): Result<T> {
        try {
            const data = JSON.parse(json) as T;
            return { success: true, data };
        } catch (error) {
            return { 
                success: false, 
                error: error as Error 
            };
        }
    }

    /**
     * Check if a string is a valid URL
     */
    public static isValidUrl(str: string): boolean {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create a debounced function
     */
    public static debounce<T extends (...args: any[]) => void>(
        func: T,
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Create a throttled function
     */
    public static throttle<T extends (...args: any[]) => void>(
        func: T,
        limit: number
    ): (...args: Parameters<T>) => void {
        let inThrottle: boolean;
        return (...args: Parameters<T>) => {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Chunk an array into smaller arrays
     */
    public static chunk<T>(arr: T[], size: number): T[][] {
        return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
            arr.slice(i * size, i * size + size)
        );
    }

    /**
     * Generate a random string
     */
    public static randomString(length: number): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => 
            chars.charAt(Math.floor(Math.random() * chars.length))
        ).join('');
    }

    /**
     * Safe try-catch wrapper for async functions
     */
    public static async tryCatch<T>(
        fn: () => Promise<T>
    ): Promise<Result<T>> {
        try {
            const data = await fn();
            return { success: true, data };
        } catch (error) {
            return { 
                success: false, 
                error: error as Error 
            };
        }
    }

    /**
     * Format file size
     */
    public static formatFileSize(bytes: number): string {
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    }

    /**
     * Format milliseconds to human readable time
     */
    public static formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const remainingSeconds = seconds % 60;

        const parts: string[] = [];
        if (days > 0) parts.push(`${days}d`);
        if (remainingHours > 0) parts.push(`${remainingHours}h`);
        if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
        if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);

        return parts.join(' ') || '0s';
    }

    /**
     * Clear console screen
     */
    public static clearConsole(): void {
        process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
    }
}