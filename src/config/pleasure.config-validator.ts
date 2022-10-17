import chalk from "chalk";
import logger from "../logger/Logger";
import { ILogger } from "../logger/types/logger.types";
import { PleasureConfig, IPleasureConfigValidator } from "./types/pleasure.config.types";

class PleasureConfigValidator implements IPleasureConfigValidator {
	constructor(private logger: ILogger) {
		this.logger = logger;
	}

	private isNumber(value: any): boolean {
		return typeof value === 'number';
	}

	private isNotNegative(number: number): boolean {
		return number >= 0;
	}

	public validate(config: PleasureConfig): void {
		const { projectTypes, times } = config;

		if (!projectTypes || Array.isArray(projectTypes) || Object.keys(projectTypes).length === 0)
			this.logger.error(`Wrong <pleasure.config.json> config format. Read README.md`);


		const uniqueKeywords: { uniqueKey: string; keywords: string[] }[] = [];
		for (const key in projectTypes) {
			const typeInfo = projectTypes[key];
			if (!('max' in typeInfo) || !('keywords' in typeInfo))
				this.logger.error(`Wrong <pleasure.config.json> config format, for project type: ${key}. Read README.md`);

			if (!this.isNumber(typeInfo['max']))
				this.logger.wrongFormatError(key, `Value of 'max' field must be of a number type! \n`);

			if (!this.isNotNegative(typeInfo['max']))
				this.logger.wrongFormatError(key, `Value of 'max' field must not be negative! \n`);

			if (!Array.isArray(typeInfo['keywords']))
				this.logger.wrongFormatError(key, `'keywords' field value must be array of strings!`);

			for (const keyWord of typeInfo['keywords']) {
				if (typeof keyWord !== 'string')
					this.logger.wrongFormatError(key, `'keywords' field value must be array of strings!`);

				if (!keyWord)
					this.logger.wrongFormatError(key, `'keywords' field value must be array of not empty strings!`);
			}

			const hash = {};
			for (const keyword of projectTypes[key].keywords) {
				const keywordLowerCase = keyword.toLowerCase();
				hash[keywordLowerCase] = hash[keywordLowerCase] + 1 || 1;
				if (hash[keywordLowerCase] > 1)
					this.logger.warn(`Duplicate keyword: "${chalk.underline(keyword)}" was found for the following project type: ${chalk.underline(key)}`);
			}

			for (const { uniqueKey, keywords } of uniqueKeywords) {
				projectTypes[key].keywords.forEach((keyword: string) => {
					if (keywords.includes(keyword.toLowerCase()))
						this.logger.error(`Duplicate keyword: "${chalk.underline(keyword)}" was found for the following project types: ${chalk.underline(uniqueKey)} and ${chalk.underline(key)}`);
				});
			}

			uniqueKeywords.push({
				uniqueKey: key,
				keywords: projectTypes[key].keywords.map((keyword: string) => keyword.toLowerCase()),
			});
		}

		if (!times)
			this.logger.error(`<times: {...}> field must be specified in the pleasure.config.json file`);

		if (!times.totalWorkHoursPerDay)
			this.logger.error(`<totalWorkHoursPerDay> field must be specified in <times> object inside pleasure.config.json file`);

		if (!times.timeUnitInHours)
			this.logger.error(`<timeUnitInHours> field must be specified in <times> object inside pleasure.config.json file`);

		!this.isNumber(times.totalWorkHoursPerDay) && this.logger.error(`Value of 'totalWorkHoursPerDay' field must be of a number type!`);

		!this.isNumber(times.timeUnitInHours) && this.logger.error(`Value of 'timeUnitInHours' field must be of a number type!`);

		!this.isNotNegative(times.totalWorkHoursPerDay) && this.logger.error(`Value of 'totalWorkHoursPerDay' field must not be negative!`);

		!this.isNotNegative(times.timeUnitInHours) && this.logger.error(`Value of 'timeUnitInHours' field must not be negative!`);
	}
}

export default new PleasureConfigValidator(logger);