export interface IReadlineValidator {
    validate: (optionName: string, answer: string) => Promise<void>;
}

export interface IReadlineCLIOptionsValidator extends IReadlineValidator {
    validate: () => Promise<void>;
}