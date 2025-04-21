/**
 * Creates a Promise-based delay.
 * @param ms Duration in milliseconds.
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random integer within the range [min, max] (inclusive).
 * @param min Minimum value.
 * @param max Maximum value.
 * @returns A random integer.
 */
export function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random element from an array.
 * @param array The array to pick from.
 * @returns A random element from the array, or undefined if the array is empty.
 */
export function getRandomElement<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Truncates text to a maximum length, adding '...' if it exceeds the limit.
 * @param text The input text.
 * @param maxLength Maximum length allowed.
 * @returns The truncated text.
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.slice(0, maxLength - 3) + "...";
}

/**
 * Parses an integer from a string argument, optionally validating range.
 * @param arg The string argument to parse.
 * @param min Optional minimum allowed value (inclusive).
 * @param max Optional maximum allowed value (inclusive).
 * @returns The parsed integer, or null if parsing fails or value is out of range.
 */
export function ParseIntArg(arg: string | undefined, min?: number, max?: number): number | null {
    if (arg === undefined) return null;
    const num = parseInt(arg);
    if (isNaN(num)) return null;
    if (min !== undefined && num < min) return null;
    if (max !== undefined && num > max) return null;
    return num;
}
