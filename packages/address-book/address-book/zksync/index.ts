import { beefyfinance } from './platforms/beefyfinance';
import { velocore } from './platforms/velocore';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _zksync = {
  platforms: {
    beefyfinance,
    velocore,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const zksync: ConstInterface<typeof _zksync, Chain> = _zksync;
