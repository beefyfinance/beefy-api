import { getKey, setKey } from '../../utils/cache';
import { getPointsStructures } from './fetchPointsData';
import { PointsStructure } from './types';

const REDIS_KEY = 'POINTS_STRUCTURES';

const INIT_DELAY = Number(process.env.POINTS_STRUCTURES_INIT_DELAY || 20 * 1000);
const REFRESH_INTERVAL = 4 * 60 * 60 * 1000;

let pointsStructures: PointsStructure[] = [];

export const getAllPointsStructures = () => {
  return pointsStructures;
};

export async function updatePointsStructures() {
  console.log('> updating pointsStructures');
  const start = Date.now();
  try {
    pointsStructures = await getPointsStructures();
    await saveToRedis();

    console.log(`> updated pointsStructures (${(Date.now() - start) / 1000}s)`);
  } catch (err) {
    console.error(err);
  }
  setTimeout(updatePointsStructures, REFRESH_INTERVAL);
}

async function loadFromRedis() {
  const cachedPointsStructures = await getKey<PointsStructure[]>(REDIS_KEY);

  if (cachedPointsStructures && typeof cachedPointsStructures === 'object') {
    pointsStructures = cachedPointsStructures;
  }
}

async function saveToRedis() {
  await setKey(REDIS_KEY, pointsStructures);
}

export async function initPointsStructureService() {
  await loadFromRedis();
  setTimeout(updatePointsStructures, INIT_DELAY);
}
