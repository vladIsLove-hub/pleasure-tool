import logger from '../logger/Logger';
import { ILogger } from '../logger/types/logger.types';
import { ITask } from '../report-generator/types/task.types';
import { IUtils } from './types/utils.types';
import pleasureConfig from '../../pleasure.config.json';
import config from '../config/pleasure.config';
import storeCli from '../store-cli/StoreCLI';
import { errors } from '../messages';

class Utils implements IUtils {

	constructor(private readonly logger: ILogger) {
		this.logger = logger;
	}

	public async getNormalizedTasksByEfforts(tasks: ITask[], date: string, overworkTimeInTimeUnits?: number): Promise<ITask[]> {
		const { times: { timeUnitInHours, totalWorkHoursPerDay } } = config;
		const { overwork } = await storeCli.getStoreCLINames();

		const getTaskWithMaxTime = async (tasks: ITask[]): Promise<ITask> => {
			let [{ time: currentMaxTime }] = tasks;
			let [currentTask] = tasks;
			for (let i = 1; i < tasks.length; i++) {
				if (currentMaxTime < tasks[i].time) {
					currentMaxTime = tasks[i].time;
					currentTask = tasks[i];
				}
			}
			return currentTask;
		};

		let tasksTotalTimeInHours: number = tasks.reduce((acc, task) => acc += task.time, 0);

		if (tasksTotalTimeInHours >= totalWorkHoursPerDay) {
			while (true) {
				if (totalWorkHoursPerDay === tasksTotalTimeInHours) break;
				const task = await getTaskWithMaxTime(tasks);
				task.time -= timeUnitInHours;
				tasksTotalTimeInHours -= timeUnitInHours;
			}
		} else {
			throw { text: errors.NotEnoughDescriptions, args: [date] };
		}

		if (overworkTimeInTimeUnits) {
			let tasksWithoutOverworkAmount = 0;
			for (const task of tasks) {
				const projectType = pleasureConfig.projectTypes[task.type];
				const projectTypeHasOverwork = overwork in projectType;
				const isEnabledOverwork = projectType.overwork;
				if (projectTypeHasOverwork && !isEnabledOverwork) {
					tasksWithoutOverworkAmount++;
				}
			}

			if (tasksWithoutOverworkAmount === tasks.length) {
				throw { text: errors.NoDescriptionsToApplyOverwork, args: [date] };
			}

			tasks.sort((a: ITask, b: ITask) => pleasureConfig.projectTypes[b.type].max - pleasureConfig.projectTypes[a.type].max);

			let i = 0;
			while (overworkTimeInTimeUnits) {
				const projectType = pleasureConfig.projectTypes[tasks[i].type];
				const projectTypeHasOverwork = overwork in projectType;
				const isEnabledOverwork = projectType.overwork;
				const moveIteratorTask = (tasks: ITask[]) => (i === tasks.length - 1) ? i = 0 : i++;
				if (projectTypeHasOverwork && !isEnabledOverwork) {
					moveIteratorTask(tasks);
					continue;
				}
				tasks[i].time += timeUnitInHours;
				overworkTimeInTimeUnits--;
				moveIteratorTask(tasks);
			}
		}

		return tasks;
	}
}

export default new Utils(logger);