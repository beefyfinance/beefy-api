import type { ApyBreakdownResult } from './common/getApyBreakdown.ts';

export function getApys(): ApyBreakdownResult;

export function getBoostAprs(): Record<string, number>;

export function initApyService(): Promise<void>;
