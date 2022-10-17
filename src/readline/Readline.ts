import * as readline from 'readline';
import { stdin as input, stdout as output } from 'node:process';
import { IReadline } from './types/readline.types';
import { readlineValidator, readlineCliOptionsValidator } from './ReadlineValidator';
import { ILogger } from '../logger/types/logger.types';
import { IPromisify } from '../utils/types/promisify.types';
import promisify from '../utils/Promisify';
import logger from '../logger/Logger';
import pleasureCliOptions from '../../pleasure.readline.json';
import storeCLI from '../store-cli/StoreCLI';
import chalk from 'chalk';

class Readline implements IReadline {
	constructor(private logger: ILogger, private promisify: IPromisify) { }

	public async read(): Promise<void> {
		const rl = readline.createInterface({ input, output });
		const questionAsync = await this.promisify.promisifyReadlineQuestion(rl.question.bind(rl));
		await readlineCliOptionsValidator.validate();
		for (const [optionName, { question, defaultValue }] of Object.entries(pleasureCliOptions)) {
			let answer;
			while (true) {
				answer = (await questionAsync(chalk.bold.magenta(`${question} (default: ${defaultValue}): `))) || defaultValue;
				try {
					await readlineValidator.validate(optionName, answer);
					break;
				} catch (e) {
					if (e instanceof Error) {
						this.logger.warn(e.message);
					}
				}
			}
			await storeCLI.push({ optionName, answer });
		}

		rl.close();
	}
}

export default new Readline(logger, promisify);