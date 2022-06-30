import { IStatus } from '../report-generator/types/status.types';
import * as fs from 'fs/promises';
import { IRowReport } from '../report-generator/types/rowReport.types';
import { IParser } from './types/parser.types';
import path from 'path';
import { IReportGenerator } from '../report-generator/types/reportGenerator.types';

export default class Parser implements IParser {
    private static STATUSES_PATH: string = path.resolve(process.cwd(), '../../statuses.txt')
    private static STATUS_SEPARATOR: string = '===';
    
    private reportGenerator: IReportGenerator;

    constructor (reportGenerator: IReportGenerator) {
        this.reportGenerator = reportGenerator;
    }

    public async parse(): Promise<IRowReport[]> {
        const statusesFileContent = await this.getStatusesFileContent();
        const statuses: IStatus[] = statusesFileContent
                                        .split(Parser.STATUS_SEPARATOR)
                                        .map((status: string) => {
                                            const [month, day, year] = status.match(/\d{0,}\/\d{0,}\/\d{0,}/gi)![0].split('/');
                                            const date = `${month}/${+day + 1}/${year}`;
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
