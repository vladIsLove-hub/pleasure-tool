import { ILogger } from "./types/logger.types";
import chalk from 'chalk';
import util from "node:util";
import { Message } from "../messages/types/messages.types";

class Logger implements ILogger {
	public log(messages: string[]): void {
		console.log(...messages);
	}

	public error(errorMessage: string, ...args: any[]): void {
		const resultMessage = this.formatArgs(errorMessage, ...args);
		const indentedMessages = this.getIndentedMessages(chalk.bold.red("ERROR: "), `${resultMessage}`);
		console.log(...indentedMessages);
	}

	public errors(errors: Message[]): void {
		console.log(this.getErrorsSummary(errors));
		for (let i = 0; i < errors.length; i++) {
			const error = errors[i];
			const resultMessage = `(${chalk.bold.red(i+1)}) ${this.formatArgs(error.text, ...error.args)}`;
			console.log(resultMessage);
		}
	}

	public explicitError(error: Error): void {
		const resultMessage = `${chalk.bold.red(error.name)}: ${error.message}`;
		console.log(resultMessage);
	}

	public warn(warningMessage: string, ...args: any[]): void {
		const resultMessage = this.formatArgs(warningMessage, ...args);
		const indentedMessages = this.getIndentedMessages(chalk.bold.yellow('WARNING: '), resultMessage);
		console.log(...indentedMessages);
	}

	public success(successMessage: string, ...args: any[]): void {
		const resultMessage = this.formatArgs(successMessage, ...args);
		console.log(chalk.bold.green('SUCCESS: '), resultMessage);
	}

	private formatArgs(message: string, ...args: any[]): string {
		return util.format(message, ...args.map(arg => chalk.underline.yellow(String(arg))));
	}

	private getIndentedMessages(...messages: string[]): string[] {
		return ["\n", ...messages, "\n"];
	}

	private getErrorsSummary(errors: any[]) : string {
		return `${chalk.bold.red("Errors summary")} - found ${errors.length} errors:`;
	}
}

export default new Logger();