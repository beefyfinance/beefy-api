import { PointsStructure } from './types';

export const getPointsStructures = async (): Promise<PointsStructure[]> => {
  const endpoint = `https://raw.githubusercontent.com/beefyfinance/beefy-v2/prod/src/config/points.json`;
  const response = await fetch(endpoint);
  if (response.status !== 200) {
    throw new Error(`Failed to fetch point structures: ${response.status} ${response.statusText}`);
  }

  const pointStructures = await response.json();
  if (!pointStructures || !Array.isArray(pointStructures)) {
    throw new Error(`Invalid point structure data`);
  }

  return pointStructures as PointsStructure[];
};
