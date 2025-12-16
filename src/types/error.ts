export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'STORAGE_ERROR'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'UNKNOWN_ERROR';

export class AppError extends Error {
    code: ErrorCode;
    details?: any;

    constructor(message: string, code: ErrorCode = 'UNKNOWN_ERROR', details?: any) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
    }
}
