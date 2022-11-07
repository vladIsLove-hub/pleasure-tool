import chalk from 'chalk';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';

import pleasureCliOptions from '../../pleasure.readline.json';
import logger from '../logger/logger';
import { ILogger } from '../logger/types/logger.types';
import storeCLI from '../store-cli/store-cli';
import promisify from '../utils/promisify';
import { IPromisify } from '../utils/types/promisify.types';
import { readlineValidator, readlineCliOptionsValidator } from './readline-validator';
import { IReadline } from './types/readline.types';


class Readline implements IReadline {
	constructor(private logger: ILogger, private promisify: IPromisify) { }

	public async read(): Promise<void> {
		const rl = readline.createInterface({ input, output });
		const questionAsync = await this.promisify.promisifyReadlineQuestion(rl.question.bind(rl));
		await readlineCliOptionsValidator.validate();
		for (const [optionName, { question, defaultValue }] of Object.entries(pleasureCliOptions)) {
			let answer;
			while (true) {
				const supportedValuesTip = this.getSupportedValuesTip(optionName);
				answer = (await questionAsync(chalk.bold.magenta(`${question} (${supportedValuesTip}; default value: ${defaultValue}): `))) || defaultValue;
				try {
					await readlineValidator.validate(optionName, answer);
					break;
				} catch (e) {
					continue;
				}
			}
			await storeCLI.push({ optionName, answer });
		}

		rl.close();
	}

	private getSupportedValuesTip(optionName: string): string {
		const cliOption = pleasureCliOptions[optionName];
		const { constraints } = cliOption;
		return cliOption.type === 'number'
			? `supported values: ${constraints.format.join(', ')}`
			: `supported length from ${constraints.min} to ${constraints.max}`;
	}
}

export default new Readline(logger, promisify);