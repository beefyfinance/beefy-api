import { getValidatorPerformance, ValidatorPerformance } from './validators';

const TIMEOUT = 5 * 60 * 1000;

export const validatorPerformance = async ctx => {
  try {
    ctx.request.socket.setTimeout(TIMEOUT);
    const validatorPerformance: ValidatorPerformance | undefined = await getValidatorPerformance();

    if (!validatorPerformance) {
      throw 'There is no validator performance data yet';
    }
    ctx.status = 200;
    ctx.body = validatorPerformance;
  } catch (e) {
    ctx.throw(500, e);
  }
};
