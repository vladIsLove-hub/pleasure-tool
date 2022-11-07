const fs = require('node:fs/promises');

const relativePathToLib = './lib';

(async () => {
	try {
		await fs.rm(relativePathToLib, { force: true, recursive: true });
	} catch (e) {
		if (e instanceof Error) {
			throw new Error(e.message);
		}
	}
})();