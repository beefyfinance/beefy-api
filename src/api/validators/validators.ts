import { getKey, setKey } from '../../utils/cache';
import { validatorStructure } from './validatorStructure';

export interface ValidatorPerformance {
  eth?: string;
  ftm?: string;
  fuse?: string;
}

const ETH_PERFORMANCE_KEY = 'VALIDATOR_PERFORMANCE';
const INIT_DELAY = Number(process.env.BUYBACK_INIT_DELAY || 40 * 1000);
const REFRESH_INTERVAL = 15 * 60 * 1000;

let validatorPerformance: ValidatorPerformance | undefined = undefined;

const updateValidatorPerformance = async () => {
  console.log('> updating validator performance');
  try {
    if (validatorPerformance === undefined) validatorPerformance = {};
    const settledPromises = await Promise.allSettled(
      Object.values(validatorStructure).map(val => val.validatorFunctionName())
    );
    settledPromises.forEach((settledPromise, i) => {
      if (settledPromise.status === 'fulfilled' && settledPromise.value !== null) {
        validatorPerformance[Object.keys(validatorStructure)[i]] = {
          performance: settledPromise.value.totalPerformanceEther,
          lastUpdate: Date.now(),
        };
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
  const cachedValidatorPerformance = await getKey<ValidatorPerformance>(ETH_PERFORMANCE_KEY);
  validatorPerformance = cachedValidatorPerformance ?? undefined;
  setTimeout(updateValidatorPerformance, INIT_DELAY);
};

const saveToRedis = async () => {
  await setKey(ETH_PERFORMANCE_KEY, validatorPerformance);
};

export const getValidatorPerformance = (): ValidatorPerformance | undefined => {
  return validatorPerformance;
};
