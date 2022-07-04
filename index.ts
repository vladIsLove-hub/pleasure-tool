import Parser from './src/parser/Parser';
import reportGenerator from './src/report-generator/ReportGenerator';
import excelGenerator from './src/core/ExcelGenerator';
import logger from './src/logger/Logger';

const main = async () => {
    const rowReports = await new Parser(reportGenerator, logger).parse();
    excelGenerator.generate(rowReports);
}

main();