import chalk from "chalk";
import logger from "../logger/Logger";
import { ILogger } from "../logger/types/logger.types";
import { ITask } from "../report-generator/types/task.types";
import { IUtils } from "./types/utils.types";
import projectTypes from '../../project.types.json';

class Utils implements IUtils {

  constructor(private readonly logger: ILogger) {
    this.logger = logger;
  }

  public async getNormalizedTasksByEfforts(taskList: ITask[], date: string, overworkTimeInTimeUnits?: number): Promise<ITask[]> {
    const timeUnitInHours = 0.25;
    const expectedTimeInHours = 8;

    const getTaskWithMaxTime = async (taskList: ITask[]): Promise<ITask> => {
      let [{ time: currentMaxTime }] = taskList;
      let [currentTask] = taskList;
      for (let i = 1; i < taskList.length; i++) {
        if (currentMaxTime < taskList[i].time) {
          currentMaxTime = taskList[i].time;
          currentTask = taskList[i];
        }
      }
      return currentTask;
    }

    let tasksTotalTime: number = taskList.reduce((acc, task) => acc += task.time, 0);

    if (tasksTotalTime >= expectedTimeInHours) {
      while (true) {
        if (expectedTimeInHours === tasksTotalTime) break;
        const task = await getTaskWithMaxTime(taskList);
        task.time -= timeUnitInHours;
        tasksTotalTime -= timeUnitInHours;
      }
    } else {
      this.logger.error(`You must write more fields in your status for date: ${chalk.underline(date)}`);
    }

    if (overworkTimeInTimeUnits) {
      let count = 0;
      for (const task of taskList) {
        const projectType = projectTypes[task.type];
        const hasOverwork = 'overwork' in projectType;
        if (hasOverwork && !projectType.overwork) {
          count++;
        }
      }

      if (count === taskList.length) {
        this.logger.error(`There are no task descriptions for overwork for date: ${chalk.underline(date)}`)
      }

      taskList.sort((a, b) => projectTypes[b.type].max - projectTypes[a.type].max);

      let i = 0;
      while (overworkTimeInTimeUnits) {
        const projectType = projectTypes[taskList[i].type];
        const hasOverwork = 'overwork' in projectType;
        if (hasOverwork && !projectType.overwork) {
          i === taskList.length - 1 ? i = 0 : i++;
          continue;
        }
        taskList[i].time += timeUnitInHours;
        overworkTimeInTimeUnits--;
        i === taskList.length - 1 ? i = 0 : i++;
      }
    }

    return taskList;
  }
}

export default new Utils(logger);