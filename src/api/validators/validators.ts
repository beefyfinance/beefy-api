import { getKey, setKey } from '../../utils/cache';
import { getLoggerFor } from '../../utils/logger/index.js';
import { validatorStructure } from './validatorStructure';

const logger = getLoggerFor({ module: 'validators' });

export interface FetchValidatorPerformanceResponse {
  totalPerformanceEther: string;
}
interface ValidatorPerformance {
  performance: string;
  lastUpdate: number;
}
export interface ValidatorsPerformance {
  eth?: ValidatorPerformance;
  ftm?: ValidatorPerformance;
  fuse?: ValidatorPerformance;
}

const ETH_PERFORMANCE_KEY = 'VALIDATOR_PERFORMANCE';
const INIT_DELAY = Number(process.env.BUYBACK_INIT_DELAY || 40 * 1000);
const REFRESH_INTERVAL = 15 * 60 * 1000;

let validatorPerformance: ValidatorsPerformance = {};

const updateValidatorPerformance = async () => {
  logger.debug('updating validator performance');
  try {
    const settledPromises = await Promise.allSettled(
      Object.values(validatorStructure).map(val => val.validatorFunctionName())
    );
    settledPromises.forEach((settledPromise, i) => {
      if (settledPromise.status === 'fulfilled') {
        validatorPerformance[Object.keys(validatorStructure)[i]] = {
          performance: settledPromise.value.totalPerformanceEther,
          lastUpdate: Date.now(),
        };
      } else {
        logger.warn(
          { validator: Object.keys(validatorStructure)[i], err: settledPromise.reason },
          'validator fetch failed'
        );
      }
    });
    logger.info('updated validator performance');
    saveToRedis();
  } catch (e) {
    logger.error({ err: e }, 'validator performance initialization failed');
  }
  setTimeout(updateValidatorPerformance, REFRESH_INTERVAL);
};

export const initValidatorPerformanceService = async () => {
  const cachedValidatorPerformance = await getKey<ValidatorsPerformance>(ETH_PERFORMANCE_KEY);
  validatorPerformance = cachedValidatorPerformance ?? {};
  setTimeout(updateValidatorPerformance, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey(ETH_PERFORMANCE_KEY, validatorPerformance);
};

export const getValidatorPerformance = (): ValidatorsPerformance | undefined => {
  return validatorPerformance;
};
