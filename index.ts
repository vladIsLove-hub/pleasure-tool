import Parser from './src/parser/Parser';
import excel from 'excel4node';
import reportGenerator from './src/report-generator/ReportGenerator';
import ExcelGenerator from './src/core/ExcelGenerator';
import logger from './src/logger/Logger';
import readline from './src/readline/Readline';
import promisify from './src/utils/Promisify';

const main = async () => {
    await readline.read();
    const rowReports = await new Parser(reportGenerator, logger).parse();
    new ExcelGenerator(excel, logger, promisify).generate(rowReports);
}

main();