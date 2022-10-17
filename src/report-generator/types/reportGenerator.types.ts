import { IReport } from "./report.types";
import { IStatus } from "./status.types";

export interface IReportGenerator {
    generate: (statuses: IStatus[]) => Promise<IReport[]>;
}