import { toExcel } from './src/core/excel';
import { parser } from './src/parser/parser';

(async () => {
    const rowReports = await parser();
    toExcel(rowReports);
})()