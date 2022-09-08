import { IStatus } from '../report-generator/types/status.types';
import * as fs from 'fs/promises';
import { IRowReport } from '../report-generator/types/rowReport.types';
import { IParser } from './types/parser.types';
import path from 'path';
import { IReportGenerator } from '../report-generator/types/reportGenerator.types';
import { ILogger } from '../logger/types/logger.types';

export default class Parser implements IParser {
    private static STATUSES_PATH: string = path.resolve(process.cwd(), '../statuses.txt');
    private static STATUS_SEPARATOR: string = '===';

    private uniqueDates: string[] = [];
    private reportGenerator: IReportGenerator;
    private logger: ILogger;

    constructor(reportGenerator: IReportGenerator, logger: ILogger) {
        this.reportGenerator = reportGenerator;
        this.logger = logger;
    }

    public async parse(): Promise<IRowReport[]> {
        const statusesFileContent = await this.getStatusesFileContent();

        if (!statusesFileContent) {
            this.logger.error('Statuses file is empty. Read README.md');
        }

        const statuses: IStatus[] = statusesFileContent
            .split(Parser.STATUS_SEPARATOR)
            .map((status: string) => {
                const parsedDate = status.match(/\d{0,}\/\d{0,}\/\d{0,}/gi);

                if (!parsedDate || !parsedDate.length) {
                    this.logger.error(`Wrong date format for the status: \n ${status}`);
                }

                const dateToValidate = new Date(parsedDate![0]);
                
                if (!(dateToValidate instanceof Date) || isNaN(<any>dateToValidate)) {
                    this.logger.error(`Wrong date format for the status: \n ${status}`);
                }

                const date = dateToValidate.toLocaleDateString();

                if (this.uniqueDates.includes(date)) {
                    this.logger.error(`Duplicate date was found: ${date}`);
                }

                this.uniqueDates.push(date);

                return {
                    date,
                    statusText: status.replace(parsedDate![0], '').trim()
                }
            });

        return await this.reportGenerator.generateRowReports(statuses);
    }

    private async getStatusesFileContent(): Promise<string> {
        try {
            return await fs.readFile(Parser.STATUSES_PATH, { encoding: 'utf-8' });
        } catch(e) {
            if (e instanceof Error) {
                this.logger.error(`File <statuses.txt> was not found by the following path: ${Parser.STATUSES_PATH}`)
            }
            throw e;
        }
    }
}
