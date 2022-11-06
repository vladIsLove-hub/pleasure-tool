import { IReadlineCLIOptionsValidator, IReadlineValidator } from "./types/readlineValidator.types";
import pleasureCliOptions from '../../pleasure.readline.json';
import { ILogger } from "../logger/types/logger.types";
import logger from '../logger/Logger';
import { errors } from '../messages';

class ReadlineValidator implements IReadlineValidator {
	constructor(protected logger: ILogger) { }

	public async validate(optionName: string, answer: string): Promise<void> {
		return new Promise(async (resolve, reject) => {
			const { type, constraints } = pleasureCliOptions[optionName];
			const serialize = await this.getSerializeFunction(type);
			let serializedAnswer = serialize(answer);

			switch (type) {
				case 'number':
				{
					const { format } = constraints;
					serializedAnswer = Number(serializedAnswer);
					if (Number.isNaN(serializedAnswer)) {
						this.logger.error(errors.ValueInvalidType, optionName, "number");
						reject();
						return;
					}
					const isCorrectFormat = format.find((value: number | string) => value === serializedAnswer);
					if (isCorrectFormat === undefined) {
						this.logger.error(errors.ValueNotInSupportedValues, optionName, format.join(' | '));
						reject();
						return;
					}
					resolve();
					return;
				}
				case 'string':
				{
					const { min, max } = constraints;
					serializedAnswer = String(serializedAnswer);
					if (serializedAnswer.length > max || serializedAnswer.length < min) {
						this.logger.error(errors.ValueLengthOutOfRange, optionName, min, max);
						reject();
						return;
					}
					resolve();
					return;
				}
			}
		})
	}

	private async getSerializeFunction(type: string): Promise<(arg: string) => string | number> {
		const serializeFuncs = {
			string: (s: string) => s.toString(),
			number: (n: string) => parseFloat(n),
		}

		return serializeFuncs[type];
	}
}

class ReadlineCLIJSONValidator extends ReadlineValidator implements IReadlineCLIOptionsValidator {
	static readlineConfigFileName = "pleasure.readline.json"; 
	static requiredParameters = ['question', 'defaultValue', 'constraints', 'type'];
	public async validate(): Promise<void> {
		for (const cliOption of Object.values(pleasureCliOptions)) {
			for (const parameterName of ReadlineCLIJSONValidator.requiredParameters) {
				if (!(parameterName in cliOption)) {
					this.logger.error(errors.FieldNotSpecified, parameterName, ReadlineCLIJSONValidator.readlineConfigFileName);
					process.exit();
				}
			}

			const { type } = cliOption;
			const { min, max, format } = JSON.parse(JSON.stringify(cliOption.constraints));

			if (type === undefined) {
				this.logger.error(errors.FieldNotSpecified, "type", ReadlineCLIJSONValidator.readlineConfigFileName);
				process.exit();
			}

			if (type === "string") {
				if (min === undefined) {
					this.logger.error(errors.FieldNotSpecified, "constraints.min", ReadlineCLIJSONValidator.readlineConfigFileName);
					process.exit();
				}

				if (max === undefined) {
					this.logger.error(errors.FieldNotSpecified, "contraints.max", ReadlineCLIJSONValidator.readlineConfigFileName);
					process.exit();
				}

				if (typeof min !== 'number') {
					this.logger.error(errors.FieldValueInvalidType, "constraints.min", "number", ReadlineCLIJSONValidator.readlineConfigFileName);
					process.exit();
				}
				
				if (typeof max !== 'number') {
					this.logger.error(errors.FieldValueInvalidType, "constraints.max", "number", ReadlineCLIJSONValidator.readlineConfigFileName);
					process.exit();
				}
			} 

			if (type === "number") {
				if (!Array.isArray(format)) {
					this.logger.error(errors.FieldValueInvalidType, "constraints.format", `${cliOption.type} array`, ReadlineCLIJSONValidator.readlineConfigFileName);
					process.exit();
				}

				for (const item of format) {
					if (typeof item !== cliOption.type) {
						this.logger.error(errors.FieldValueInvalidType, "constraints.format", `${cliOption.type} array`, ReadlineCLIJSONValidator.readlineConfigFileName)
						process.exit();
					}
				}
			}
		}
	}
}

const readlineValidator = new ReadlineValidator(logger);
const readlineCliOptionsValidator = new ReadlineCLIJSONValidator(logger);

export { readlineValidator, readlineCliOptionsValidator };