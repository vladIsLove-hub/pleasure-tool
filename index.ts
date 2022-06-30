import { toExcel } from './src/core/excel';
import Parser from './src/parser/Parser';

(async () => {
    const rowReports = await new Parser().parse();
    toExcel(rowReports);
})()