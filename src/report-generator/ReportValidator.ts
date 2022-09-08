import chalk from "chalk";
import logger from "../logger/Logger";
import { ILogger } from "../logger/types/logger.types";
import { IReportValidator } from "./types/reportValidator.types";

class ReportValidator implements IReportValidator {

  constructor(private logger: ILogger) {
    this.logger = logger;
  }

  private isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  private isNotNegative(number: number) {
    return number >= 0;
  }

  public validateProjectTypesConfig(projectTypes: any): void {
    if (!projectTypes || Array.isArray(projectTypes) || Object.keys(projectTypes).length === 0) {
      this.logger.error(`Wrong <project.types.json> config format. Read README.md`);
    }

    const uniqueKeywords: { uniqueKey: string; keywords: string[] }[] = [];
    for (let key in projectTypes) {
      const typeInfo = projectTypes[key];
      if (!('min' in typeInfo) || !('max' in typeInfo) || !('keywords' in typeInfo)) {
        this.logger.error(`Wrong <project.types.json> config format, for project type: ${key}. Read README.md`);
      }

      if (!this.isNumber(typeInfo['min']) || !this.isNumber(typeInfo['max'])) {
        this.logger.wrongFormatError(key, `Field 'min' and 'max' values must be of a number type! \n`);
      }

      if (!this.isNotNegative(typeInfo['min']) || !this.isNotNegative(typeInfo['max'])) {
        this.logger.wrongFormatError(key, `Field 'min' and 'max' values must not be negative! \n`);
      }

      if (!Array.isArray(typeInfo['keywords'])) {
        this.logger.wrongFormatError(key, `'keywords' field value must be array of strings!`);
      }

      for (const keyWord of typeInfo['keywords']) {
        if (typeof keyWord !== 'string') {
          this.logger.wrongFormatError(key, `'keywords' field value must be array of strings!`);
        }

        if (!keyWord) {
          this.logger.wrongFormatError(key, `'keywords' field value must be array of not empty strings!`);
        }
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
          if (keywords.includes(keyword.toLowerCase())) {
            this.logger.error(`Duplicate keyword: "${chalk.underline(keyword)}" was found for the following project types: ${chalk.underline(uniqueKey)} and ${chalk.underline(key)}`);
          }
        });
      }

      uniqueKeywords.push({
        uniqueKey: key,
        keywords: projectTypes[key].keywords.map((keyword: string) => keyword.toLowerCase()),
      });
    }
  };
}

export default new ReportValidator(logger);