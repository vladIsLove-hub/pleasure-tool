import Parser from './src/parser/Parser';
import reportGenerator from './src/report-generator/ReportGenerator';
import excelGenerator from './src/core/ExcelGenerator';

const main = async () => {
    const rowReports = await new Parser(reportGenerator).parse();
    excelGenerator.generate(rowReports);
}

main();