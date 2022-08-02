import excel from 'excel4node';
import path from 'path';

class ExcelGenerator {
  constructor(excel) {
    this.excel = excel;
    this.workbook = new excel.Workbook();
    this.worksheet = this.workbook.addWorksheet('Reports');
    this.styles = this.workbook.createStyle({
      font: {
        size: 14,
      },
    });
    this.reportName = this.getReportName();
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
  
    this.workbook.write(this.reportName);
  }

  async createDefaultHeaders() {
    this.worksheet.cell(1, 1).string('ETSI_OneDayTaskReportTemplate');
    this.worksheet.cell(2, 1).string('Project-Task').style(this.styles);
    this.worksheet.cell(2, 2).string('Effort').style(this.styles);
    this.worksheet.cell(2, 3).string('Description').style(this.styles);
    this.worksheet.cell(2, 4).string('Date').style(this.styles);
  }

  getReportName() {
    let passedReportName = process.argv[2];
    const defaultReportName = '../Reports.xlsx';

    if (!passedReportName || passedReportName === '%npm_config_name%') {
      return defaultReportName;
    } else {
      const extName = path.extname(passedReportName)
      if (extName) {
        passedReportName = passedReportName.replace(extName, '');
      }

      return `../${passedReportName}.xlsx`;
    }
  }
}

export default new ExcelGenerator(excel);