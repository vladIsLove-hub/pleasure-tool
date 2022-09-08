import { IStatus } from "./types/status.types";
import projectTypesConfig from '../../project.types.json';
import { IRowReport } from "./types/rowReport.types";
import { ITask } from "./types/task.types";
import { IReportGenerator, ProjectTypes } from "./types/reportGenerator.types";
import { IUtils } from "../utils/types/utils.types";
import utils from '../utils/Utils';
import { ILogger } from "../logger/types/logger.types";
import logger from '../logger/Logger';
import { IReportValidator } from "./types/reportValidator.types";
import reportValidator from './ReportValidator';
import chalk from "chalk";
import storeCLI from "../store-cli/StoreCLI";
import { compileFunction } from "node:vm";

class ReportGenerator implements IReportGenerator {
  private projectTypes: ProjectTypes;
  private rowReports: IRowReport[] = [];

  constructor(private utils: IUtils, private logger: ILogger, private reportValidator: IReportValidator) {
    this.utils = utils;
    this.logger = logger;
    this.reportValidator = reportValidator;
    this.projectTypes = this.getProjectTypes();
  }

  public async generateRowReports(statuses: IStatus[]): Promise<IRowReport[]> {
    const overworkCliName = 'overwork';
    const overwork = (await storeCLI.getStore()).find(({ optionName }) => optionName === overworkCliName);
    let totalTimeInHours;
    let totalOverworkTimeInTimeUnits;

    if (overwork && overwork.answer) {
      statuses.sort((a, b) => b.statusText.split('\n').length - a.statusText.split('\n').length);
      totalTimeInHours = 8 * statuses.length;
      totalOverworkTimeInTimeUnits = Math.floor((totalTimeInHours * (+overwork.answer / 100)) / 0.25);
      const accumulatedDashes = statuses.reduce((acc, status) => acc += status.statusText.split('\n').length, 0);
      const overworkTimes: number[] = [0];
      for (let i = 0; i < statuses.length; i++) {
        if (!i) {
          overworkTimes.push(totalOverworkTimeInTimeUnits * (statuses[i].statusText.split('\n').length / accumulatedDashes));
        } else {
          overworkTimes.push(overworkTimes[i] + totalOverworkTimeInTimeUnits * (statuses[i].statusText.split('\n').length / accumulatedDashes))
        }
      }

      const roundedOverworkTimes = overworkTimes.map(time => Math.round(time));

      const roundedOverworkTimesResiduals: number[] = [];

      for (let i = 1; i < roundedOverworkTimes.length; i++) {
        roundedOverworkTimesResiduals.push(roundedOverworkTimes[i] - roundedOverworkTimes[i - 1]);
      }

      roundedOverworkTimesResiduals.sort((a, b) => b - a);

      for (let i = 0; i < roundedOverworkTimesResiduals.length; i++) {
        statuses[i].overworkTimeInTimeUnits = roundedOverworkTimesResiduals[i];
      }
    }

    for (const status of statuses) {
      const { date } = status;
      const taskDescriptions: string[] = await this.getTaskDescriptions(status);
      const tasks: ITask[] = await this.createTasks(taskDescriptions);
      const normalizedTasks = await this.utils.getNormalizedTasksByEfforts(tasks, date, status.overworkTimeInTimeUnits);

      normalizedTasks.forEach((task) => this.rowReports.push({
        date,
        description: task.description,
        effortTime: task.time,
        reportType: task.type
      }))
    }

    this.rowReports.sort((a, b) => (+new Date(a.date) - +new Date(b.date)));

    return this.rowReports;
  }

  private async getTaskDescriptions(status: IStatus): Promise<string[]> {
    const { date, statusText } = status;

    const filteredTaskDescriptions: string[] = statusText
      .split('\n')
      .filter((descriptionLine: string) => descriptionLine.length)

    for (const filteredTaskDescription of filteredTaskDescriptions) {
      if (!filteredTaskDescription.trim().startsWith('-')) {
        this.logger.error(`Wrong description format for the following date: ${date}. Each description must start with '-'.`)
      }
    }

    if (!filteredTaskDescriptions.length) {
      this.logger.error(`
          No descriptions were found in <statuses.txt> file which start with '-' for the following date: ${date}.
        `);
    }

    return filteredTaskDescriptions.map((description: string) => description.replace(/\s{0,}-\s{0,}/, '').replace('\r', ''));
  }

  private async createTasks(taskDescriptions: string[]): Promise<ITask[]> {
    const tasks: ITask[] = [];

    for (const taskDescription of taskDescriptions) {
      const descriptionType: string = await this.getDescriptionType(taskDescription) || '';

      if (!descriptionType) {
        this.logger.error(`No matching description type was found for description type: ${chalk.underline(taskDescription)}`)
      }

      tasks.push({
        type: descriptionType,
        time: this.projectTypes[descriptionType].max,
        description: taskDescription,
      })
    }

    return tasks;
  }

  private async getDescriptionType(description: string): Promise<string | void> {
    let index = 0, resultType;
    for (const [type, typeInfo] of Object.entries(this.projectTypes)) {
      if (typeof typeInfo !== 'string') {
        for (const keyWord of typeInfo.wildcard) {
          const descriptionLowerCase = description.toLocaleLowerCase();
          const keyWordLowerCase = keyWord.toLocaleLowerCase();
          let currentIndex = descriptionLowerCase.indexOf(keyWordLowerCase);

          if (currentIndex !== -1 && (!resultType || currentIndex < index)) {
            resultType = type;
            index = currentIndex;
          };
        }
      }
    }
    return resultType;
  }

  private getProjectTypes(): ProjectTypes {
    const projectTypes = JSON.parse(JSON.stringify(projectTypesConfig));
    this.reportValidator.validateProjectTypesConfig(projectTypes);
    return projectTypes;
  }
}

export default new ReportGenerator(utils, logger, reportValidator);