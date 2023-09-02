import { fetchEthValidatorTotalPerformance } from '../../utils/fetchEthValidatorData';
import { fetchFtmValidatorTotalPerformance } from '../../utils/fetchFtmValidatorData';
import { getKey, setKey } from '../../utils/cache';
import { DailyBifiBuybackStats } from '../stats/bifibuyback/getBifiBuyback';

export interface ValidatorPerformance {
  eth: string | null;
  ftm: string | null;
  fuse: string | null;
}

const ETH_PERFORMANCE_KEY = 'VALIDATOR_PERFORMANCE';
const INIT_DELAY = Number(process.env.BUYBACK_INIT_DELAY || 40 * 1000);
const REFRESH_INTERVAL = 15 * 60 * 1000;

const getEthValidatorPerformance = async () => {
  const ethPerformance = await fetchEthValidatorTotalPerformance();
  return ethPerformance.totalPerformanceEther ?? null;
};

const getFtmValidatorPerformance = async () => {
  const ftmPerformance = await fetchFtmValidatorTotalPerformance();
  return ftmPerformance.totalPerformanceEther ?? null;
};

const getFuseValidatorPerformance = async () => {
  return null;
};

let validatorPerformance: ValidatorPerformance | undefined = undefined;

const updateValidatorPerformance = async () => {
  console.log('> updating validator performance');
  try {
    validatorPerformance = {
      eth: await getEthValidatorPerformance(),
      ftm: await getFtmValidatorPerformance(),
      fuse: await getFuseValidatorPerformance(),
    };
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
