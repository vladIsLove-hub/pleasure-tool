import { ITask } from "../../report-generator/types/task.types";

export interface IUtils {
  getNormalizedTasksByEfforts: (taskList: ITask[]) => Promise<ITask[]>;
}