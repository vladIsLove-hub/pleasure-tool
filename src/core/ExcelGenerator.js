import path from 'path';
import { errors, successes } from '../messages';
import storeCLI from '../store-cli/StoreCLI';
class ExcelGenerator {
	constructor(excel, logger, promisify) {
		this.excel = excel;
		this.workbook = new excel.Workbook();
		this.worksheet = this.workbook.addWorksheet('Reports');
		this.logger = logger;
		this.promisify = promisify;
		this.setReportName();
	}

	async generate(reports) {
		await this.createDefaultHeaders();

		let rowIndex = 3
		for (const report of reports) {
			const currentDate = new Date(report.date);
			currentDate.setDate(currentDate.getDate() + 1);
			this.worksheet.cell(rowIndex, 1).string(report.reportType);
			this.worksheet.cell(rowIndex, 2).number(report.effortTime);
			this.worksheet.cell(rowIndex, 3).string(report.description)
			this.worksheet.cell(rowIndex, 4).date(currentDate);
			rowIndex++;
		}

		const excelWriteAsync = await this.promisify.promisifyExcelWrite(this.workbook.write.bind(this.workbook));

		try {
			await excelWriteAsync(this.reportName);
		} catch (e) {
			this.logger.explicitError(e);
			process.exit();
		}

		this.logger.success(successes.ExcelGenerated, path.basename(this.reportName));
	}

	async createDefaultHeaders() {
		this.worksheet.cell(1, 1).string('ETSI_OneDayTaskReportTemplate');
		this.worksheet.cell(2, 1).string('Project-Task');
		this.worksheet.cell(2, 2).string('Effort');
		this.worksheet.cell(2, 3).string('Description');
		this.worksheet.cell(2, 4).string('Date');
	}

	setReportName() {
		storeCLI.getStore().then(storeItems => {
			let cliReportNameOption = storeItems.find(cliOption => cliOption.optionName === 'reportName');
			if (!cliReportNameOption) {
				this.logger.error(errors.CLIOptionNotProvided, "reportName");
				process.exit();
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