import { IStatus } from "./types/status.types";
import { IReport } from "./types/report.types";
import { ITask } from "./types/task.types";
import { ILogger } from "../logger/types/logger.types";
import { IReportGenerator } from "./types/reportGenerator.types";
import { IStatusParser } from "../parser/types/parser.types";
import { StoreCLINames } from "../store-cli/types/storeCLI.types";
import utils from '../utils/Utils';
import chalk from "chalk";
import storeCLI from "../store-cli/StoreCLI";
import config from '../config/pleasure.config';

class ReportGenerator implements IReportGenerator {
	private reports: IReport[] = [];

	constructor(private statusParser: IStatusParser, private logger: ILogger) {
		this.logger = logger;
		this.statusParser = statusParser;
	}

	public async generate(): Promise<IReport[]> {
		const statuses: IStatus[] = await this.statusParser.parse();

		this.handleOverworks(statuses);

		for (const status of statuses) {
			const { date } = status;
			const taskDescriptions: string[] = await this.getTaskDescriptions(status);
			const tasks: ITask[] = await this.createTasks(taskDescriptions);
			const normalizedTasks = await utils.getNormalizedTasksByEfforts(tasks, date, status.overworkTimeInTimeUnits);

			normalizedTasks.forEach((task) => this.reports.push(
				{
					date,
					description: task.description,
					effortTime: task.time,
					reportType: task.type
				}
			));
		}

		this.reports.sort((a, b) => (Number(new Date(a.date)) - Number(new Date(b.date))));

		return this.reports;
	}

	private async getTaskDescriptions(status: IStatus): Promise<string[]> {
		const { date, statusText } = status;

		const filteredTaskDescriptions: string[] = statusText
			.split('\n')
			.filter((descriptionLine: string) => descriptionLine.length);

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