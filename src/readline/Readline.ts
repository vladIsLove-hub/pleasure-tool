import * as readline from 'readline';
import { stdin as input, stdout as output } from 'node:process';
import { IReadline } from './types/readline.types';
import { IStoreCLI } from '../store-cli/types/storeCLI.types';
import defaultCliOptions from '../../default.cli-options.json';
import storeCLI from '../store-cli/StoreCLI';
import chalk from 'chalk';
import { IReadlineCLIOptionsValidator, IReadlineValidator } from './types/readlineValidator.types';
import { rlValidator, rlCliOptionsValidator } from './ReadlineValidator';
import { ILogger } from '../logger/types/logger.types';
import logger from '../logger/Logger';
import { IPromisify } from '../utils/types/promisify.types';
import promisify from '../utils/Promisify';

class Readline implements IReadline {
    constructor(
        private storeCLI: IStoreCLI,
        private rlValidator: IReadlineValidator,
        private rlCliOptionsValidator: IReadlineCLIOptionsValidator,
        private logger: ILogger,
        private promisify: IPromisify,
    ) { };

    public async read(): Promise<void> {
        const rl = readline.createInterface({ input, output });
        const questionAsync = await this.promisify.promisifyReadlineQuestion(rl.question.bind(rl));
        await this.rlCliOptionsValidator.validateCLIOptions();
        for (const [optionName, { question, defaultValue }] of Object.entries(defaultCliOptions)) {
            let answer;
            while (true) {
                answer = (await questionAsync(chalk.bold.magenta(`${question} (default: ${defaultValue}): `))) || defaultValue;
                try {
                    await this.rlValidator.validate(optionName, answer);
                    break;
                } catch (e) {
                    if (e instanceof Error) {
                        this.logger.warn(e.message);
                    }
                }

            }
            await this.storeCLI.push({ optionName, answer });
        }

        rl.close();
    }
}

export default new Readline(storeCLI, rlValidator, rlCliOptionsValidator, logger, promisify);