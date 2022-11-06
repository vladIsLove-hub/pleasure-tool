import { IStatus } from "./types/status.types";
import { IReport } from "./types/report.types";
import { ITask } from "./types/task.types";
import { ILogger } from "../logger/types/logger.types";
import { IReportGenerator } from "./types/reportGenerator.types";
import { IStatusParser } from "../parser/types/parser.types";
import { StoreCLINames } from "../store-cli/types/storeCLI.types";
import utils from '../utils/Utils';
import { errors } from "../messages";
import storeCLI from "../store-cli/StoreCLI";
import config from '../config/pleasure.config';
import { Message } from '../messages/types/messages.types';

class ReportGenerator implements IReportGenerator {
	private reports: IReport[] = [];

	constructor(private statusParser: IStatusParser, private logger: ILogger) {
		this.logger = logger;
		this.statusParser = statusParser;
	}

	public async generate(): Promise<IReport[]> {
		const statuses: IStatus[] = await this.statusParser.parse();

		await this.handleOverworks(statuses);

		const collectedErrors: Message[] = [];
		for (const status of statuses) {
			const { date } = status;

			let taskDescriptions: string[];
			try {
				taskDescriptions = await this.getTaskDescriptions(status);
			} catch (e) {
				collectedErrors.push(e as Message);
				continue;
			}

			let tasks: ITask[];
			try {
				tasks = await this.createTasks(taskDescriptions);
			} catch (e) {
				collectedErrors.push(e as Message);
				continue;
			}

			let normalizedTasks: ITask[];
			try {
				normalizedTasks = await utils.getNormalizedTasksByEfforts(tasks, date, status.overworkTimeInTimeUnits);
			} catch (e) {
				collectedErrors.push(e as Message);
				continue;
			}

			normalizedTasks.forEach((task) => this.reports.push(
				{
					date,
					description: task.description,
					effortTime: task.time,
					reportType: task.type
				}
			));
		}

		if (collectedErrors.length) {
			this.logger.errors(collectedErrors);
			process.exit();
		}

		this.reports.sort((a, b) => (Number(new Date(a.date)) - Number(new Date(b.date))));

		return this.reports;
	}

	private async getTaskDescriptions(status: IStatus): Promise<string[]> {
		const { date, statusText } = status;

		const filteredTaskDescriptions: string[] = statusText
			.split('\n')
			.filter((descriptionLine: string) => descriptionLine.length);

		if (!filteredTaskDescriptions.length) {
			throw { text: errors.DescriptionsNotFound, args: [date] };
			// this.logger.error(errors.DescriptionsNotFound, date);
			// process.exit();
		}

		for (const filteredTaskDescription of filteredTaskDescriptions) {
			if (!filteredTaskDescription.trim().startsWith('-')) {
				throw { text: errors.InvalidDescriptionFormat, args: [date] };
				// this.logger.error(errors.InvalidDescriptionFormat, date);
				// process.exit();
			}
		}

		return filteredTaskDescriptions.map((description: string) => description.replace(/\s{0,}-\s{0,}/, '').replace('\r', ''));
	}

	private async createTasks(taskDescriptions: string[]): Promise<ITask[]> {
		const tasks: ITask[] = [];

		for (const taskDescription of taskDescriptions) {
			const descriptionType: string = await this.getDescriptionType(taskDescription) || '';

			if (!descriptionType) {
				throw { text: errors.NoMatchingDescriptionType, args: [taskDescription] };
				// this.logger.error(errors.NoMatchingDescriptionType, taskDescription);
				// process.exit();
			}

			tasks.push({
				type: descriptionType,
				time: config.projectTypes[descriptionType].max,
				description: taskDescription,
			})
		}

		return tasks;
	}

	private async handleOverworks(statuses: IStatus[]): Promise<void> {
		const cliNames: StoreCLINames = await storeCLI.getStoreCLINames();
		const overworkOption = (await storeCLI.getStore()).find(({ optionName }) => optionName === cliNames.overwork);

		if (!overworkOption || !overworkOption.answer) return;

		const getLinesAmount = (statusText: string): number => statusText.split('\n').length;
		const compareByLinesAmountDesc = (a: IStatus, b: IStatus): number => getLinesAmount(b.statusText) - getLinesAmount(a.statusText);

		const totalWorkHoursPerDay = 8;
		const { timeUnitInHours } = config.times;

		statuses.sort(compareByLinesAmountDesc);
		const statusesTotalTimeInHours: number = totalWorkHoursPerDay * statuses.length;
		const overworkPercentage = (Number(overworkOption.answer) / 100);
		const statusesOverworkTimeInTimeUnits: number = Math.floor((statusesTotalTimeInHours * overworkPercentage) / timeUnitInHours);
		const statusesDescriptionsAmount: number = statuses.reduce((acc, status) => acc += getLinesAmount(status.statusText), 0);
		const statusesOverworkTimesInTimeUnits: number[] = [0];
		for (let i = 0; i < statuses.length; i++) {
			const statusTextLinesAmount = getLinesAmount(statuses[i].statusText);
			const statusOverworkTimeInTimeUnits = statusesOverworkTimeInTimeUnits * (statusTextLinesAmount / statusesDescriptionsAmount);
			if (!i) {
				statusesOverworkTimesInTimeUnits.push(statusOverworkTimeInTimeUnits);
			} else {
				statusesOverworkTimesInTimeUnits.push(statusesOverworkTimesInTimeUnits[i] + statusOverworkTimeInTimeUnits);
			}
		}

		const roundedStatusesOverworkTimesInTimeUnits = statusesOverworkTimesInTimeUnits.map(time => Math.round(time));

		const roundedStatusesOverworkTimesInTimeUnitsResiduals: number[] = [];

		for (let i = 1; i < roundedStatusesOverworkTimesInTimeUnits.length; i++) {
			roundedStatusesOverworkTimesInTimeUnitsResiduals.push(
				roundedStatusesOverworkTimesInTimeUnits[i] - roundedStatusesOverworkTimesInTimeUnits[i - 1]
			);
		}

		roundedStatusesOverworkTimesInTimeUnitsResiduals.sort((a, b) => b - a);

		for (let i = 0; i < roundedStatusesOverworkTimesInTimeUnitsResiduals.length; i++) {
			statuses[i].overworkTimeInTimeUnits = roundedStatusesOverworkTimesInTimeUnitsResiduals[i];
		}
	}

	private async getDescriptionType(description: string): Promise<string | void> {
		let index = 0, resultType;
		for (const [type, typeInfo] of Object.entries(config.projectTypes)) {
			if (typeof typeInfo !== 'string') {
				for (const keyWord of typeInfo.keywords) {
					const descriptionLowerCase = description.toLocaleLowerCase();
					const keyWordLowerCase = keyWord.toLocaleLowerCase();
					const currentIndex = descriptionLowerCase.indexOf(keyWordLowerCase);

					if (currentIndex !== -1 && (!resultType || currentIndex < index)) {
						resultType = type;
						index = currentIndex;
					}
				}
			}
		}
		return resultType;
	}
}

export default ReportGenerator;