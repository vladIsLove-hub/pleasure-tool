export interface ILogger {
  log: (messages: string[]) => void;
  error: (e: Error | string) => Error;
  warn: (warning: string) => void;
  wrongFormatError: (key: string, message: string) => void;
}