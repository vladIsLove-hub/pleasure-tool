import { IStoreCLI, StoreItem } from "./types/storeCLI.types";

class StoreCLI implements IStoreCLI {
    private store: Array<StoreItem>;
    constructor() {
        this.store = [];
    }

    public async push(item: StoreItem): Promise<void> {
        this.store.push(item);
    }

    public async getStore(): Promise<StoreItem[]> {
        return this.store;
    }
}

export default new StoreCLI();