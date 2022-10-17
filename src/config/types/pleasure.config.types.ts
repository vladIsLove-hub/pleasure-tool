export interface IPleasureConfigValidator {
  validate: (config: PleasureConfig) => void;
}

type ProjectTypes = {
  [type: string]: {
    max: number;
    keywords: string[];
  }
}

type Times = {
  totalWorkHoursPerDay: number;
  timeUnitInHours: number;
}

export type PleasureConfig = {
  projectTypes: ProjectTypes;
  times: Times;
}