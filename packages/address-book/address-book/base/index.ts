import { beefyfinance } from './platforms/beefyfinance';
import { balancer } from './platforms/balancer';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _base = {
  platforms: {
    beefyfinance,
    balancer,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const base: ConstInterface<typeof _base, Chain> = _base;
