import { IRowReport } from "./rowReport.types";
import { IStatus } from "./status.types";

export interface IReportGenerator {
    generateRowReports: (statuses: IStatus[]) => Promise<IRowReport[]>
}

export type ProjectTypes = {
    type: string;
    typeInfo: {
        min: number;
        max: number;
        keywords: string[];
    }
}