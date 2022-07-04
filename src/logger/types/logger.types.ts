export interface ILogger {
  log: (messages: string[]) => void;
  error: (e: Error | string) => void;
  warn: (warning: string) => void;
}