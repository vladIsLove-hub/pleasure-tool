import chalk from "chalk";
import logger from "../logger/Logger";
import { ILogger } from "../logger/types/logger.types";
import { ITask } from "../report-generator/types/task.types";
import { IUtils } from "./types/utils.types";

class Utils implements IUtils {

  constructor(private readonly logger: ILogger) {
    this.logger = logger;
  }

  public async getNormalizedTasksByEfforts(taskList: ITask[], date: string): Promise<ITask[]> {
    const timeUnitInHours = 0.25;
    const expectedTimeInHours = 8;

    const getTaskWithMaxTime = async (taskList: ITask[]): Promise<ITask> => {
      let [ { time: currentMaxTime } ] = taskList;
      let [ currentTask ] = taskList;
      for (let i = 1; i < taskList.length; i++) {
        if (currentMaxTime < taskList[i].time) {
          currentMaxTime = taskList[i].time;
          currentTask = taskList[i];
        }
      }
      return currentTask;
    }

    let tasksTotalTime: number = taskList.reduce((acc, task) => acc += task.time, 0);

    if (tasksTotalTime > expectedTimeInHours) {
      while (true) {
        if (expectedTimeInHours === tasksTotalTime) break;
        const task = await getTaskWithMaxTime(taskList);
        task.time -= timeUnitInHours;
        tasksTotalTime -= timeUnitInHours;
      }
    } else {
      this.logger.error(`You must write more fields in your status for date: ${chalk.underline(date)}`);
    }

    return taskList;
  }
}

export default new Utils(logger);