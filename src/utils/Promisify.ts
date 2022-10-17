import { IPromisify } from "./types/promisify.types";

class Promisify implements IPromisify {
	public async promisifyReadlineQuestion(fn: (query: string, callback: (answer: string) => void) => void): Promise<(question: string) => Promise<string>> {
		return async (question: string): Promise<string> => {
			return new Promise(async (resolve) => {
				fn(question, (answer: string) => {
					resolve(answer);
				});
			});
		}
	}

	public async promisifyExcelWrite(fn: (reportName: string) => void): Promise<(reportName: string) => Promise<void>> {
		return async (reportName: string): Promise<void> => {
			return new Promise(async (resolve) => {
				fn(reportName)
				resolve();
			});
		}
	}
}

export default new Promisify();