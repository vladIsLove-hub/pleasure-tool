import pleasureConfig from '../../pleasure.config.json';
import pleasureConfigValidator from './pleasure.config-validator';
import { PleasureConfig } from './types/pleasure.config.types';

const getPleasureConfig = (): PleasureConfig => {
	const parsedPleasureConfig = JSON.parse(JSON.stringify(pleasureConfig));
	pleasureConfigValidator.validate(parsedPleasureConfig);
	return parsedPleasureConfig;
}

export default getPleasureConfig();