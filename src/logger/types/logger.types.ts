import { Message } from '../../messages/types/messages.types';

export interface ILogger {
  log: (messages: string[]) => void;
  error: (errorCode: string, ...args: any[]) => void;
  errors: (errors: Message[]) => void;
  explicitError(message): void;
  warn: (warningCode: string, ...args: any[]) => void;
  success: (successCode: string, ...args: any[]) => void;
}