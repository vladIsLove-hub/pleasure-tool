import { IRowReport } from "../report-generator/types/rowReport.types";

export declare async function toExcel(rowReports: IRowReport[]): Promise<void>;