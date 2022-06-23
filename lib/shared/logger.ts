/* eslint no-console: 0 */

export interface ILogger {
  log(message: string): void
  error(message: string, error?: unknown): void
  debug(message: string): void
}

export class DefaultLogger implements ILogger {
  log(message: string): void {
    console.log(message)
  }

  error(message: string, error?: unknown): void {
    console.error(message, error)
  }

  debug(message: string): void {
    console.debug(message)
  }
}
