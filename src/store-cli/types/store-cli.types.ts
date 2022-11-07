export type StoreItem = {
    [key: string]: string | number;
}

export type StoreCLINames = {
    overwork: 'overwork',
    reportName: 'reportName'
}

export interface IStoreCLI {
    push: (item: StoreItem) => Promise<void>;
    getStore: () => Promise<StoreItem[]>;
    getStoreCLINames: () => Promise<StoreCLINames>;
}