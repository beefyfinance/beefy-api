import { BigNumberish, toBigNumber } from '../../../utils/big-number';
import { isDefined } from '../../../utils/array';
import { toNumber } from '../../../utils/number';
import getApyBreakdown, { ApyBreakdownResult } from './getApyBreakdown';

export interface ApyBreakdownFromInput {
  oracleId: string;
  address?: string | null | undefined;
  beefyFee?: BigNumberish | null | undefined;
  tradingApr?: BigNumberish | null | undefined;
  farmApr?: BigNumberish | null | undefined;
  liquidStakingApr?: BigNumberish | null | undefined;
  composablePoolApr?: BigNumberish | null | undefined;
  clmApr?: BigNumberish | null | undefined;
  merklApr?: BigNumberish | null | undefined;
  providerFee?: BigNumberish | null | undefined;
}

type ApyBreakdownParameters = Parameters<typeof getApyBreakdown>;

function set<O extends Record<string, unknown>>(
  input: O | undefined | null,
  key: keyof O,
  value: O[keyof O]
): O {
  const ref = input ?? ({} as O);
  ref[key] = value;
  return ref;
}

function push<T extends unknown[]>(input: T | undefined | null, value: T[number]): T {
  const ref = input ?? ([] as T);
  ref.push(value);
  return ref;
}

export const getApyBreakdownFrom = (inputs: ApyBreakdownFromInput[]): ApyBreakdownResult => {
  if (inputs.length === 0) {
    console.warn('getApyBreakdownFrom called with empty inputs array.');
    return { apys: {}, apyBreakdowns: {} };
  }

  const params: ApyBreakdownParameters = inputs.reduce(
    (acc, input) => {
      // tradingApr input looks up by pool.address so use oracleId as fallback
      const address = input.address ?? input.oracleId;
      // pools
      acc[0].push({
        name: input.oracleId,
        address,
        beefyFee: isDefined(input.beefyFee) ? toNumber(input.beefyFee) : undefined,
      });
      // tradingAprs
      if (isDefined(input.tradingApr)) {
        acc[1] = set(acc[1], address, toBigNumber(input.tradingApr));
      }
      // farmAprs
      acc[2] = push(acc[2], isDefined(input.farmApr) ? toBigNumber(input.farmApr) : undefined);
      // providerFee
      if (typeof acc[3] !== 'number') {
        acc[3] = push(
          acc[3],
          isDefined(input.providerFee) ? toBigNumber(input.providerFee) : undefined
        );
      }
      // liquidStakingAprs
      acc[4] = push(
        acc[4],
        isDefined(input.liquidStakingApr) ? toNumber(input.liquidStakingApr) : undefined
      );
      // composablePoolAprs
      acc[5] = push(
        acc[5],
        isDefined(input.composablePoolApr) ? toNumber(input.composablePoolApr) : undefined
      );
      // clmAprs
      acc[6] = push(acc[6], isDefined(input.clmApr) ? toNumber(input.clmApr) : undefined);
      // merklAprs
      acc[7] = push(acc[7], isDefined(input.merklApr) ? toNumber(input.merklApr) : undefined);

      return acc;
    },
    [
      [],
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    ] as ApyBreakdownParameters
  );

  return getApyBreakdown(...params);
};
