import { IRowReport } from "../../report-generator/types/rowReport.types";

export interface IParser {
    parse: () => Promise<IRowReport[]>
}