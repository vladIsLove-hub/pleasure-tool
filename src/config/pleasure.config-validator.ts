import chalk from "chalk";
import logger from "../logger/Logger";
import { errors, warnings } from "../messages";
import { ILogger } from "../logger/types/logger.types";
import { PleasureConfig, IPleasureConfigValidator } from "./types/pleasure.config.types";

class PleasureConfigValidator implements IPleasureConfigValidator {
	static configFileName = "pleasure.config.json";

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

		if (!projectTypes || Array.isArray(projectTypes) || Object.keys(projectTypes).length === 0) {
			this.logger.error(errors.InvalidFileFormat, PleasureConfigValidator.configFileName);
			process.exit();
		}

		const uniqueKeywords: { uniqueKey: string; keywords: string[] }[] = [];
		for (const key in projectTypes) {
			const typeInfo = projectTypes[key];
			if (!('max' in typeInfo) || !('keywords' in typeInfo)) {
				this.logger.error(errors.InvalidFileFormatForProjectType, PleasureConfigValidator.configFileName, key);
				process.exit();
			}

			if (!this.isNumber(typeInfo['max'])) {
				this.logger.error(errors.FieldValueInvalidType, "max", key, "number", PleasureConfigValidator.configFileName);
				process.exit();
			}

			if (!this.isNotNegative(typeInfo['max'])) {
				this.logger.error(errors.FieldValueIsNegative, "max", key, PleasureConfigValidator.configFileName);
				process.exit();
			}

			if (!Array.isArray(typeInfo['keywords'])) {
				this.logger.error(errors.FieldValueInvalidType, "keywords", key, "array of not empty strings", PleasureConfigValidator.configFileName);
				process.exit();
			}

			for (const keyWord of typeInfo['keywords']) {
				if (!keyWord || typeof keyWord !== 'string') {
					this.logger.error(errors.FieldValueInvalidType, "keywords", key, "array of not empty strings", PleasureConfigValidator.configFileName);
					process.exit();
				}
			}

			const hash = {};
			for (const keyword of projectTypes[key].keywords) {
				const keywordLowerCase = keyword.toLowerCase();
				hash[keywordLowerCase] = hash[keywordLowerCase] + 1 || 1;
				if (hash[keywordLowerCase] > 1)
					this.logger.warn(warnings.DuplicateKeyword, keyword, key);
			}

			for (const { uniqueKey, keywords } of uniqueKeywords) {
				projectTypes[key].keywords.forEach((keyword: string) => {
					if (keywords.includes(keyword.toLowerCase())) {
						this.logger.error(errors.DuplicateKeyword, keyword, uniqueKey, key);
						process.exit();
					}
				});
			}

			uniqueKeywords.push({
				uniqueKey: key,
				keywords: projectTypes[key].keywords.map((keyword: string) => keyword.toLowerCase()),
			});
		}

		if (!times) {
			this.logger.error(errors.FieldNotSpecified, "times", PleasureConfigValidator.configFileName);
			process.exit();
		}

		if (!times.totalWorkHoursPerDay) {
			this.logger.error(errors.FieldNotSpecified, "totalWorkHoursPerDay", PleasureConfigValidator.configFileName);
			process.exit();
		}

		if (!times.timeUnitInHours) {
			this.logger.error(errors.FieldNotSpecified, "timeUnitInHours", PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNumber(times.totalWorkHoursPerDay)) {
			this.logger.error(errors.FieldValueInvalidType, "totalWorkHoursPerDay", "number", PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNumber(times.timeUnitInHours)) {
			this.logger.error(errors.FieldValueInvalidType, "timeUnitInHours", "number", PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNotNegative(times.totalWorkHoursPerDay)) {
			this.logger.error(errors.FieldValueIsNegative, "totalWorkHoursPerDay", PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNotNegative(times.timeUnitInHours)) {
			this.logger.error(errors.FieldValueIsNegative, "timeUnitInHours", PleasureConfigValidator.configFileName);
		}
	}
}

export default new PleasureConfigValidator(logger);