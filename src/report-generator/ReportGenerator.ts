import { IStatus } from "./types/status.types";
import projectTypesConfig from '../../project.types.json';
import { IRowReport } from "./types/rowReport.types";
import { ITask } from "./types/task.types";
import { IReportGenerator, ProjectTypes } from "./types/reportGenerator.types";
import { IUtils } from "../utils/types/utils.types";
import utils from '../utils/Utils';
import { ILogger } from "../logger/types/logger.types";
import logger from '../logger/Logger';

class ReportGenerator implements IReportGenerator {
  private projectTypes: ProjectTypes;
  private rowReports: IRowReport[] = [];

  constructor(private utils: IUtils, private logger: ILogger) {
    this.utils = utils;
    this.logger = logger;
    this.projectTypes = this.validateProjectTypesConfig();
  }

  public async generateRowReports(statuses: IStatus[]): Promise<IRowReport[]> {
    for (const status of statuses) {
      const { date } = status;
      const taskDescriptions: string[] = await this.getTaskDescriptions(status);
      const tasks: ITask[] = await this.createTasks(taskDescriptions);
      const normalizedTasks = await this.utils.getNormalizedTasksByEfforts(tasks);

      normalizedTasks.forEach((task) => this.rowReports.push({
        date,
        description: task.description,
        effortTime: task.time,
        reportType: task.type
      }))
    }

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
      tasks.push({
        type: descriptionType,
        time: this.projectTypes[descriptionType].max,
        description: taskDescription,
      })
    }

    return tasks;
  }

  private async getDescriptionType(description: string): Promise<string | void> { // TODO: we should add exception inside <remove void>
    for (const [type, typeInfo] of Object.entries(this.projectTypes)) {
      if (typeof typeInfo !== 'string') {
        for (const keyWord of typeInfo.wildcard) {
          if (description.toLocaleLowerCase().includes(keyWord.toLocaleLowerCase())) {
            return type;
          };
        }
      } 
    }
  }

  private validateProjectTypesConfig(): ProjectTypes {
    const projectTypes = JSON.parse(JSON.stringify(projectTypesConfig));

    if (!projectTypes || Array.isArray(projectTypes)) {
      this.logger.error(`Wrong <project.types.json> config format. Please read README.md`);
    }

    for (let key in projectTypes) {
      const typeInfo = projectTypes[key];

      if (!('min' in typeInfo) || !('max' in typeInfo) || !('wildcard' in typeInfo)) {
        this.logger.error(`Wrong <project.types.json> config format, for project type: ${key}. Please read README.md`);
      }
    }

    return projectTypes;
  }
}

export default new ReportGenerator(utils, logger);