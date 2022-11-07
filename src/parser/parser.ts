import * as fs from 'node:fs/promises';
import path from 'node:path';

import { ILogger } from '../logger/types/logger.types';
import { errors } from '../messages';
import { IStatus } from '../report-generator/types/status.types';
import { IStatusParser } from './types/parser.types';

export default class StatusParser implements IStatusParser {
	private static STATUSES_PATH: string = path.resolve(process.cwd(), '../statuses.txt');
	private static STATUS_SEPARATOR = '===';

	private uniqueDates: string[] = [];

	constructor(private logger: ILogger) {
		this.logger = logger;
	}

	public async parse(): Promise<IStatus[]> {
		const statusesFileContent = await this.getStatusesFileContent();

		if (!statusesFileContent) {
			this.logger.error(errors.EmptyFile, StatusParser.STATUSES_PATH);
			process.exit();
		}

		const statuses: IStatus[] = statusesFileContent
			.split(StatusParser.STATUS_SEPARATOR)
			.map((status: string) => {
				const parsedDate = status.match(/\d{0,}(\/|-)\d{0,}(\/|-)\d{0,}/gi);

				if (!parsedDate || !parsedDate.length) {
					this.logger.error(errors.StatusInvalidDateFormat, status);
					process.exit();
				}

				const dateToValidate = new Date(parsedDate![0]);

				if (!(dateToValidate instanceof Date) || isNaN(<any>dateToValidate)) {
					this.logger.error(errors.StatusInvalidDateFormat, status);
					process.exit();
				}

				const date = `${dateToValidate.getMonth() + 1}/${dateToValidate.getDate()}/${dateToValidate.getFullYear()}`;

				if (this.uniqueDates.includes(date)) {
					this.logger.error(errors.StatusDuplicateDate, date);
					process.exit();
				}

				this.uniqueDates.push(date);

				return {
					date,
					statusText: status.replace(parsedDate![0], '').trim()
				};
			});

		return statuses;
	}

	private async getStatusesFileContent(): Promise<string> {
		try {
			return await fs.readFile(StatusParser.STATUSES_PATH, { encoding: 'utf-8' });
		} catch(e) {
			if (e instanceof Error) {
				this.logger.error(errors.FileNotFound, StatusParser.STATUSES_PATH);
				process.exit();
			}
			throw e;
		}
	}
}