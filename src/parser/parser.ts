import { STATUSES_PATH, STATUS_SEPARATOR } from '../constants';
import { IStatus } from './types/status';
import * as fs from 'fs/promises';
import { generateRowReports } from './generateRowReports';
import { IRowReport } from './types/rowReport';

export const parser = async (): Promise<IRowReport[]> => {
    const statusFile = await fs.readFile(STATUSES_PATH, { encoding: 'utf-8' });
    const statuses: IStatus[] = statusFile.split(STATUS_SEPARATOR).map((status: string) => {
        const [date] = status.match(/\d{0,}\/\d{0,}\/\d{0,}/gi)!;
        return {
            date,
            statusText: status.replace(date, '').trim()
        }
    });

    return await generateRowReports(statuses);
}