import chalk from 'chalk';
import path from 'path';
import storeCLI from '../store-cli/StoreCLI';
class ExcelGenerator {
  constructor(excel, logger, promisify) {
    this.excel = excel;
    this.workbook = new excel.Workbook();
    this.worksheet = this.workbook.addWorksheet('Reports');
    this.styles = this.workbook.createStyle({
      font: {
        size: 14,
      },
    });
    this.reportName;
    this.logger = logger;
    this.promisify = promisify;
    this.setReportName();
  }

  async generate(rowReports) {
    await this.createDefaultHeaders();

    let rowIndex = 3
    for (const rowReport of rowReports) {
      const currentDate = new Date(rowReport.date);
      currentDate.setDate(currentDate.getDate() + 1);
      this.worksheet.cell(rowIndex, 1).string(rowReport.reportType).style(this.styles);
      this.worksheet.cell(rowIndex, 2).number(rowReport.effortTime).style(this.styles);
      this.worksheet.cell(rowIndex, 3).string(rowReport.description).style(this.styles);
      this.worksheet.cell(rowIndex, 4).date(currentDate).style(this.styles);
      rowIndex++;
    }

    const excelWriteAsync = await this.promisify.promisifyExcelWrite(this.workbook.write.bind(this.workbook));

    try {
      await excelWriteAsync(this.reportName);
    } catch (e) {
      this.logger.error(e);
    }

    this.logger.success(`The excel file was generated successfully with the name: ${path.basename(this.reportName)}`)
  }

  async createDefaultHeaders() {
    this.worksheet.cell(1, 1).string('ETSI_OneDayTaskReportTemplate');
    this.worksheet.cell(2, 1).string('Project-Task').style(this.styles);
    this.worksheet.cell(2, 2).string('Effort').style(this.styles);
    this.worksheet.cell(2, 3).string('Description').style(this.styles);
    this.worksheet.cell(2, 4).string('Date').style(this.styles);
  }

  setReportName() {
    storeCLI.getStore().then(storeItems => {
      let cliReportNameOption = storeItems.find(cliOption => cliOption.optionName === 'reportName');
      if (!cliReportNameOption) {
        this.logger.error('reportName CLI option was not provided. Check out README.md');
      } else {
        let reportName = String(cliReportNameOption.answer);
        const extName = path.extname(reportName);
        if (extName) {
          reportName = reportName.replace(extName, '');
        }
        this.reportName = `../${reportName}.xlsx`;
      }
    })
  }
}

export default ExcelGenerator;