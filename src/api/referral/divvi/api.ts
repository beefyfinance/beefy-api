import { createFactory } from '../../../utils/factory.js';
import { DivviApi } from './DivviApi.js';

export const getDivviApi = createFactory(() => {
  const apiKey = process.env.DIVVI_API_KEY;
  if (!apiKey) {
    throw new Error('DIVVI_API_KEY is not set in the environment variables.');
  }
  return new DivviApi('https://api.divvi.xyz', apiKey);
});
