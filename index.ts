import excel from 'excel4node';

import ExcelGenerator from './src/core/excel-generator';
import logger from './src/logger/logger';
import StatusParser from './src/parser/parser';
import { IStatusParser } from './src/parser/types/parser.types';
import readline from './src/readline/readline';
import ReportGenerator from './src/report-generator/report-generator';
import { IReport } from './src/report-generator/types/report.types';
import promisify from './src/utils/promisify';

const main = async () => {
	await readline.read();
	const statusParser: IStatusParser = new StatusParser(logger);
	const reports: IReport[] = await new ReportGenerator(statusParser, logger).generate();
	await new ExcelGenerator(excel, logger, promisify).generate(reports);
};

main();