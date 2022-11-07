import excel from 'excel4node';
import ExcelGenerator from './src/core/ExcelGenerator';
import logger from './src/logger/Logger';
import readline from './src/readline/Readline';
import promisify from './src/utils/Promisify';
import ReportGenerator from './src/report-generator/ReportGenerator';
import StatusParser from './src/parser/parser';
import { IStatusParser } from './src/parser/types/parser.types';
import { IReport } from './src/report-generator/types/report.types';

const main = async () => {
	await readline.read();
	const statusParser: IStatusParser = new StatusParser(logger);
	const reports: IReport[] = await new ReportGenerator(statusParser, logger).generate();
	await new ExcelGenerator(excel, logger, promisify).generate(reports);
};

main();