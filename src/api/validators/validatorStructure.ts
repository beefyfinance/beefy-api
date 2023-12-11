import { fetchEthValidatorTotalPerformance } from './fetchEthValidatorData';
import { fetchFtmValidatorTotalPerformance } from './fetchFtmValidatorData';
import { fetchFuseValidatorTotalPerformance } from './fetchFuseValidatorData';

export const validatorStructure = {
  eth: {
    validatorFunctionName: fetchEthValidatorTotalPerformance,
  },
  ftm: {
    validatorFunctionName: fetchFtmValidatorTotalPerformance,
  },
  fuse: {
    validatorFunctionName: fetchFuseValidatorTotalPerformance,
  },
};
