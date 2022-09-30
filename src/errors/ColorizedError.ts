import chalk from "chalk";

export default class ColorizedError extends Error {
    constructor() { 
        super();
        this.name = chalk.bold.red(this.constructor.name);
        if (!process.argv.some(x => x === 'verbose')) {
            this.stack = undefined;
        }
    }
}