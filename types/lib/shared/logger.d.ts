export declare class DefaultLogger {
    log(message: string): void;
    error(message: string, error?: unknown): void;
    debug(message: string): void;
}
export interface ILogger {
    log(message: string): void;
    error(message: string, error?: unknown): void;
    debug(message: string): void;
}
