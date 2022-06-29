import './excel';
import excel from 'excel4node';

const workbook = new excel.Workbook();
const worksheet = workbook.addWorksheet('Reports');

const style = workbook.createStyle({
  font: {
    size: 14,
  },
});

// Default values
worksheet.cell(1, 1).string('ETSI_OneDayTaskReportTemplate');
worksheet.cell(2, 1).string('Project-Task').style(style);
worksheet.cell(2, 2).string('Effort').style(style);
worksheet.cell(2, 3).string('Description').style(style);
worksheet.cell(2, 4).string('Date').style(style);

worksheet.cell(3, 1).string('PBI Desktop, Build and Accessibility.Code Review').style(style);
worksheet.cell(3, 2).number(3.5).style(style);
worksheet.cell(3, 3).string('CodeReview').style(style);
worksheet.cell(3, 4).date('6/15/2022').style(style);


export const toExcel = async (rowReports) => {
  let i = 3
  for (const rowReport of rowReports) {
    worksheet.cell(i, 1).string(rowReport.reportType).style(style);
    worksheet.cell(i, 2).number(rowReport.effortTime).style(style);
    worksheet.cell(i, 3).string(rowReport.description).style(style);
    worksheet.cell(i, 4).date(rowReport.date).style(style);
    i++;
  }

  workbook.write('../Reports.xlsx');
}