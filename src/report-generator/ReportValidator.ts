import logger from "../logger/Logger";
import { ILogger } from "../logger/types/logger.types";
import { IReportValidator } from "./types/reportValidator.types";

class ReportValidator implements IReportValidator{

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
      this.logger.error(`Wrong <project.types.json> config format. Please read README.md`);
    }

    for (let key in projectTypes) {
      const typeInfo = projectTypes[key];
      if (!('min' in typeInfo) || !('max' in typeInfo) || !('wildcard' in typeInfo)) {
        this.logger.error(`Wrong <project.types.json> config format, for project type: ${key}. Please read README.md`);
      }

      if (!this.isNumber(typeInfo['min']) || !this.isNumber(typeInfo['max'])) {
        this.logger.wrongFormatError(key, `Field 'min' and 'max' values must be of a number type! \n`);
      }

      if (!this.isNotNegative(typeInfo['min']) || !this.isNotNegative(typeInfo['max'])) {
        this.logger.wrongFormatError(key, `Field 'min' and 'max' values must not be negative! \n`);
      }

      if (!Array.isArray(typeInfo['wildcard'])) {
        this.logger.wrongFormatError(key, `'wildcard' field value must be array of strings!`);
      }

      for (const keyWord of typeInfo['wildcard']) {
        if (typeof keyWord !== 'string') {
          this.logger.wrongFormatError(key, `'wildcard' field value must be array of strings!`);
        }

        if (!keyWord) {
          this.logger.wrongFormatError(key, `'wildcard' field value must be array of not empty strings!`);
        }
      }
    }
  };
}

export default new ReportValidator(logger);