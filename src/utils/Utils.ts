import { ITask } from "../report-generator/types/task.types";
import { IUtils } from "./types/utils.types";

class Utils implements IUtils {
  public async getNormalizedTasksByEfforts(taskList: ITask[]): Promise<ITask[]> {
    const timeUnitInHours = 0.25;
    const expectedTimeInHours = 8;

    const getTaskWithMaxTime = async (taskList: ITask[]): Promise<ITask> => {
      // TODO: We should add check for empty tasklist here
      let currentMax = taskList[0].time;
      let currentTask = taskList[0];
      for (let i = 1; i < taskList.length; i++) {
        if (currentMax < taskList[i].time) {
          currentMax = taskList[i].time;
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
      throw new Error('You should write more fields in your status per day'); //TODO:  Add log about particular status with its date
    }

    return taskList; //TODO: get read of return because function changes args
  }
}

export default new Utils();