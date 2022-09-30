import ColorizedError from "./ColorizedError";

export default class ProjectTypesFormatError extends ColorizedError {
    constructor(key) { 
        super();
        this.message = `Wrong <project.types.json> config format, for project type: ${key}. Read README.md`;
    }
}