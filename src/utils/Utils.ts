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

  public async getNormalizedTasksByEfforts(tasks: ITask[], date: string, overworkTimeInTimeUnits?: number): Promise<ITask[]> {
    const timeUnitInHours = 0.25;
    const expectedTimeInHours = 8;

    const getTaskWithMaxTime = async (tasks: ITask[]): Promise<ITask> => {
      let [{ time: currentMaxTimeInHours }] = tasks;
      let [currentTask] = tasks;
      for (let i = 1; i < tasks.length; i++) {
        if (currentMaxTimeInHours < tasks[i].time) {
          currentMaxTimeInHours = tasks[i].time;
          currentTask = tasks[i];
        }
      }
      return currentTask;
    }

    let tasksTotalTimeInHours: number = tasks.reduce((acc, task) => acc += task.time, 0);

    if (tasksTotalTimeInHours >= expectedTimeInHours) {
      while (true) {
        if (expectedTimeInHours === tasksTotalTimeInHours) break;
        const task = await getTaskWithMaxTime(tasks);
        task.time -= timeUnitInHours;
        tasksTotalTimeInHours -= timeUnitInHours;
      }
    } else {
      this.logger.error(`You must write more fields in your status for date: ${chalk.underline(date)}`);
    }

    if (overworkTimeInTimeUnits) {
      let count = 0;
      for (const task of tasks) {
        const projectType = projectTypes[task.type];
        const hasOverwork = 'overwork' in projectType;
        if (hasOverwork && !projectType.overwork) {
          count++;
        }
      }

      if (count === tasks.length) {
        this.logger.error(`There are no task descriptions for overwork for date: ${chalk.underline(date)}`)
      }

      tasks.sort((a, b) => projectTypes[b.type].max - projectTypes[a.type].max);

      let i = 0;
      while (overworkTimeInTimeUnits) {
        const projectType = projectTypes[tasks[i].type];
        const hasOverwork = 'overwork' in projectType;
        if (hasOverwork && !projectType.overwork) {
          i === tasks.length - 1 ? i = 0 : i++;
          continue;
        }
        tasks[i].time += timeUnitInHours;
        overworkTimeInTimeUnits--;
        i === tasks.length - 1 ? i = 0 : i++;
      }
    }

    return tasks;
  }
}

export default new Utils(logger);