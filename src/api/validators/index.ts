import { getValidatorPerformance, ValidatorPerformance } from './validators';

export const validatorPerformance = ctx => {
  try {
    const validatorPerformance: ValidatorPerformance | undefined = getValidatorPerformance();

    if (!validatorPerformance) {
      throw 'There is no validator performance data yet';
    }
    ctx.status = 200;
    ctx.body = validatorPerformance;
  } catch (e) {
    ctx.throw(500, e);
  }
};
