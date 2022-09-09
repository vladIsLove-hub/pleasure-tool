import { IRowReport } from "./rowReport.types";
import { IStatus } from "./status.types";

export interface IReportGenerator {
    generateRowReports: (statuses: IStatus[]) => Promise<IRowReport[]>
}

export type ProjectTypes = {
    type: string;
    typeInfo: {
        max: number;
        keywords: string[];
    }
}