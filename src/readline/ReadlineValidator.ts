import { IReadlineCLIOptionsValidator, IReadlineValidator } from "./types/readlineValidator.types";
import defaultCliOptions from '../../default.cli-options.json';
import { ILogger } from "../logger/types/logger.types";
import logger from '../logger/Logger';

class ReadlineValidator implements IReadlineValidator {
    constructor(protected logger: ILogger) { };

    public async validate(optionName: string, answer: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const { type, constraints } = defaultCliOptions[optionName];
            const serialize = await this.getSerializeFunc(type);
            let serializedAnswer = serialize(answer);

            switch (type) {
                case 'number':
                    {
                        const { min, max } = constraints;
                        serializedAnswer = Number(serializedAnswer);
                        if (Number.isNaN(serializedAnswer)) {
                            reject(new Error(`${optionName} value must be numeric`));
                        }
                        if (serializedAnswer > max || serializedAnswer < min)
                            reject(new RangeError(`${optionName} value must be in range from ${min} to ${max}`));
                        resolve();
                        break;
                    }
                case 'string':
                    {
                        const { min, max } = constraints;
                        serializedAnswer = String(serializedAnswer);
                        if (serializedAnswer.length > max || serializedAnswer.length < min)
                            reject(new RangeError(`${optionName} length must be in range from ${min} to ${max}`));
                        resolve();
                        break;
                    }
            }
        })
    }

    private async getSerializeFunc(type: string): Promise<(arg: string) => string | number> {
        const serializeFuncs = {
            string: (s: string) => s.toString(),
            number: (n: string) => parseInt(n),
        }

        return serializeFuncs[type];
    }
}

class ReadlineCLIJSONValidator extends ReadlineValidator implements IReadlineCLIOptionsValidator {
    static requiredParameters = ['question', 'defaultValue', 'constraints', 'type']
    public async validateCLIOptions(): Promise<void> {
        for (const cliOption of Object.values(defaultCliOptions)) {
            for (const parameterName of ReadlineCLIJSONValidator.requiredParameters) {
                if (!(parameterName in cliOption))
                    this.logger.error(`<${parameterName}> parameter was not provided in the default.cli-options.json`);
            }
            const { constraints: { min, max } } = cliOption;
            if (min === undefined || max === undefined)
                this.logger.error('<constraints: min or max> parameter was not provided in the default.cli-options.json');
            if (typeof min !== 'number' || typeof max !== 'number')
                this.logger.error('<constraints: min or max> parameter must be a type number');
        }
    }
}

const rlValidator = new ReadlineValidator(logger);
const rlCliOptionsValidator = new ReadlineCLIJSONValidator(logger);

export { rlValidator, rlCliOptionsValidator };