import { ApyBreakdown } from './common/getApyBreakdown';

export function getApys(): {
  apys: Record<string, number>;
  apyBreakdowns: Record<string, ApyBreakdown>;
};

export function getBoostAprs(): Record<string, number>;

export function initApyService(): Promise<void>;
