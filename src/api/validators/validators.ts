import { getKey, setKey } from '../../utils/cache';
import { validatorStructure } from './validatorStructure';

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
  console.log('> updating validator performance');
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
        console.error(`> ${Object.keys(validatorStructure)[i]} validator fetch failed`);
      }
    });
    console.log('> updated validator performance');
    saveToRedis();
  } catch (e) {
    console.error('> validator performance initialization failed', e);
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
