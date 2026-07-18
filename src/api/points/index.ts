import { getAllPointsStructures } from './getPointsStructures';
import { getLoggerFor } from '../../utils/logger/index.js';

const logger = getLoggerFor({ module: 'points' });

export const pointStructures = async (ctx: any) => {
  try {
    const allPointsStructures = getAllPointsStructures();
    ctx.status = 200;
    ctx.body = [...allPointsStructures];
  } catch (err) {
    logger.warn({ err }, 'points structures request failed');
    ctx.status = 500;
  }
};
