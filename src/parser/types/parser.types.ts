import { IStatus } from '../../report-generator/types/status.types';

export interface IStatusParser {
    parse: () => Promise<IStatus[]>;
}