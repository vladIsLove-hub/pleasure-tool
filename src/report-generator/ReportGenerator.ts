import { IStatus } from "./types/status.types";
import projectTypesConfig from '../../project.types.json';
import { IRowReport } from "./types/rowReport.types";
import { ITask } from "./types/task.types";
import { IReportGenerator, ProjectTypes } from "./types/reportGenerator.types";
import { IUtils } from "../utils/types/utils.types";
import utils from '../utils/Utils';

class ReportGenerator implements IReportGenerator {
  private static projectTypes: ProjectTypes = JSON.parse(JSON.stringify(projectTypesConfig));

  private rowReports: IRowReport[] = [];

  constructor(private utils: IUtils) {
    this.utils = utils;
  }

  public async generateRowReports(statuses: IStatus[]): Promise<IRowReport[]> {
    for (const status of statuses) {
      const { date, statusText } = status;
      const taskDescriptions: string[] = await this.getTaskDescriptions(statusText);
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

  private async getTaskDescriptions(statusText: string): Promise<string[]> {
    return statusText
      .split('\n')
      .filter((description: string) => description.trim().startsWith('-'))
      .map((description: string) => description.replace(/\s{0,}-\s{0,}/, '').replace('\r', ''));
  }

  private async createTasks(taskDescriptions: string[]): Promise<ITask[]> {
    const tasks: ITask[] = [];

    for (const taskDescription of taskDescriptions) {
      const descriptionType: string = await this.getDescriptionType(taskDescription) || '';
      tasks.push({
        type: descriptionType,
        time: ReportGenerator.projectTypes[descriptionType].max,
        description: taskDescription,
      })
    }

    return tasks;
  }

  private async getDescriptionType(description: string): Promise<string | void> { // TODO: we should add exception inside <remove void>
    for (const [type, typeInfo] of Object.entries(ReportGenerator.projectTypes)) {
      if (typeof typeInfo !== 'string') {
        for (const keyWord of typeInfo.wildcard) {
          if (description.toLocaleLowerCase().includes(keyWord.toLocaleLowerCase())) return type;
        }
      } //TODO: we should handle error if typeInfo is not object.
    }
  }
}

export default new ReportGenerator(utils);