import { IStatus } from '../report-generator/types/status.types';
import * as fs from 'fs/promises';
import { IRowReport } from '../report-generator/types/rowReport.types';
import { IParser } from './types/parser.types';
import path from 'path';
import { IReportGenerator } from '../report-generator/types/reportGenerator.types';
import { ILogger } from '../logger/types/logger.types';

export default class Parser implements IParser {
    private static STATUSES_PATH: string = path.resolve(process.cwd(), '../statuses.txt')
    private static STATUS_SEPARATOR: string = '===';

    private reportGenerator: IReportGenerator;
    private logger: ILogger;

    constructor(reportGenerator: IReportGenerator, logger: ILogger) {
        this.reportGenerator = reportGenerator;
        this.logger = logger;
    }

    public async parse(): Promise<IRowReport[]> {
        const statusesFileContent = await this.getStatusesFileContent();

        if (!statusesFileContent) {
            this.logger.error('Statuses file is empty. Please read README.md');
        }

        const statuses: IStatus[] = statusesFileContent
            .split(Parser.STATUS_SEPARATOR)
            .map((status: string) => {
                const parsedData = status.match(/\d{0,}\/\d{0,}\/\d{0,}/gi)
                if (!parsedData) {
                    this.logger.error('Wrong statuses file format. Please read README.md');
                }
                const date = parsedData![0];
                return {
                    date,
                    statusText: status.replace(date, '').trim()
                }
            });

        return await this.reportGenerator.generateRowReports(statuses);
    }

    private async getStatusesFileContent(): Promise<string> {
        return await fs.readFile(Parser.STATUSES_PATH, { encoding: 'utf-8' });
    }
}
