import { IStoreCLI, StoreCLINames, StoreItem } from './types/store-cli.types';

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

	public async getStoreCLINames(): Promise<StoreCLINames> {
		return {
			overwork: 'overwork',
			reportName: 'reportName'
		};
	}
}

export default new StoreCLI();