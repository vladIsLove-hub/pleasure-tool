import logger from '../logger/logger';
import { ILogger } from '../logger/types/logger.types';
import { errors, warnings } from '../messages';
import { PleasureConfig, IPleasureConfigValidator } from './types/pleasure.config.types';

class PleasureConfigValidator implements IPleasureConfigValidator {
	static configFileName = 'pleasure.config.json';

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
			if (!('max' in typeInfo)) {
				this.logger.error(errors.ProjectTypeFieldNotSpecified, 'max', key, PleasureConfigValidator.configFileName);
				process.exit();
			}

			if (!('keywords' in typeInfo)) {
				this.logger.error(errors.ProjectTypeFieldNotSpecified, 'keywords', key, PleasureConfigValidator.configFileName);
				process.exit();
			}

			const { max, keywords } = typeInfo;

			if (!this.isNumber(max)) {
				this.logger.error(errors.ProjectTypeFieldValueInvalidType, 'max', key, 'number', PleasureConfigValidator.configFileName);
				process.exit();
			}

			if (!this.isNotNegative(max)) {
				this.logger.error(errors.ProjectTypeFieldValueIsNegative, 'max', key, PleasureConfigValidator.configFileName);
				process.exit();
			}

			let isKeywordsInvalidType = false;
			if (!Array.isArray(keywords) || !keywords.length) {
				isKeywordsInvalidType = true;
			}

			for (const keyword of keywords) {
				if (!keyword || typeof keyword !== 'string') {
					isKeywordsInvalidType = true;
				}
			}

			if (isKeywordsInvalidType) {
				this.logger.error(errors.ProjectTypeFieldValueInvalidType, 'keywords', key, 'array of not empty strings', PleasureConfigValidator.configFileName);
				process.exit();
			}

			const keywordEntries = {};
			for (const keyword of projectTypes[key].keywords) {
				const keywordLowerCase = keyword.toLowerCase();
				keywordEntries[keywordLowerCase] = keywordEntries[keywordLowerCase] + 1 || 1;
				if (keywordEntries[keywordLowerCase] > 1)
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

		if (times === undefined) {
			this.logger.error(errors.FieldNotSpecified, 'times', PleasureConfigValidator.configFileName);
			process.exit();
		}

		if (times.totalWorkHoursPerDay === undefined) {
			this.logger.error(errors.FieldNotSpecified, 'totalWorkHoursPerDay', PleasureConfigValidator.configFileName);
			process.exit();
		}

		if (!times.timeUnitInHours === undefined) {
			this.logger.error(errors.FieldNotSpecified, 'timeUnitInHours', PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNumber(times.totalWorkHoursPerDay)) {
			this.logger.error(errors.FieldValueInvalidType, 'totalWorkHoursPerDay', 'number', PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNumber(times.timeUnitInHours)) {
			this.logger.error(errors.FieldValueInvalidType, 'timeUnitInHours', 'number', PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNotNegative(times.totalWorkHoursPerDay)) {
			this.logger.error(errors.FieldValueIsNegative, 'totalWorkHoursPerDay', PleasureConfigValidator.configFileName);
			process.exit();
		}

		if(!this.isNotNegative(times.timeUnitInHours)) {
			this.logger.error(errors.FieldValueIsNegative, 'timeUnitInHours', PleasureConfigValidator.configFileName);
			process.exit();
		}
	}
}

export default new PleasureConfigValidator(logger);