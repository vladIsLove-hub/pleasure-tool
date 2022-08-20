export type StoreItem = {
    [key: string]: string | number;
}

export interface IStoreCLI {
    push: (item: StoreItem) => Promise<void>; 
}