export interface IPromisify {
    promisifyReadlineQuestion: (fn: (query: string, callback: (answer: string) => void) => void) => Promise<(question: string) => {}>;
    promisifyExcelWrite: (fn: (reportName: string) => void) => Promise<(reportName: string) => void>;
}