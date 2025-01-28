import Logger from './Logger';

export interface CustomError extends Error {
    code?: string;
    details?: Record<string, any>;
}

export class ErrorHandler {
    private static instance: ErrorHandler;

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }   

    public handleError(error: Error | CustomError, context?: string): void {
        const errorCode = (error as CustomError).code || 'UNKNOWN_ERROR';
        const errorDetails = (error as CustomError).details || {};
        
        // Log error with context
        Logger.error(`[${errorCode}] ${context ? `[${context}] ` : ''}${error.message}`);
        
        if (Object.keys(errorDetails).length > 0) {
            Logger.error(`Error Details: ${JSON.stringify(errorDetails, null, 2)}`);
        }

        if (error.stack) {
            Logger.error(`Stack Trace: ${error.stack}`);
        }
    }

    public createError(
        message: string,
        code: string = 'UNKNOWN_ERROR',
        details?: Record<string, any>
    ): CustomError {
        const error = new Error(message) as CustomError;
        error.code = code;
        if (details) {
            error.details = details;
        }
        return error;
    }

    public async tryCatch<T>(
        fn: () => Promise<T>,
        context?: string
    ): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            this.handleError(error as Error, context);
            throw error;
        }
    }

    public isOperationalError(error: Error): boolean {
        const nonOperationalErrors = [
            'TypeError',
            'ReferenceError',
            'SyntaxError'
        ];
        return !nonOperationalErrors.includes(error.constructor.name);
    }
}

// Custom Error Classes
export class CommandError extends Error implements CustomError {
    public code: string;
    public details?: Record<string, any>;

    constructor(message: string, code: string = 'COMMAND_ERROR', details?: Record<string, any>) {
        super(message);
        this.name = 'CommandError';
        this.code = code;
        this.details = details;
    }
}

export class ValidationError extends Error implements CustomError {
    public code: string;
    public details?: Record<string, any>;

    constructor(message: string, code: string = 'VALIDATION_ERROR', details?: Record<string, any>) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
        this.details = details;
    }
}

export class NetworkError extends Error implements CustomError {
    public code: string;
    public details?: Record<string, any>;

    constructor(message: string, code: string = 'NETWORK_ERROR', details?: Record<string, any>) {
        super(message);
        this.name = 'NetworkError';
        this.code = code;
        this.details = details;
    }
}

export default ErrorHandler;