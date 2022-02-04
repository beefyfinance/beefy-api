import { beefyfinance } from './platforms/beefyfinance';
import { trisolaris } from './platforms/trisolaris';
import { auroraswap } from './platforms/auroraswap';
import { tokens } from './tokens/tokens';
import { convertSymbolTokenMapToAddressTokenMap } from '../../util/convertSymbolTokenMapToAddressTokenMap';
import Chain from '../../types/chain';
import { ConstInterface } from '../../types/const';

const _aurora = {
  platforms: {
    beefyfinance,
    trisolaris,
    auroraswap,
  },
  tokens,
  tokenAddressMap: convertSymbolTokenMapToAddressTokenMap(tokens),
} as const;

export const aurora: ConstInterface<typeof _aurora, Chain> = _aurora;
